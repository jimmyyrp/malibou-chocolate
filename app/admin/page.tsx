'use client';

import { ProductsProvider } from '../../src/context/ProductsProvider';
import { AdminDashboard } from '../../src/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <ProductsProvider>
      <AdminDashboard />
    </ProductsProvider>
  );
}