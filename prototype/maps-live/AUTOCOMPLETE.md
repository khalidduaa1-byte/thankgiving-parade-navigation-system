# Address suggestions setup

The live-map prototype now uses the Google Places Autocomplete Data API for the **From**, **To**, and **My location** fields. This is a browser UI integration, not an MCP connection.

## Google Cloud setup

In the project that owns your browser API key:

1. Enable **Maps JavaScript API** and **Places API (New)**. Keep the routing APIs required by the existing prototype enabled.
2. Confirm billing is active.
3. If the key has API restrictions, allow Maps JavaScript API and Places API (New), as well as the APIs already needed for routing.
4. If it has website restrictions, allow the actual origin serving the prototype, such as `http://localhost:8765/*`. Add the deployed HTTPS hostname if applicable. Do not remove restrictions just to make a demo work.
5. Keep the key in the ignored `config.js` and restart/reload the local page. No key is included in this change.

The code loads the `places` library with `google.maps.importLibrary('places')`. It uses `AutocompleteSuggestion.fetchAutocompleteSuggestions`, session tokens, and Place details on selection. It does not use the legacy Autocomplete service. [Google documentation](https://developers.google.com/maps/documentation/javascript/place-autocomplete-data).

## Expected behavior

- Type two or more characters; suggestions appear after a 250 ms debounce, biased toward NYC.
- Click/tap a result, or use Up/Down and Enter. Escape dismisses the list.
- A selection fills the address. The existing prototype behavior is retained: choosing **My location** sets the position and plans when a destination is present; changing **To** replans an active trip. Otherwise use **Plan**.
- Typing does not request GPS permission. The explicit GPS buttons and the GPS suggestion remain opt-in controls.
- The suggestion panel is attached to the document body so the map panel cannot clip it.
- Slow responses for old text cannot replace newer results. Leaving the field dismisses pending results.
- If Places is unavailable or no result matches, an inline message appears. Manual address entry remains available; resolving that address still depends on the existing routing/geocoding setup.

## Verification

Local checks exercise the autocomplete controller with mocked Google responses: keyboard/click selection, stale-response rejection, permission/API failure messaging, no-result behavior, and focus cancellation. They do not prove the project's live API enablement, billing, website restrictions, or real Google predictions. Complete a live smoke test with the configured browser key before claiming the deployed issue is resolved.
