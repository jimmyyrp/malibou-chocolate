import { Product } from '@/types';
import { OPENING_HOURS, SITE_NAME, SITE_URL, BUSINESS } from './site';

export function organizationSchema() {
  const url = `${SITE_URL}/#organization`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': url,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    alternateName: 'Coklat Malibou',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/logo.png`,
    description: BUSINESS.description,
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS.address.streetAddress,
        addressLocality: BUSINESS.address.addressLocality,
        addressRegion: BUSINESS.address.addressRegion,
        postalCode: BUSINESS.address.postalCode,
        addressCountry: BUSINESS.address.addressCountry,
      },
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS.phone,
      contactType: 'customer service',
      availableLanguage: 'id',
    },
    sameAs: [BUSINESS.instagram],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: BUSINESS.description,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'id-ID',
  };
}

export function localBusinessSchema() {
  const url = `${SITE_URL}/#localbusiness`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': url,
    name: SITE_NAME,
    alternateName: 'Lapau Coklat Malibo',
    description: BUSINESS.description,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    logo: `${SITE_URL}/logo.png`,
    priceRange: BUSINESS.priceRange,
    telephone: BUSINESS.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.streetAddress,
      addressLocality: BUSINESS.address.addressLocality,
      addressRegion: BUSINESS.address.addressRegion,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.addressCountry,
    },
    openingHoursSpecification: OPENING_HOURS,
    sameAs: [BUSINESS.instagram],
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function productSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl],
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: product.categoryName,
    sku: `MB-${String(product.id).padStart(3, '0')}`,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/produk/${product.id}`,
      priceCurrency: 'IDR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(
        new Date().getFullYear() + 1,
        new Date().getMonth(),
        new Date().getDate()
      )
        .toISOString()
        .split('T')[0],
      seller: { '@id': `${SITE_URL}/#organization` },
    },
  };
}

export function itemListSchema(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Katalog Produk Coklat Malibou (${products.length} produk)`,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: `${SITE_URL}/produk/${product.id}`,
    })),
  };
}