// Maps Umbraco block type aliases to their React components.
// Add new entries here when new block types are added in Umbraco.
import HeroBlock from './blocks/HeroBlock.jsx';
import CtaBlock from './blocks/CtaBlock.jsx';
import ProductTeaserBlock from './blocks/ProductTeaserBlock.jsx';

const registry = {
  heroBlock: HeroBlock,
  ctaBlock: CtaBlock,
  productTeaserBlock: ProductTeaserBlock,
};

// Returns the component for a given block alias, or null if not registered.
export function getBlockComponent(alias) {
  return registry[alias] ?? null;
}

export default registry;
