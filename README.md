🌌 AstroSight — Real-Time Observatory Dashboard & Engine
A real-time astronomical pipeline combining a React dashboard, a Node.js/Socket.IO streaming bridge, and an AstroPy / FastAPI calculation engine for sky radar tracking, atmospheric refraction solutions, and target airmass modeling.

⚡ Core Features
Alt-Az Sky Radar: Interactive polar grid tracking zenith, hour angles, and target coordinates.

Airmass & Refraction Engine: Live SVG airmass curves using Bennett’s refraction formula and the Young & Irvine model.

Instant Coordinate Solver: Dynamic trajectory updates when changing latitude, longitude, or elevation.

Transient Alert Stream: Real-time WebSocket broadcasting of Zwicky Transient Facility (ZTF) alerts.

Smart Queue Optimizer: Dynamic schedule re-ordering based on mount motor speeds (Az/Alt slew cost) and target altitude.

🚀 Quick Start
Run with Docker Compose
Bash
git clone https://github.com/your-org/astrosight.git
cd astrosight
docker-compose up --build
React Dashboard: http://localhost:3000

Node Streaming Bridge: http://localhost:4000

FastAPI Docs: http://localhost:8000/docs

📂 Project Structure
Plaintext
astrosight/
├── client/          # React UI Dashboard
├── node-server/     # Socket.IO & Express Bridge
├── python-engine/   # FastAPI, AstroPy, & LightGBM Engine
└── docker-compose.yml
📡 API Summary
POST /visibility — Calculates Alt/Az, refraction, and airmass.

POST /classify — Classifies transient light curve features.

POST /optimize-queue — Optimizes target queue by slew time and altitude.

WS transient:alert — Real-time stream of enriched ZTF candidate alerts.
