# Status

**Last Updated**: 2025-10-28

---

## Focus

**Primary**: Analytics parity validation and documentation completeness  
**Secondary**: Learn/Resources section content and Matomo Content Tracking demonstration

Completing Milestone M1 (Analytics Parity Validation) and preparing for M2.

---

## Now / Next / Later
See `plan.md` for detailed breakdown.

**Now**: M1 — Analytics Parity Validation (event mapping ✓, scripts ✓, preview validation in progress)  
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

**Docs**: README, CONTRIBUTING, docs/*.md (analytics, parity, GTM, MTM, Portainer, design, developers)  
**Code**: src/utils/analytics.js, ConsentBanner, cartState, donate/, learn/  
**Scripts**: test-analytics.mjs, test-matomo.mjs, make-webp.mjs  
**Config**: docker-compose.yml, Dockerfile, public/config.json

---

## Changelog

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
