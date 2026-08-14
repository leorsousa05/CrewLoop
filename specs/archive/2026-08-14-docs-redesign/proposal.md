# Proposal: CrewLoop Docs Frontend Redesign

## Motivation

The current docs site reads like a generic neon SaaS landing page layered over a documentation reader. That visual language does not match the product: CrewLoop is an operations manual for a role-separated AI workflow, so the site should feel like a field guide, a process atlas, and a reading surface rather than a pitch deck.

The redesign aims to make the experience feel authored and deliberate. It should be recognizable as CrewLoop at a glance, but without relying on the current dark glassmorphism, cyan glow, or gaming-adjacent presentation.

## Scope

This change redesigns the entire frontend shell for the docs app:

- Home/landing page visual system
- Persistent top navigation and docs routing shell
- Documentation reading layout and sidebar
- Markdown presentation, callouts, tables, and code block treatment
- Supporting visual components used by the landing page
- Typography and color tokens

## Goals

- Replace the current palette with a new editorial palette grounded in paper, ink, oxide, moss, and cobalt.
- Reframe the homepage around the product's subject matter: workflow, roles, and handoffs.
- Make the docs reader quieter and more readable while preserving discoverability and navigation.
- Keep the redesign responsive, keyboard accessible, and compatible with reduced motion.

## Non-goals

- No content rewrite of the markdown docs themselves.
- No routing framework replacement.
- No new backend behavior or API work.
- No installation of new runtime dependencies unless the implementation proves it is required.

## Constraints

- Preserve the current hash-based routing behavior.
- Preserve the existing docs content under `public/docs/`.
- Keep the app usable on mobile and desktop.
- Avoid generic neon/glass design patterns.
- Ensure the typography system improves hierarchy without sacrificing readability.
