# Parade Pilot — Thanksgiving Parade Navigation System

A workshop project exploring trip-specific disruption alerts for New Yorkers traveling during the Macy’s Thanksgiving Day Parade.

The intended product is assistance inside Google Maps: identify a disruption that affects the traveler, explain its impact, and offer an actionable alternative. Native Google Maps integration requires supported host access; the current code is a standalone workshop demo.

## Try the demo

The hosted test link is being published and will be added here once deployment succeeds.

- [Live-map prototype and local setup](prototype/README.md)
- [Address suggestions setup and troubleshooting](prototype/maps-live/AUTOCOMPLETE.md)
- [Scripted walkthrough](prototype/scripted/parade-pilot.html)

The demo uses Google Maps route candidates where configured. Parade geometry, closures, transit delays, and ride booking are simulated. It is not an official Google Maps feature or a source of live safety or navigation guidance.

## Product documents

- [PRD: user experience, alert rules, and acceptance criteria](PRD.md)
- [MCP/API integration plan](docs/INTEGRATIONS.md)

The product framework covers customer journey, distribution, value, and control and safeguards.

## Development

Follow the [prototype setup instructions](prototype/README.md). Address suggestions require **Places API (New)** in addition to Maps JavaScript API and the routing APIs used by the prototype. Keep keys in the ignored local configuration or deployment environment, with appropriate API and website restrictions.

Run autocomplete checks with:

```sh
node --test prototype/maps-live/autocomplete.test.cjs
```
