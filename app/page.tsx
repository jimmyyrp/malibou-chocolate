import { ProductsProvider } from '../src/context/ProductsProvider';
import App from '../src/App';

export default function HomePage() {
  return (
    <ProductsProvider>
      <App />
    </ProductsProvider>
  );
}