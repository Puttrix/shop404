# Open Questions

## Analytics & Tracking

**Q1: Server-Side GTM (sGTM) GDPR Compliance**  
Status: Researching  
Context: Optional sGTM support exists via `GTM_SERVER_CONTAINER_URL`  
- What are GDPR compliance requirements for sGTM in EU?
- Should we add explicit warnings about measurement protocol usage?
- Do we need consent forwarding examples beyond basic `gcs` parameter?

**Q2: Matomo Cart Update Timing**  
Status: Implemented, needs validation  
Context: `update_cart` emitted with FULL CART on all cart changes + `begin_checkout`  
- Is this sufficient for Matomo ecommerce accuracy?
- Should we debounce rapid cart changes to reduce event volume?

**Q3: GA4 Category Hierarchy Limits**  
Status: Researching  
Context: Currently emits `item_category...item_category5` (5 levels max)  
- What happens if product categories exceed 5 levels?
- Should we truncate, concatenate, or document limitations?

## User Experience

**Q4: Consent Banner Defaults**  
Status: Active decision needed  
Context: Currently defaults all categories to denied  
- Should we offer "legitimate interest" option for analytics?
- Would pre-selecting "necessary" improve UX without compromising compliance?

**Q5: Donation Monthly Default Persistence**  
Status: Implemented via localStorage  
- Should preference sync across devices (requires backend)?
- Should we add explicit preference management page?

## Technical

**Q6: Test Coverage Strategy**  
Status: Limited to payload validation scripts  
- Do we need React component tests for demo project?
- Would Playwright E2E tests add educational value?

**Q7: Environment Variable Validation**  
Status: No validation currently  
- Should we add schema validation for `/config.json`?
- Would startup healthcheck endpoint help troubleshooting?

**Q8: Additional Analytics Platforms**  
Status: Future consideration  
- Would examples for Adobe Analytics, Mixpanel, or Segment add value?
- How to balance demo complexity with educational breadth?

**Q9: Experimentation Examples**  
Status: Optimizely Web supported but minimal  
- Should we add example A/B test variations in codebase?
- How to show experiment tracking without user's Optimizely account?

**Q10: Accessibility Audit**  
Status: Not yet conducted  
- Is WCAG 2.1 AA compliance expected for demo site?
- Should we add keyboard navigation examples? 
