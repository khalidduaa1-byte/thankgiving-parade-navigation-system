# Thanksgiving Parade Navigation System

## Product requirements: disruption assistance inside Google Maps

**Status:** v1 requirements complete for review; implementation and native host integration remain unverified.  
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

The [integration plan](docs/INTEGRATIONS.md) specifies the Google Maps host dependency, official Maps MCP, routing, MTA alerts and accessibility feeds, NYC closure notices, Notify NYC, NWS alerts, and internal scheduling and notification adapters. It distinguishes existing APIs and feeds from custom MCP wrappers we still need to build.

Include the requested [JSON cloud styling capability](https://developers.google.com/maps/documentation/maps-static/cloud-customization/json) as a conditional presentation dependency. It can define visual hierarchy for developer-controlled Google map surfaces through styles and map IDs. It does not supply disruption data or add UI to the consumer Maps app. If the native host requires its own styling system, use that instead. Dynamic closures require event geometry and a supported overlay renderer; basemap style JSON is not a closure feed. Maps Static output is a still image and cannot replace live navigation.

The intended visual language preserves street names, transit labels, attribution, and route contrast. Mark a confirmed restriction with a label and distinctive line treatment; mark uncertainty separately. Never rely on color alone, and do not hide map details needed for orientation.

## 8. Alert behavior and difficult cases

The following thresholds are proposed defaults to validate in user testing and source replays. They are not observed performance results.

| State | Trigger | User experience |
| --- | --- | --- |
| Action needed | A verified, active restriction affects a required segment; an accessibility dependency fails; or a supported estimate crosses the chosen arrival deadline | One timely alert and a route card with the affected segment, evidence, and recommended review |
| Material delay | Supported route estimate worsens by at least five minutes and affects the selected trip | Alert once; show the original and updated estimate with calculation time |
| Possible impact | Relevant event has uncertain geometry, direction, timing, or conflicting reports | Explain what is unknown; invite review without presenting a definite blockage or precise delay |
| No reported impact | No matching event in the available sources | Quiet status card with coverage information; no repeated reassurance notifications |
| Updates unavailable | A required source or host connection is degraded | Show the affected coverage and last successful check; do not claim monitoring is fully operational |
| Resolved | An authoritative update resolves the relevant event | Update status; notify only if resolution changes an active recommendation. Do not switch the traveler back automatically |

Deduplicate by event/version, trip/version, and meaningful impact. Merge simultaneous reports about the same incident while retaining their provenance. For non-urgent ETA changes, require persistence across two evaluations and use a ten-minute per-incident notification cooldown. A newly blocked segment, an urgent official instruction, or a material correction can bypass that cooldown. The first alert for a newly verified blockage should not wait for a second polling interval.

Repeated route changes should not bounce the traveler between options. Keep an accepted route unless it becomes infeasible or another change meets the material-impact policy. Never delay a required safety correction just to meet an alert-volume target.

| Failure or edge case | Required behavior |
| --- | --- |
| Same incident appears in two sources | One user-facing incident with both references; no duplicate alerts |
| Street closure crosses a subway line on the map | Evaluate street access and station entrances separately; do not classify the underground segment as blocked solely from 2D intersection |
| Elevator feed is unavailable | State that step-free access cannot be verified; do not substitute stairs |
| Restriction has no confirmed end time | Retain unknown status and seek an update; never infer reopening from silence |
| Traveler is already beyond the affected segment | Suppress obsolete advice when host progress confirms this; otherwise disclose that progress is unknown |
| All alternatives violate a hard preference | Explain why no verified option is available; offer review of official information |
| Phone is offline or notifications are disabled | Show last-known status with timestamp; do not claim a notification was delivered. Refresh on reconnect |
| Destination changes while an alert is queued | Cancel stale recommendations and evaluate the latest trip version |
| Host route update fails | Preserve the previous route and state that the new route was not applied |

Accessibility requirements include screen-reader order matching the visual hierarchy, readable text at enlarged sizes, large primary actions, and text equivalents for overlays. Pair severity with labels and shapes rather than color alone. Translate explanations only where quality can be verified; preserve official names and make the original notice accessible.

## 9. Requirements and acceptance criteria

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| R1 | Feature lives inside Google Maps | Approved host integration presents the journey without a separate app, account, or website |
| R2 | Monitoring is intentional and bounded | Consent records trip scope, data use, notification choice, and expiry; one-time review works without a subscription |
| R3 | Alerts match the actual trip | Replays verify route segment/entity, travel mode, direction, and time-window matching, including origin and destination access |
| R4 | Every factual alert is attributable | Visible source, publication/update time when available, fetch time, and confidence/coverage state; no fabricated timestamps |
| R5 | Recommendations respect constraints | Candidates violating step-free requirements or other hard constraints are rejected with a reason |
| R6 | Route change remains under traveler control | No mutation before acceptance; success is shown only after host acknowledgment; stale proposals fail safely |
| R7 | Monitoring survives conversation closure | Backend checks continue during the authorized window without an open chat; host permissions govern device notifications |
| R8 | Cancellation takes effect immediately | No newly dispatched messages after confirmed cancellation; queued messages are checked against current consent |
| R9 | Data failures remain visible | Simulated stale, empty, delayed, and conflicting feeds produce correct degraded states |
| R10 | Visual presentation remains useful | Labels, accessibility, source attribution, route contrast, and native host compatibility pass review; JSON styling is used only where supported |

## 10. Evaluation and success measures

Start with at least 30 labeled synthetic/replayed scenarios covering closure changes, line and station disruption, elevator failure, missing geometry, expired notices, duplicate updates, lost connectivity, and host mutation failure. Include at least ten unaffected trips to test false alarms. Keep fixtures explicitly labeled and separate from the live pipeline. Human reviewers establish expected outcomes before evaluation.

Initial release targets:

- Zero route changes without valid traveler acceptance, and zero recommendations that knowingly violate a hard accessibility constraint in the test suite.
- At least 95% alert precision and 90% recall for labeled, supported event types; report numerator, denominator, and missed-case severity. A small replay set cannot establish citywide reliability.
- p95 under 30 seconds from successful ingestion of a relevant update to alert dispatch. Report source-publication lag and device-delivery latency separately.
- In task-based usability testing, at least 80% of participants can identify what changed and the next action within ten seconds of seeing an alert. Validate with at least five participants before expanding the study.
- No duplicate notification for an unchanged event/trip state in the replay suite; no dispatch after cancellation.

Product outcomes to measure after an approved pilot: fraction of alerts rated useful, acceptance of recommended changes, notification opt-outs, and successful arrival when observable with consent. Compare against a baseline before claiming time savings. A click or acceptance is not evidence that a disruption was avoided.

Proposed telemetry: `trip_reviewed`, `monitoring_consented`, `impact_evaluated`, `alert_dispatched`, `host_delivery_result`, `recommendation_opened`, `route_change_accepted`, `route_change_applied`, `monitoring_cancelled`, and `monitoring_expired`. Use pseudonymous IDs; exclude raw contact data and detailed location from general analytics. Record source and trip versions for debugging.

## 11. Data handling and operational controls

Request only the host data needed for the selected trip. Proposed retention: delete precise active-trip context within 24 hours after monitoring ends; retain redacted operational records for up to 30 days, subject to platform terms and an approved privacy design. Deletion and revocation must reach queued work and derived subscription state. Do not use location history for ads or unrelated personalization.

Keep credentials in managed secrets, separate test and production, and redact provider payloads from logs where necessary. Source content cannot grant permissions. Monitoring must have a per-source disable switch, bounded retries, quota controls, and an operator-visible health view. Outage behavior must favor accurate uncertainty over unsupported reassurance.

The event-day operator must be able to retract a mistaken alert, suppress a malfunctioning source, and inspect why an event matched a trip. A material correction should reach the same still-active subscriptions as the original alert. Do not hide correction history from the traveler.

## 12. Delivery sequence and release gates

| Stage | Deliverable | Exit condition |
| --- | --- | --- |
| 1. Native integration feasibility | Document host capabilities, access path, design ownership, and supported notification/mutation APIs | Google-supported access verified. Without it, native release remains blocked |
| 2. Evidence pipeline | Parse agency sources, establish entity mapping and source-health states, create labeled fixtures | Required data coverage proven; ambiguity handled; permitted data use confirmed |
| 3. Trip impact service | Deterministic matching, constraint checks, bounded subscriptions, and evidence-bound explanations | Replay targets met, including no-change and failure cases |
| 4. Native experience | Host route cards, approved overlays/styling, user acceptance, delivery, and cancellation | End-to-end tests pass inside the authorized host environment |
| 5. Controlled pilot | Opted-in participants, event operator, metrics, and rollback plan | Pilot demonstrates usefulness and acceptable false-alert behavior before broad rollout |

No public launch date is committed until Stage 1 is resolved. A backend test harness may exercise feeds and policy internally, but it is not a replacement traveler app or a claim that Google Maps has been extended.

Open decisions for implementation: who owns the native integration relationship; which exact host APIs and deployment environment are available; permitted routing/geometry operations; service coverage at launch; validated feed freshness; event-day operational ownership; and the accessibility review process. The product direction is already set and does not require another choice of separate-app versus native-app scope.

## 13. Delivery status

This repository contains a completed first version of the requirements and integration plan. It does not contain a connected or deployed feature. Native host access, feed adapters, credentials, alert delivery, and live route modification have not been implemented or verified. Illustrative journeys and thresholds are design proposals, not reports of real disruptions or measured outcomes.
