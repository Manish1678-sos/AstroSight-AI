from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

# Imports from your modules
from .algorithms.classification import classify_light_curve
from .algorithms.queue import optimize_queue
from .algorithms.visibility import calculate_visibility

app = FastAPI(
    title="AstroSight ML Engine",
    description="Real-time astronomical target visibility, queue optimization, and light curve classification API.",
    version="2.0.0",
)


# --- Request & Response Models ---

class VisibilityRequest(BaseModel):
    ra_deg: float = Field(..., ge=0.0, lt=360.0, description="Right Ascension in decimal degrees")
    dec_deg: float = Field(..., ge=-90.0, le=90.0, description="Declination in decimal degrees")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Observer latitude in degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Observer longitude in degrees")
    elevation_m: float = Field(default=0.0, ge=-500.0, le=9000.0, description="Elevation above sea level in meters")

    model_config = {
        "json_schema_extra": {
            "example": {
                "ra_deg": 283.396,
                "dec_deg": 33.029,
                "latitude": 60.4565,
                "longitude": 105.5689,
                "elevation_m": 19.0,
            }
        }
    }


class AlertRequest(BaseModel):
    alert: Dict[str, Any] = Field(..., description="Raw transient alert payload containing features and metadata")


class QueueOptimizationRequest(BaseModel):
    targets: list[Dict[str, Any]] = Field(..., description="List of observation target dictionaries")
    current_position: Optional[Dict[str, float]] = Field(
        default=None, 
        description="Current telescope pointing {'az': deg, 'alt': deg}"
    )
    slew_weight: float = Field(default=0.4, ge=0.0, le=2.0, description="Penalty weight for telescope movement")


# --- API Endpoints ---

@app.get("/health", status_code=status.HTTP_200_OK)
async def health() -> Dict[str, str]:
    """Health check endpoint for container orchestrators and load balancers."""
    return {
        "status": "nominal",
        "engine": "astropy-lightgbm-bridge",
        "version": "2.0.0",
    }


@app.post("/visibility", status_code=status.HTTP_200_OK)
async def get_visibility(request: VisibilityRequest) -> Dict[str, Any]:
    """Computes apparent horizon coordinates (Alt/Az), atmospheric refraction, and airmass."""
    try:
        return calculate_visibility(**request.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Visibility calculation failed: {str(e)}",
        )


@app.post("/classify", status_code=status.HTTP_200_OK)
async def classify_alert(request: AlertRequest) -> Dict[str, Any]:
    """Classifies astronomical alerts using the fallback rules engine or mounted ML models."""
    try:
        features = request.alert.get("features", request.alert)
        return classify_light_curve(features)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Classification failed: {str(e)}",
        )


@app.post("/optimize-queue", status_code=status.HTTP_200_OK)
async def optimize_observation_queue(request: QueueOptimizationRequest) -> list[Dict[str, Any]]:
    """Re-orders observation queue based on target priorities, altitude, and mount slew costs."""
    try:
        return optimize_queue(
            targets=request.targets,
            current_position=request.current_position,
            slew_weight=request.slew_weight,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Queue optimization failed: {str(e)}",
        )