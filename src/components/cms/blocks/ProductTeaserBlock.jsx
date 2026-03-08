// CMS block: productTeaserBlock
// Renders a product teaser card using CMS-managed data (not the live product catalogue).
export default function ProductTeaserBlock({ productName, image, price, link }) {
  return (
    <div className="card">
      {image && (
        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <img src={image} alt={productName || ''} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          {productName && <h3 className="font-medium">{productName}</h3>}
          {price && <div className="font-semibold">{price}</div>}
        </div>
        {link && (
          <div className="mt-3">
            <a href={link} className="btn-secondary text-sm">View product</a>
          </div>
        )}
      </div>
    </div>
  );
}
