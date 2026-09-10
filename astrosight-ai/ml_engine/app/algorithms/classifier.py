def classify_light_curve(features: dict) -> dict:
    """Deterministic fallback classifier for astronomical light curves.
    
    Acts as a proxy model until the trained LightGBM artifact is mounted.
    Evaluates key photometric features (e.g., peak magnitude, rise/decay times, color indices)
    to return a predicted candidate class and calculated confidence score.
    """
    if not features:
        return {
            'label': 'Unknown / Unclassified',
            'confidence': 0.0,
            'features': {},
            'status': 'fallback_empty_features'
        }

    # Extract key photometric features with safe defaults
    amplitude = features.get('amplitude', 0.0)
    rise_time = features.get('rise_time_days', 0.0)
    color_bv = features.get('color_bv', 0.0)
    period = features.get('period_days', 0.0)

    # Rule-based fallback classification heuristics
    if period > 0.5:
        # Periodic variable star heuristic (e.g., Cepheid, RR Lyrae)
        label = 'Variable Star'
        confidence = min(0.92, 0.70 + (period / 100.0))
    elif rise_time > 0 and rise_time < 20:
        # Fast-rising optical transient (Type Ia Supernova candidate)
        label = 'Type Ia Supernova'
        confidence = 0.968 if amplitude > 1.5 else 0.842
    elif color_bv < 0.2:
        # Blue optical transient / Core-Collapse Supernova candidate
        label = 'Core-Collapse Supernova (Type II)'
        confidence = 0.885
    else:
        # Default fallback candidate
        label = 'Transient Candidate'
        confidence = 0.750

    return {
        'label': label,
        'confidence': round(confidence, 3),
        'features': features,
        'status': 'fallback_rule_engine'
    }