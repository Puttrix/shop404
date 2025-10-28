# Migration Complete: .codex → .assistant

**Date**: 2025-10-28  
**Status**: ✅ Complete

---

## Summary

Successfully migrated Shop404 project from `.codex/` workflow to structured `.assistant/` workflow.

---

## What Was Created

### Directory Structure
```
.assistant/
├── README.md                          # Workflow documentation
├── status.md                         # Current project status
├── plan.md                           # Now/Next/Later roadmap
├── backlog.md                        # 13 P-IDs with acceptance criteria
├── history.md                        # Condensed timeline
├── session-plan.md                   # First session guide
├── canvas/
│   ├── vision.md                     # Problem, users, success, non-goals
│   ├── design.md                     # UI/UX and technical architecture
│   └── questions.md                  # 10 open questions
└── adr/
    ├── 001-gtm-first-architecture.md
    ├── 002-sgtm-as-optional-feature.md (Proposed)
    ├── 003-matomo-mtm-only.md
    └── 004-consent-mode-v2.md
```

### Documents Overview

| Document | Lines | Purpose |
|----------|-------|---------|
| README.md | 200+ | Workflow guide and conventions |
| status.md | 150+ | Current state, risks, artifacts, changelog |
| plan.md | 120+ | 8 milestones organized Now/Next/Later |
| backlog.md | 180+ | 13 backlog items with P-IDs |
| history.md | 100+ | Timeline of major achievements |
| session-plan.md | 200+ | Immediate next steps and checklist |
| canvas/vision.md | 40+ | Vision, mission, target users |
| canvas/design.md | 200+ | Design decisions and architecture |
| canvas/questions.md | 100+ | 10 open questions across domains |
| adr/001-*.md | 100+ | GTM-First architecture decision |
| adr/002-*.md | 80+ | sGTM as optional (Proposed) |
| adr/003-*.md | 120+ | MTM-only decision |
| adr/004-*.md | 150+ | Consent Mode v2 integration |

**Total**: ~1,700 lines of structured documentation

---

## Backlog Items Extracted

From `docs/ROADMAP.md` → `backlog.md`:

- **P-001**: Learn/Resources section content (high priority)
- **P-002**: Matomo content tracking - rich blocks (high priority)
- **P-003**: Matomo ecommerce product/category details (medium)
- **P-004**: Simple Optimizely experiment example (medium)
- **P-005**: Price filters & sort on product list (low)
- **P-006**: Accessibility sweep (medium)
- **P-007**: Config schema validation (low)
- **P-008**: CLI script for fake orders (low)
- **P-009**: GA4 ecommerce extensions (low)
- **P-010**: Matomo ecommerce extensions (low)
- **P-011**: Image pipeline polish (low)
- **P-012**: Server-side GTM enhancement (low)
- **P-013**: ODP Web SDK examples (low)

---

## Milestones Defined

8 milestones organized into Now/Next/Later:

**Now**:
- M1: Analytics Parity Validation (in progress)

**Next**:
- M2: Learn & Content Tracking
- M3: Donation Flow Polish (partially complete)

**Later**:
- M4: Experimentation & Personalization
- M5: Product Catalog Enhancements
- M6: Performance & Accessibility
- M7: Extended Analytics
- M8: Developer Experience

---

## Architecture Decisions Documented

4 ADRs created from implicit decisions in codebase:

1. **ADR-001**: GTM-First Architecture (Accepted, 2025-09-03)
   - GA4 configured entirely within GTM
   - GTM always loads, consent controls behavior

2. **ADR-002**: Server-Side GTM as Optional Feature (Proposed, 2025-10-28)
   - sGTM support with GDPR warnings
   - Needs team decision: Accept with docs or Remove

3. **ADR-003**: Matomo Tag Manager Only (Accepted, 2025-09-03)
   - No direct Matomo tracker
   - MTM-only for consistency with GTM-first

4. **ADR-004**: Google Consent Mode v2 (Accepted, 2025-09-03)
   - Consent defaults denied before tags load
   - Custom banner with category mapping

---

## Open Questions Captured

10 questions documented in `canvas/questions.md`:

