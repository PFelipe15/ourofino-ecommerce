import { ProductsData } from '../../../../types/product-all-strape';
import ProductCardWithVariants from './Product-Card/ProductCardWithVariants';
import ProductCardWithoutVariants from './Product-Card/ProductCardWithoutVariants';

export default function ProductCard({ product }: { product: ProductsData }) {
  const hasVariant = product.attributes.variants_price !== null;

  if (hasVariant) {
    return <ProductCardWithVariants product={product} />;
  } else {
    return <ProductCardWithoutVariants product={product} />;
  }
}