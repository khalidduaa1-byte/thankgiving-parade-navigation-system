# Thanksgiving Parade Navigation System

## Product requirements: disruption assistance inside Google Maps

**Status:** Working draft — integration design and acceptance criteria are being completed.  
**Scope:** The 100th annual Macy’s Thanksgiving Day Parade in New York City.  
**Product direction:** A feature within the traveler’s existing Google Maps experience. No additional app, standalone website, or separate prototype is the intended product.  
**Framework:** Customer journey, distribution, value, and control and safeguards, from the workshop brief in [README.md](README.md).

## 1. Product decision and feasibility

Help a traveler answer three questions without leaving Google Maps: **Does this disruption affect me? What changes about my trip? What should I do next?**

The product monitors official disruption information against a trip the traveler has chosen to monitor. It surfaces a concise explanation and an actionable alternative inside route planning and navigation. Event information is useful only when it changes a travel decision.

This is a proposed native Google Maps integration, not an existing capability of this repository. Public Maps URLs launch map actions; cloud styling changes developer-controlled map presentations. Neither documented mechanism establishes permission to insert our controls into the consumer Google Maps app. Native trip access, UI placement, background events, notifications, and route changes require a supported integration agreement or implementation by the Google Maps product team. This is an engineering inference from the documented interfaces, not a claim that all private partner interfaces have been surveyed. [Maps URLs](https://developers.google.com/maps/documentation/urls/get-started), [cloud styling](https://developers.google.com/maps/documentation/maps-static/cloud-customization/json).

**Release gate:** Verify that native host integration exists and obtain the required access before promising a shippable in-app feature. If unavailable, deliver the requirements and backend integration work for review; do not silently replace the product with a separate app or a deep-link demo. Other map providers are a later expansion, each requiring its own supported integration.

## 2. Problem, audience, and scope

Parade-day travel combines planned street closures, changing access restrictions, transit disruption, and incomplete information. Travelers should not have to compare several agency feeds while navigating. A generic nearby alert does not explain whether their own route is affected.

The primary audience is New Yorkers making necessary trips through or near affected areas. Secondary audiences are visitors unfamiliar with the streets and travelers with accessibility constraints. These are proposed segments to validate, not completed user research.

| Traveler situation | Need | Design implication |
| --- | --- | --- |
| A worker has a fixed arrival time | Know when a disruption threatens arrival | Prioritize departure changes and arrival risk |
| A resident needs to cross the parade corridor | Know which planned walking segment is affected | Match restrictions to crossings and time windows |
| A traveler requires step-free access | Avoid an itinerary dependent on an unavailable elevator | Treat accessibility as a hard constraint; show unknown coverage |
| A visitor is unfamiliar with station entrances | Understand one specific next action | Use entrance names, landmarks, plain language, and source details |

First-release coverage: walking and transit trips in the event area, including disruption at origin, destination, entrances, transfers, and the last walking segment. Driving and wider regional travel are follow-up scope. An ordinary street closure must not automatically invalidate subway travel underneath it.

Non-goals: parade entertainment, viewing-spot recommendations, ride booking, social networking, continuous tracking outside an opted-in trip, and citywide emergency dispatch. No claim of complete street-level crowd detection or guaranteed arrival.

## 3. Customer journey

### 3.1 Discover while planning a trip

The traveler enters a destination in Google Maps as usual. If an available source identifies a relevant event restriction during the trip window, Maps presents a proposed inline card: **“Parade disruptions may affect this trip.”** The card offers **Review impact** and **Monitor this trip**. No separate account creation or download is required.

A citywide event alone does not justify a blocking modal. An unaffected traveler can continue normally. If coverage is incomplete, use **“No reported impact in the sources checked”**, not “All clear.”

### 3.2 Confirm what matters

Show the destination, planned departure or arrival time, mode, and monitoring end time. Reuse preferences only if the host makes them available with permission. Ask only for missing choices: maximum walking, transfer preference, step-free requirement, and whether to receive trip alerts.

Use two distinct actions: **Review once** and **Monitor until this trip ends**. Explain that monitoring uses the selected trip and host-authorized progress updates. Declining notification or location access must leave one-time review available. Never imply that the feature can read another app’s route or silently obtain background location.

### 3.3 Review the impact

The route screen leads with a short status: **Action needed**, **Possible impact**, **No reported impact**, or **Updates unavailable**. The expanded card contains:

1. The affected route segment or station entrance.
2. What changed, when it applies, and who reported it.
3. Expected effect on this trip; a numerical delay only when supported by a route estimate.
4. One recommended action, plus an alternative where useful.
5. Walking, transfers, fare implications if known, and accessibility uncertainty.

Highlight the relevant segment in the existing map, with a text explanation that works without the map. Do not show a full feed of unrelated incidents by default.

### 3.4 Monitor before departure

The service subscribes to the selected trip’s relevant streets, stations, lines, time window, and preferences. It checks changes in the background through a service scheduler; an open chat is not required. A material change produces a host-authorized Google Maps notification and updates the existing route card.

If the planned route becomes unusable, explain the conflict immediately. If a new ETA threatens the chosen arrival time, offer **Leave earlier** or **Review another route**. A change in departure time is a suggestion until the traveler accepts it.

### 3.5 Respond during travel

The alert must answer **what changed → impact → next action**. Avoid repeated modal interruptions. Keep the primary action large and the explanation short. Respect the host’s driving and accessibility interaction rules when those modes are supported.

Illustrative copy only; this is not a live event report:

> **Your planned crossing is closed.**  
> A new official restriction affects the walking segment ahead. Review a transit alternative before continuing toward the crossing.  
> **Review alternative** · **Keep current plan** · **View source**

After **Review alternative**, show the revised itinerary and tradeoffs. **Use this route** authorizes the host to replace the active route through its supported interface. If the host rejects the request, retain the existing route and state that the change was not applied. A recommendation is not a completed reroute.

For a missed turn or changed destination, re-evaluate only when the host provides the new route/progress or the traveler confirms a change. If progress is stale, say **“Based on your planned route; current position unavailable.”**

### 3.6 Pause, finish, and recover

Provide **Pause alerts**, **Change trip**, and **End monitoring** in the route card. End monitoring on a confirmed host arrival event, explicit cancellation, or the disclosed monitoring expiry. If arrival cannot be observed, do not claim the trip was completed; expire monitoring and say so.

After completion, an optional one-tap question asks whether the alert helped. No retention funnel or new account should block ending the trip.

## 4. Distribution

Primary distribution is contextual discovery inside Google Maps, subject to host approval. Show the feature when a planned trip overlaps a relevant event or a traveler asks about disruption. The service’s value is the connection between official event information and the traveler’s exact decision.

For a future authorized assistant integration, expose narrowly described tools: `check_trip_disruptions`, `explain_trip_impact`, `subscribe_trip`, and `cancel_trip_subscription`. Their descriptions must name supported geography, travel modes, source freshness, and access requirements. An assistant should call this service for event-related route impact, not for generic place search.

An assistant may recommend monitoring, but creating a subscription needs the traveler’s consent and a supported notification destination. MCP compatibility does not itself provide distribution inside Google Maps. Do not claim a Google endorsement or an installed Maps extension before a partnership exists.

## 5. Value

Traveler value: less checking across sources, earlier awareness of a blocked segment, and a clear response that respects their constraints. The measurable unit is a useful trip-specific intervention, not the number of alerts sent.

For the host, the hypothesis is better trip completion and greater confidence during exceptional events. For the service, a possible future model is a licensed event-disruption capability for mapping platforms or event partners. This is an unvalidated business hypothesis, not committed revenue. Avoid advertising or commercial routing incentives in disruption recommendations.

## 6. Control and safeguards

| Action | Product authority |
| --- | --- |
| Read public feeds, reconcile updates, evaluate an already authorized trip | Automatic within scope |
| Update the trip status and send relevant alerts | Automatic only during the consented monitoring window |
| Propose another route or earlier departure | Automatic suggestion; state uncertainty |
| Replace the active itinerary or change mode | Traveler acceptance and host API success required |
| Read calendars, send messages to contacts, book transport | Outside first-release scope; no implied permission |
| Turn on tracking, broaden data access, or extend monitoring | New explicit user choice required |

Hard constraints such as step-free access must not be silently relaxed to find a faster route. If no verified suitable alternative is available, explain the limitation and offer official source details. Follow posted restrictions and official on-site directions; the feature must never suggest bypassing a barricade.

Incoming feed text is untrusted data. It cannot instruct the agent to change permissions, call tools, expose credentials, or contact anyone. Deterministic checks decide relevance and permissions; language generation explains the evidence and must not invent closure locations, source timestamps, or routes.

## 7. Required integrations and visual styling

The companion integration document will specify the Google Maps host dependency, official Maps MCP, routing, MTA alerts and accessibility feeds, NYC closure notices, Notify NYC, NWS alerts, and internal scheduling and notification adapters. Each connection must distinguish an existing API or feed from a custom MCP wrapper we still need to build.

Include the requested [JSON cloud styling capability](https://developers.google.com/maps/documentation/maps-static/cloud-customization/json) as a conditional presentation dependency. It can define visual hierarchy for developer-controlled Google map surfaces through styles and map IDs. It does not supply disruption data or add UI to the consumer Maps app. If the native host requires its own styling system, use that instead. Dynamic closures require event geometry and a supported overlay renderer; basemap style JSON is not a closure feed. Maps Static output is a still image and cannot replace live navigation.

The intended visual language preserves street names, transit labels, attribution, and route contrast. Mark a confirmed restriction with a label and distinctive line treatment; mark uncertainty separately. Never rely on color alone, and do not hide map details needed for orientation.

## 8. Delivery status

This repository contains requirements, not a connected or deployed feature. Native host access, feed adapters, credentials, alert delivery, and live route modification have not been implemented or verified. The next document update adds the detailed integration matrix, operational thresholds, evaluation cases, and release gates.
