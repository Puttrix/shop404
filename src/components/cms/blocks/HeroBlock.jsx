// CMS block: heroBlock
// Renders a full-width hero section with optional CTA button.
export default function HeroBlock({ heading, text, backgroundImage, ctaText, ctaLink }) {
  return (
    <section
      className="hero-section bg-gradient-to-br from-brand-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        {heading && <h2 className="text-4xl font-bold tracking-tight">{heading}</h2>}
        {text && <p className="mt-3 text-lg text-gray-700 dark:text-gray-300 max-w-2xl">{text}</p>}
        {ctaText && ctaLink && (
          <div className="mt-6">
            <a href={ctaLink} className="btn-primary">{ctaText}</a>
          </div>
        )}
      </div>
    </section>
  );
}
