'use client';
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {getProductById} from '@/_actions/Products'
import ProductDetails from '@/components/layout/store/product-details'
import { ProductIdResponse } from '../../../../types/product-id-strape';
import qs from "qs";
import {getProductsByFilter} from '@/_actions/Products';
import { ProductsAllResponse, ProductsData } from '../../../../types/product-all-strape';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    async function fetchProduct() {
      if (id) {
        const query = qs.stringify(
          {
            filters: {
              id: {
                $eq: id,
              },
            },
          },
          {
            encodeValuesOnly: true,
          }
        );

        const fetchedProduct = await getProductsByFilter(query);
        setProduct(fetchedProduct[0]);
        setLoading(false);
        
        // Centraliza o elemento após a navegação
        const element = document.getElementById(id as string);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) {  
    return (
      <div className=' scroll-smooth  container mx-auto items-center'>
      <div className="flex flex-col md:flex-row p-6 space-x-6 animate-pulse">
      <div className="flex-1 bg-zinc-300 h-[600px] rounded-lg"></div>
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="bg-zinc-300 h-12 w-1/2 rounded mb-4"></h2>
        <p className="bg-zinc-300 h-4 w-1/4 rounded mb-2"></p>
        <p className="bg-zinc-300 h-8 w-1/3 rounded mb-4"></p>
        <div className="flex items-center space-x-2 mb-4 ">
          <span className="bg-zinc-300 h-8 w-8 rounded-full"></span>
          <span className="bg-zinc-300 h-8 w-8 rounded-full"></span>
          <span className="bg-zinc-300 h-8 w-8 rounded-full"></span>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <button className="bg-zinc-300 h-10 w-24 rounded"></button>
          <button className="bg-zinc-300 h-10 w-10 rounded"></button>
        </div>
        <div className="flex flex-col">
          <h3 className="bg-zinc-300 h-6 w-1/2 rounded mb-2"></h3>
          <p className="bg-zinc-300 h-4 w-full rounded mb-2"></p>
          <p className="bg-zinc-300 h-4 w-full rounded"></p>
        </div>
      </div>
    </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} />
    </div>
  )
}