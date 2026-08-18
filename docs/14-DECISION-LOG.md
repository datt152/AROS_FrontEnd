# Architecture Decision Log

This file records decisions that should not be silently reversed.

## ADR-001 — Feature-Based Frontend

Status: Accepted

The primary frontend organization is feature-based because the project contains multiple business capabilities and needs clear boundaries without the complexity of a full DDD frontend.

## ADR-002 — TanStack Query for Server State

Status: Accepted

Server-owned data is managed with TanStack Query.

Reason:
- caching
- deduplication
- refetching
- mutations
- invalidation
- pagination
- clear server-state semantics

## ADR-003 — No Redux by Default

Status: Accepted

Redux is not used as the default application state container.

Reason:
Most state is either server state, form state, or local UI state.

## ADR-004 — React Hook Form + Zod

Status: Accepted

Forms use React Hook Form and Zod where schema validation is needed.

## ADR-005 — Axios as HTTP Client

Status: Accepted

Axios is used as the centralized HTTP transport, especially for interceptors/auth handling.

## ADR-006 — Web/Mobile Share Logic, Not UI

Status: Accepted

Future shared packages contain API/types/validation/domain utilities, not Web UI implementations.

## ADR-007 — Monorepo Deferred Until Mobile

Status: Accepted

The project does not introduce monorepo complexity before there is a concrete Web + Mobile sharing need.

## ADR-008 — Backend Is Source of Truth for Authorization and Final Grading

Status: Accepted

Frontend role checks are UX protections. Backend authorization and final exam grading are authoritative.
