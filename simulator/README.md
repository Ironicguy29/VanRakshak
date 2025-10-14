# Simulator README

## Setup
```powershell
cd C:\TheGuardianBand\simulator
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run
```powershell
# Default inside fence
python simulate.py --animalId GB-sim-0001 --period 2

# Force geofence breach behavior
python simulate.py --animalId GB-sim-0001 --period 2 --breach
```

## Options
- `--server` Base URL, default `http://localhost:3000`
- `--lat`, `--lon` Start position
- `--drift` Random walk magnitude (degrees)
- `--period` Seconds between posts
 