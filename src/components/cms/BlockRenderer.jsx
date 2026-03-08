import { getBlockComponent } from './BlockRegistry.js';

// Renders an ordered list of CMS blocks.
// blocks: [{ alias: string, data: object }]
// Unknown aliases are skipped with a console.warn — they never throw.
export default function BlockRenderer({ blocks }) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-8">
      {blocks.map((block, idx) => {
        const Component = getBlockComponent(block.alias);
        if (!Component) {
          console.warn(`[BlockRenderer] Unknown block alias: "${block.alias}". Skipping.`);
          return null;
        }
        return <Component key={idx} {...(block.data ?? {})} />;
      })}
    </div>
  );
}
