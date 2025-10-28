# ADR-002: Server-Side GTM (sGTM) as Optional Feature

**Status**: Proposed  
**Date**: 2025-10-28  
**Deciders**: Pending  
**Tags**: analytics, gtm, sgTM, gdpr, compliance

---

## Context

Server-side Google Tag Manager (sGTM) offers benefits like reduced client-side JavaScript, improved data quality, and first-party data routing. However, it also introduces GDPR compliance concerns, especially in the EU.

The project currently supports optional sGTM via `GTM_SERVER_CONTAINER_URL` configuration, but lacks comprehensive documentation about legal implications.

### Options Considered

1. **Remove sGTM Support**: Eliminate feature to avoid compliance risks
2. **Document as Advanced/Conditional**: Keep feature with strong warnings
3. **Full Implementation Guide**: Comprehensive setup with legal guidance

---

## Decision

**Status**: Pending formal decision

**Recommendation**: Document sGTM as an **advanced, conditional feature** with:
- Explicit GDPR compliance warnings
- Legal basis requirements (consent vs legitimate interest)
- Technical setup guide (DNS, custom domain, consent forwarding)
- Clear statement: "Not acceptable in EU without proper legal safeguards"

---

## Rationale

### Concerns
- **GDPR Grey Area**: Server-side tracking may not be compliant without explicit consent
- **Legal Basis Required**: Legitimate interest often insufficient for EU
- **User Responsibility**: Demo users may not understand legal implications
- **Measurement Protocol**: Bypassing client-side consent checks raises ethical questions

### Benefits
- **Educational Value**: Shows advanced analytics patterns
- **Data Quality**: Reduces client-side script blocking
- **First-Party Routing**: Improves data accuracy and persistence

---

## Consequences

### If Accepted
- Add comprehensive P-012 documentation with legal warnings
- Mark sGTM sections with "⚠️ ADVANCED: Legal review required"
- Document proper consent forwarding (beyond basic `gcs` parameter)
- Provide Measurement Protocol examples with EU caveats
- Include DNS setup (CNAME), custom domain, verification steps

### If Rejected
- Remove `GTM_SERVER_CONTAINER_URL` configuration option
- Remove sGTM references from documentation
- Simplify analytics architecture (client-side only)

---

## Open Questions

1. Should we provide legal disclaimer template?
2. Is documenting sGTM sufficient, or does inclusion imply endorsement?
3. Should we restrict sGTM docs to "advanced users only" section?
4. Do we need explicit "not legal advice" disclaimers?

---

## Related

- ADR-001: GTM-First Analytics Architecture
- ADR-004: Google Consent Mode v2 Integration
- P-012: Server-Side GTM Enhancement (backlog item)
- `docs/ANALYTICS.md`: Current sGTM mention (minimal)
