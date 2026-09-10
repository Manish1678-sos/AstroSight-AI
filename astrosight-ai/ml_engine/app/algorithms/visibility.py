from datetime import datetime, timezone
import math
from astropy.coordinates import AltAz, EarthLocation, SkyCoord
from astropy.time import Time
import astropy.units as u


def calculate_visibility(
    ra_deg: float, 
    dec_deg: float, 
    latitude: float, 
    longitude: float, 
    elevation_m: float = 0.0, 
    observation_time: datetime | str | float | Time | None = None
) -> dict:
    """Calculates apparent horizontal coordinates (Alt/Az), atmospheric refraction,
    and airmass for an astronomical target.
    
    Args:
        ra_deg: Right Ascension in decimal degrees.
        dec_deg: Declination in decimal degrees.
        latitude: Observer latitude in degrees.
        longitude: Observer longitude in degrees.
        elevation_m: Observer height above sea level in meters.
        observation_time: Observation timestamp (datetime, ISO string, or Astropy Time).
        
    Returns:
        Dict containing altitude, azimuth, refraction-corrected airmass, and observability status.
    """
    # 1. Observer site location
    location = EarthLocation(
        lat=latitude * u.deg, 
        lon=longitude * u.deg, 
        height=elevation_m * u.m
    )
    
    # 2. Parse observation time
    if observation_time is None:
        timestamp = Time.now()
    elif isinstance(observation_time, Time):
        timestamp = observation_time
    elif isinstance(observation_time, datetime):
        if observation_time.tzinfo is None:
            observation_time = observation_time.replace(tzinfo=timezone.utc)
        timestamp = Time(observation_time)
    else:
        timestamp = Time(observation_time)

    # 3. Barometric pressure estimate for atmospheric refraction modeling
    # Standard pressure formula: P = 1013.25 * e^(-height / 8200)
    pressure_mbar = 1013.25 * math.exp(-elevation_m / 8200.0)

    # 4. Define AltAz frame WITH atmospheric refraction enabled
    altaz_frame = AltAz(
        obstime=timestamp, 
        location=location,
        pressure=pressure_mbar * u.mbar,
        temperature=15.0 * u.deg_C,
        relative_humidity=0.5
    )

    # 5. Coordinate transformation
    target = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame='icrs')
    horizontal = target.transform_to(altaz_frame)

    altitude = float(horizontal.alt.deg)
    azimuth = float(horizontal.az.deg)

    # 6. Safe airmass calculation
    if altitude > 1.0:
        # AstroPy secz handles zenith angle secant X = 1 / cos(z)
        airmass_val = float(horizontal.secz.value)
        airmass = min(max(airmass_val, 1.0), 10.0)  # Clamp realistic range
    else:
        airmass = None

    # 7. Observability check (Altitude >= 30° -> Airmass <= 2.0)
    is_observable = altitude >= 30.0 and (airmass is not None and airmass <= 2.0)

    return {
        'altitude_deg': round(altitude, 4),
        'azimuth_deg': round(azimuth, 4),
        'airmass': round(airmass, 4) if airmass is not None else None,
        'is_observable': is_observable,
        'timestamp_utc': timestamp.utc.iso
    }