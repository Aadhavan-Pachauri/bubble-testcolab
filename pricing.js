// Price localization utilities
const exchangeRates = {
    USD: 1,
    EUR: 0.91,
    GBP: 0.79,
    INR: 82.75,
    AUD: 1.53,
    CAD: 1.36
};

const localeConfig = {
    en: { currency: 'USD', locale: 'en-US' },
    es: { currency: 'EUR', locale: 'es-ES' },
    fr: { currency: 'EUR', locale: 'fr-FR' },
    de: { currency: 'EUR', locale: 'de-DE' },
    in: { currency: 'INR', locale: 'en-IN' },
    au: { currency: 'AUD', locale: 'en-AU' },
    ca: { currency: 'CAD', locale: 'en-CA' }
};

// Format price based on locale
function formatPrice(amount, locale = 'en') {
    const config = localeConfig[locale] || localeConfig.en;
    const rate = exchangeRates[config.currency] || 1;
    const localAmount = amount * rate;

    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency
    }).format(localAmount);
}

// Update all prices on page
function updatePagePrices(locale = 'en') {
    document.querySelectorAll('[data-price]').forEach(el => {
        const basePrice = parseFloat(el.dataset.price);
        if (!isNaN(basePrice)) {
            el.textContent = formatPrice(basePrice, locale);
        }
    });
}