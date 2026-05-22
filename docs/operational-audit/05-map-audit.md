# 05 Map System Audit

## Current State
- Mobile: uses location permission to choose area; no live map UI.
- Hub: `Map` page shows block-level counts; Action Queue has static map-context card.
- Database: migration 004 adds nullable lat/lng, accuracy, captured-at, privacy, shelter capacity, and proof media metadata. No geohash, route, volunteer location, or map layer table yet.

## Required Layers And Current Coverage
- Rescue cases: partial, text/block only.
- Emergency cases: partial via category/severity, no geospatial pin.
- Feeding points: partial via mission text location, no pin.
- Volunteers: not implemented.
- Shelters: partial list, no coordinates/capacity map.
- NGOs: not implemented.
- Medical support: not implemented.
- Completed missions: task/case status exists, no map archive layer.
- High-density zones: not implemented.

## Pin Creation
- Current: no real pin creation.
- Required: capture metadata in mobile/hub, then create map points from reports, tasks, shelters, feeding stations with lat/lng, accuracy, source, status, privacy level.

## Dispatcher Use
- Current: dispatcher sees queues and block counts.
- Required: map-driven assignment with nearest shelter/volunteer, filters, route estimates, low-bandwidth fallback.

## Privacy
- Current: avoids precise location by using neighborhood/text.
- Required: store precise operational location but show public/citizen-safe generalized location.

## Fix Plan
- Implemented schema foundation: migration 004 adds location/privacy metadata columns.
- P1 before real operations: wire mobile/hub capture and add map layer model.
- P2: real map component with layers and filters.
- P3: heatmaps, route intelligence, weak-GPS confidence UI.
