import math

def calculate_slew_cost(current_az: float, current_alt: float, target_az: float, target_alt: float) -> float:
    """Calculates slew time penalty (seconds) based on mount motor speeds."""
    az_slew_rate = 3.0   # degrees per second
    alt_slew_rate = 2.0  # degrees per second
    
    # Calculate shortest angular distance on azimuth ring
    az_diff = abs(target_az - current_az) % 360
    if az_diff > 180:
        az_diff = 360 - az_diff
        
    alt_diff = abs(target_alt - current_alt)
    
    # Slew time is governed by the slower axis movement
    slew_time_sec = max(az_diff / az_slew_rate, alt_diff / alt_slew_rate)
    return slew_time_sec


def optimize_queue(
    targets: list[dict], 
    current_position: dict = None, 
    slew_weight: float = 0.4
) -> list[dict]:
    """Optimizes observation queue considering target priority, slew matrix costs, and altitude.
    
    Args:
        targets: List of target dictionaries containing priority, alt, az, and start_time.
        current_position: Dict with 'az' and 'alt' of current telescope pointing.
        slew_weight: Penalty weighting factor for slew distances (higher = favor closer targets).
        
    Returns:
        Optimized list of target dictionaries sorted by dynamic execution score.
    """
    if not targets:
        return []

    # Default observatory home/zenith pointing if no current position supplied
    pos = current_position or {'az': 0.0, 'alt': 90.0}
    
    def target_score(target: dict) -> float:
        priority = float(target.get('priority', 1))
        target_alt = float(target.get('alt', 45.0))
        target_az = float(target.get('az', 0.0))
        
        # 1. Hard filter: Ignore targets below horizon (e.g., ALT < 15 degrees)
        if target_alt < 15.0:
            return -9999.0
        
        # 2. Compute slew penalty (slew cost in seconds converted to score penalty)
        slew_time = calculate_slew_cost(pos['az'], pos['alt'], target_az, target_alt)
        slew_penalty = (slew_time / 60.0) * slew_weight  # Normalized to minutes
        
        # 3. Altitude bonus (prefer targets higher in the sky / lower airmass)
        airmass_bonus = (target_alt / 90.0) * 0.5
        
        # Composite optimization score (Higher = Execute Next)
        total_score = priority - slew_penalty + airmass_bonus
        return total_score

    # Sort queue descending by composite score
    optimized = sorted(targets, key=target_score, reverse=True)
    
    # Attach calculated execution score for transparency
    for t in optimized:
        t['optimization_score'] = round(target_score(t), 3)

    return optimized