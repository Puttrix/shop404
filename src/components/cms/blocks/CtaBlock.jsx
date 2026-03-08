// CMS block: ctaBlock
// Renders a call-to-action card with a title, description and button.
export default function CtaBlock({ title, description, buttonText, buttonUrl }) {
  return (
    <div className="card">
      <div className="card-body p-6 sm:p-8">
        {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
        {description && <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>}
        {buttonText && buttonUrl && (
          <a href={buttonUrl} className="btn-primary">{buttonText}</a>
        )}
      </div>
    </div>
  );
}
