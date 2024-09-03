'use client';
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import getProductById from '@/_actions/getProductById'
import ProductDetails from '@/components/layout/store/product-details'
import { ProductProps } from '../../../../types/product-type';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductProps | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (id) {
        const fetchedProduct = await getProductById(id);
         setProduct(fetchedProduct);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} />
    </div>
  )
}