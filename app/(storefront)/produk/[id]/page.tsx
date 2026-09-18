import type { Metadata } from 'next';
import ProductDetailRouter from '../../../../src/components/ProductDetailRouter';
import { JsonLd } from '../../../../src/components/JsonLd';
import { PRODUCTS } from '../../../../src/data/products';
import { canonicalProductUrl, resolveProductByParam } from '../../../../src/lib/productResolver';
import { breadcrumbSchema, productSchema } from '../../../../src/lib/structuredData';
import { SITE_URL } from '../../../../src/lib/site';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return PRODUCTS.map((product) => ({ id: String(product.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = resolveProductByParam(id);

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Coklat Malibou',
      description:
        'Produk yang Anda cari tidak tersedia. Lihat katalog lengkap coklat Malibou Padang Pariaman.',
      robots: { index: false, follow: true },
    };
  }

  const canonical = canonicalProductUrl(id);

  return {
    title: `${product.name} — Coklat Malibou Padang Pariaman`,
    description: `${product.description} Pesan ${product.name} resmi dari Malibou Chocolate, olahan cokelat fermentasi asli Padang Pariaman. Halal MUI, standar SNI, kirim ke seluruh Indonesia.`,
    alternates: {
      canonical: canonical ?? undefined,
    },
    openGraph: {
      title: `${product.name} — Coklat Malibou`,
      description: product.description,
      url: canonical ?? undefined,
      type: 'website',
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — Coklat Malibou`,
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const product = resolveProductByParam(id);

  return (
    <>
      {product && (
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: 'Beranda', url: '/' },
              { name: 'Katalog', url: '/katalog' },
              { name: product.categoryName, url: `/katalog?kategori=${product.category}` },
              { name: product.name, url: `/produk/${product.id}` },
            ]),
            productSchema(product),
          ]}
        />
      )}
      <ProductDetailRouter />
    </>
  );
}