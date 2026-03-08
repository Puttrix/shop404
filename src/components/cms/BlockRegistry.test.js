import { describe, it, expect } from 'vitest';
import { getBlockComponent } from './BlockRegistry.js';
import HeroBlock from './blocks/HeroBlock.jsx';
import CtaBlock from './blocks/CtaBlock.jsx';
import ProductTeaserBlock from './blocks/ProductTeaserBlock.jsx';

// --- registry lookups ---

describe('getBlockComponent', () => {
  it('returns HeroBlock for heroBlock alias', () => {
    expect(getBlockComponent('heroBlock')).toBe(HeroBlock);
  });

  it('returns CtaBlock for ctaBlock alias', () => {
    expect(getBlockComponent('ctaBlock')).toBe(CtaBlock);
  });

  it('returns ProductTeaserBlock for productTeaserBlock alias', () => {
    expect(getBlockComponent('productTeaserBlock')).toBe(ProductTeaserBlock);
  });

  it('returns null for an unknown alias', () => {
    expect(getBlockComponent('unknownBlock')).toBeNull();
  });

  it('returns null for empty string alias', () => {
    expect(getBlockComponent('')).toBeNull();
  });

  it('returns null for undefined alias', () => {
    expect(getBlockComponent(undefined)).toBeNull();
  });
});

// --- registry completeness ---

describe('registry completeness', () => {
  const EXPECTED_ALIASES = ['heroBlock', 'ctaBlock', 'productTeaserBlock'];

  it.each(EXPECTED_ALIASES)('alias %s is registered', alias => {
    expect(getBlockComponent(alias)).not.toBeNull();
  });
});
