'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProductDetailPage } from '../../../../src/components/ProductDetailPage';

export default function ProductDetailRoute() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const productId = Number.isFinite(id) && id > 0 ? id : NaN;

  return <ProductDetailPage productId={productId} />;
}