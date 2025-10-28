# .assistant/ Workflow

This directory contains structured documentation for the AI assistant to maintain project context across sessions.

---

## Directory Structure

```
.assistant/
├── README.md           # This file
├── status.md          # Current project status (updated frequently)
├── plan.md            # Now/Next/Later development plan
├── backlog.md         # Product backlog with P-IDs
├── history.md         # Condensed timeline of milestones
├── session-plan.md    # Current session plan and next steps
├── canvas/            # Vision, design, questions
│   ├── vision.md
│   ├── design.md
│   ├── questions.md
│   ├── goals.md
│   ├── ideas.md
│   ├── notes.md
│   └── stakeholders.md
└── adr/               # Architecture Decision Records
    ├── 001-gtm-first-architecture.md
    ├── 002-sgtm-as-optional-feature.md
    ├── 003-matomo-mtm-only.md
    └── 004-consent-mode-v2.md
```

---

## Key Documents

### 📍 status.md
**Purpose**: Current state snapshot  
**Update Frequency**: After each work session  
**Contains**: Focus, Now/Next/Later summary, risks, artifacts, changelog, open questions

### 📋 plan.md
**Purpose**: Development roadmap  
**Update Frequency**: When milestones shift  
**Contains**: Now (current sprint), Next (upcoming), Later (backlog), milestone breakdown

### 🎯 backlog.md
**Purpose**: Product backlog  
**Update Frequency**: As items added/completed  
**Contains**: P-ID items with tags, priority, estimates, dependencies, acceptance criteria

### 📜 history.md
**Purpose**: Project timeline  
**Update Frequency**: When major milestones completed  
**Contains**: Condensed chronological record of achievements and decisions

### 🚀 session-plan.md
**Purpose**: Current session guide  
**Update Frequency**: Start of each session  
**Contains**: Immediate tasks, priorities, success criteria, wrap-up checklist

---

## Canvas/ Subdirectory

Strategic planning documents:

- **vision.md**: Problem statement, target users, success definition, non-goals
- **design.md**: UI/UX and technical architecture notes
- **questions.md**: Open questions and unknowns (when answered, move to history or ADR)
- **goals.md**: Project objectives (scaffold)
- **ideas.md**: Future possibilities (scaffold)
- **notes.md**: Miscellaneous context (scaffold)
- **stakeholders.md**: Key people/roles (scaffold)

---

## ADR/ Subdirectory

Architecture Decision Records document key technical choices:

- **001-gtm-first-architecture.md**: Why GTM loads early and contains all analytics
- **002-sgtm-as-optional-feature.md**: Server-side GTM with GDPR considerations (Proposed)
- **003-matomo-mtm-only.md**: Why Matomo Tag Manager only (no direct tracker)
- **004-consent-mode-v2.md**: Google Consent Mode v2 integration

**ADR Format**:
- Status (Proposed/Accepted/Rejected/Superseded)
- Context and options considered
- Decision and rationale
- Consequences (positive/negative/neutral)
- Related documents and decisions

---

## Workflow Guidelines

### Starting a Session
1. Read `status.md` for current state
2. Review `session-plan.md` for immediate priorities
3. Check `canvas/questions.md` for unresolved questions
4. Reference `plan.md` for milestone context

### During Work
1. Mark backlog items in progress/completed in `backlog.md`
2. Update `plan.md` milestone checkboxes as work completes
3. Document new decisions as ADRs in `adr/`
4. Add new questions to `canvas/questions.md`

### Ending a Session
1. Update `status.md`:
   - Focus (if changed)
   - Risks (if new ones identified)
   - Changelog (what was completed)
   - Open questions (sync from canvas)
2. Update `plan.md` milestone progress
3. Move completed questions from `canvas/questions.md` to `history.md`
4. Update `session-plan.md` for next session
5. Commit changes to git

---

## Migration Notes

This project was migrated from `.codex/` workflow on 2025-10-28.

**Preserved**:
- `.codex/memory.json` remains as historical reference
- All strategic decisions documented in ADRs
- Roadmap items transformed into structured backlog
- Vision and design notes consolidated in canvas/

**What Changed**:
- More structured backlog (P-IDs, acceptance criteria)
- Explicit milestone tracking in plan.md
- ADRs for architectural decisions
- Clearer status tracking

---

## P-ID Naming Convention

Backlog items use P-IDs (e.g., P-001, P-002):
- **P-001 to P-099**: Features and enhancements
- **P-100 to P-199**: Technical debt and refactoring
- **P-200+**: Reserved for future use

Tags: `analytics`, `ux`, `devex`, `content`, `performance`, `a11y`, `gtm`, `matomo`, etc.

Priorities: `high`, `medium`, `low`

---

## Document Maintenance

| Document | Owner | Update Trigger |
|----------|-------|----------------|
| status.md | Assistant | End of each session |
| plan.md | Assistant | Milestone completion or shift |
| backlog.md | Assistant | New/completed items |
| history.md | Assistant | Major milestones |
| session-plan.md | Assistant | Start of session |
| canvas/*.md | Assistant | Strategic changes |
| adr/*.md | Team | Architectural decisions |

---

## Related Files (Outside .assistant/)

- `README.md` — Main project documentation
- `CONTRIBUTING.md` — Contribution guidelines
- `docs/ROADMAP.md` — Original roadmap (legacy, kept for reference)
- `.codex/memory.json` — Legacy assistant memory (reference only)

---

## Questions?

See `canvas/questions.md` for current open questions, or add new ones there.

For architectural decisions, create new ADRs in `adr/` following the established format.
