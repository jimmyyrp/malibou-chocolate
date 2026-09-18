import type { MetadataRoute } from 'next';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/katalog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tentang`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/kontak`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/katalog?kategori=${category.id}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${SITE_URL}/produk/${product.id}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}