**Analytics**: sGTM GDPR compliance, Matomo cart timing, GA4 category limits  
**UX**: Consent defaults, donation preferences  
**Technical**: Test coverage, environment validation  
**Features**: Additional platforms, experimentation examples, accessibility audit

---

## What Was Preserved

- `.codex/memory.json` — Kept as historical reference
- `docs/ROADMAP.md` — Kept as legacy document
- All existing documentation in `docs/`
- All source code unchanged
- Git history intact

---

## What Changed

- **Structure**: Flat roadmap → organized backlog + plan + status
- **Backlog**: Bullet points → P-IDs with acceptance criteria
- **Decisions**: Implicit → explicit ADRs
- **Tracking**: Single ROADMAP → status.md + plan.md + backlog.md
- **Questions**: Scattered → centralized in canvas/questions.md

---

## Migration Validation

✅ All 8 migration tasks completed:
1. ✅ Directory structure created
2. ✅ Vision/design migrated to canvas/
3. ✅ Backlog extracted with P-IDs
4. ✅ Plan created from roadmap
5. ✅ History generated from git commits
6. ✅ Status.md created with all sections
7. ✅ ADR stubs generated for 4 decisions
8. ✅ Session plan written

---

## Immediate Next Steps

See `session-plan.md` for detailed first session guide.

**Priority 1**: Complete M1 Analytics Parity Validation
- Run payload validation scripts
- Manual GTM/MTM Preview validation
- Document troubleshooting steps

**Priority 2**: Begin M2 Learn Section Content
- Create KB articles, FAQ, testimonials
- Add Matomo Content Tracking annotations
- Test in MTM Preview

**Priority 3**: Add Home Page Content Blocks (P-002)
- PromoBanner, TeaserCards components
- IntersectionObserver for visible impressions
- Content click tracking

---

## File Changes Summary

**Created** (17 new files):
- `.assistant/README.md`
- `.assistant/status.md`
- `.assistant/plan.md`
- `.assistant/backlog.md`
- `.assistant/history.md`
- `.assistant/session-plan.md`
- `.assistant/canvas/vision.md` (updated from scaffold)
- `.assistant/canvas/design.md` (updated from scaffold)
- `.assistant/canvas/questions.md` (updated from scaffold)
- `.assistant/adr/001-gtm-first-architecture.md`
- `.assistant/adr/002-sgtm-as-optional-feature.md`
- `.assistant/adr/003-matomo-mtm-only.md`
- `.assistant/adr/004-consent-mode-v2.md`
- `.assistant/MIGRATION.md` (this file)

**Modified**: None (no changes to existing codebase)

**Preserved**: `.codex/memory.json`, `docs/ROADMAP.md`

---

## Success Metrics

✅ **Completeness**: All roadmap items extracted and structured  
✅ **Clarity**: Clear Now/Next/Later prioritization  
✅ **Traceability**: P-IDs link backlog to plan to status  
✅ **Documentation**: ADRs capture architectural decisions  
✅ **Continuity**: No breaking changes to codebase  
✅ **Actionability**: Session plan provides clear next steps  

---

## Maintenance Going Forward

**After Each Session**:
- Update `status.md` (focus, changelog, risks)
- Update `plan.md` milestone checkboxes
- Mark backlog items completed in `backlog.md`
- Update `session-plan.md` for next session

**When Milestones Complete**:
- Update `history.md` with achievements
- Move questions from `canvas/questions.md` to history or ADRs
- Adjust `plan.md` Now/Next/Later sections

**When Decisions Made**:
- Create new ADRs in `adr/` directory
- Update related documents with ADR references

---

## Notes

- Original `.codex/memory.json` insights incorporated throughout documentation
- All dates preserved from git history and ROADMAP
- P-ID numbering starts at P-001, room for growth
- ADR-002 status "Proposed" — needs team decision
- Parking lot items noted but not assigned P-IDs

---

## Conclusion

Migration successful. The `.assistant/` workflow provides:
- Clear status tracking
- Structured backlog management
- Milestone-based planning
- Architectural decision documentation
- Open question tracking
- Session continuity

Ready to proceed with development using new workflow. 🚀
