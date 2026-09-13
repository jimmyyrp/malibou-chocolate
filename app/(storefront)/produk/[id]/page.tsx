'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProductDetailPage } from '../../../../src/components/ProductDetailPage';

export default function ProductDetailRoute() {
  const params = useParams<{ id: string }>();
  const raw = Array.isArray(params.id) ? params.id[0] : String(params.id ?? '');

  return <ProductDetailPage productParam={raw} />;
}