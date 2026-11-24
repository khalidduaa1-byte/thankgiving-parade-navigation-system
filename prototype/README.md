# Parade Pilot prototypes

Workshop prototypes that illustrate the experience described in [PRD.md](../PRD.md). They are demos, not the product: the PRD's intended product is a native Google Maps feature, which needs host integration that does not exist here.

## `maps-live/` — live Google map with a "Parade mode" agent panel

- Real transit routes from the Google Routes API (falls back to the Maps JavaScript Directions service).
- The agent checks each route against the parade corridor, the balloon staging zone and simulated station closures, rejects unsafe options, and replans when you toggle a disruption in the "Live city feed" box.
- **Location:** three ways to set where the traveler is — "Use my location" / "Use GPS" (browser geolocation, opt-in), typing a place in "My location" (Geocoding API, falling back to the Routes API), or "Pick on map". While a trip is watched, it warns once near a closure and replans when the traveler is more than 200 m off the planned route. If location is denied, it plans from the typed address. Tick "Keep moving me with each map click" to simulate walking.
- Parade route geometry, closures and delays are simulated. Ride booking is simulated and is outside the PRD's first-release scope.

Run it:

```bash
cp prototype/maps-live/config.example.js prototype/maps-live/config.js   # then put your key in config.js
python3 -m http.server 8765 --directory prototype/maps-live
```

Open http://localhost:8765. The key needs the Maps JavaScript API and Routes API enabled; if it has website restrictions, allow `http://localhost:8765/*`. `config.js` is git-ignored — never commit a key.

## `scripted/parade-pilot.html` — click-through story

A self-contained, scripted walkthrough (no API key) of one trip: plan the night before, a station restriction, a delay that needs approval, and arrival. Open the file in a browser.
