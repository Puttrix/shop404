# Status

**Last Updated**: 2026-03-05

---

## Focus

**Primary**: Analytics parity validation and documentation completeness  
**Secondary**: Learn/Resources section content and Matomo Content Tracking demonstration

Completing Milestone M1 (Analytics Parity Validation) and preparing for M2.

---

## Now / Next / Later
See `plan.md` for detailed breakdown.

**Now**: M1 — Analytics Parity Validation (event mapping ✓, scripts ✓, preview validation pending)  
**Next**: M2 — Learn & Content Tracking (content creation, annotated blocks)  
**Later**: Experimentation, catalog enhancements, performance optimization

---

## Risks

**R-1**: Analytics validation coverage (scripts check structure, not end-to-end firing) - *Medium*  
**R-2**: Consent Mode interpretation variance across users - *Medium*  
**R-3**: sGTM GDPR compliance concerns - *Medium*  
**R-4**: Matomo cart sync timing with rapid changes - *Low*  
**R-5**: Browser compatibility (modern features) - *Low*

---

## Artifacts

**Docs**: README, CONTRIBUTING, CODE_OF_CONDUCT.md, SECURITY.md, LICENSE, docs/*.md (analytics, parity, GTM, MTM, Portainer, design, developers)  
**Code**: src/utils/analytics.js, ConsentBanner, cartState, donate/, learn/, ABTestLab (`/ab-test-lab`)  
**Scripts**: test-analytics.mjs, test-matomo.mjs, make-webp.mjs  
**Config/CI**: docker-compose.yml, Dockerfile, public/config.json, .github/workflows/publish.yml, .github/ISSUE_TEMPLATE/*, .github/pull_request_template.md

---

## Changelog

**2026-03-05**: Session kickoff refresh completed; MCP probe run for context7/playwright/github (resource-list methods unsupported on context7/playwright servers, github MCP server unavailable), and results logged in task_log  
**2026-02-09**: Added A/B Test Lab baseline page (`/ab-test-lab`) for Optimizely-driven experiments and header navigation; backlog P-015 completed  
**2026-02-09**: Refreshed stale status from plan/backlog/task_log; MCP availability reconfirmed (context7/playwright present, github MCP unavailable)  
**2025-11-25**: Added community health files (Code of Conduct, License, Security policy, issue/PR templates)  
**2025-11-24**: Added Docker Hub publish workflow and refreshed Dockerfile/README for image pulls  
**2025-10-28**: Migration to .assistant/ workflow (canvas, backlog, plan, history, status, ADRs pending)  
**2025-09-05**: Analytics parity docs, donation enhancements, Neo design, Portainer guide, photo pipeline  
**2025-09-03**: .codex memory, ROADMAP adoption, GTM-first, Consent Mode v2, MTM-only  
**Pre-Sept 2025**: Initial scaffolding, ecommerce flow, donation wizard, consent banner, Docker

---

## Open Questions (from canvas/questions.md)

Q1: sGTM GDPR compliance documentation  
Q2: Matomo cart sync timing optimization  
Q3: GA4 category hierarchy >5 levels  
Q4: Test coverage strategy (E2E vs scripts)  
Q5: Accessibility compliance target (WCAG 2.1 AA?)

---

## Dependencies

**External**: Node 18+, Docker (optional), GTM/GA4, Matomo+MTM, Optimizely/ODP (optional)  
**Internal**: M2 depends on M1; M4 depends on M1; P-012 depends on ADR-002

---

## Health

**Green** ✓: Core flows, GTM/GA4 + Matomo integration, Consent Mode, docs, Docker  
**Yellow** ⚠: E2E validation incomplete, Learn content sparse, no a11y audit, limited tests  
**Red** ✗: None
