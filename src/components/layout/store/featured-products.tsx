import { useEffect, useState } from 'react';
import getAllProducts from "@/_actions/getProducts";
import ProductCard from "./product-card";
import { CarouselContent, CarouselItem, Carousel,CarouselPrevious,CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { ProductProps } from '../../../../types/product-type';

 
export default function FeaturedProducts() {
  const [products, setProducts] = useState<ProductProps[]>([]);

  useEffect(() => {
    getAllProducts().then((products) => setProducts(products));
  }, []);

  return (
    <div className="w-full p-4 mt-8 bg-slate-100">
      <div className="flex items-center flex-col">
        <h2 className="text-2xl font-bold text-center mb-6">Produtos em Destaque</h2>
        <div className="bg-primary h-1 mb-3 w-16"></div>
      </div>
      <div>
        <Carousel
           plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}
          className="container block"
        >
          <CarouselContent className="-ml-4">
            {products?.map((product) => (
              <CarouselItem
                key={product.id}
                className="flex gap-4 w-full items-center justify-center sm:basis-full md:basis-1/4"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 left-[-12px] bg-primary text-white hover:bg-yellow-800 " />
            <CarouselNext className="absolute top-1/2 right-[-12px] bg-primary text-white hover:bg-yellow-800  " />
        </Carousel>
      </div>
    </div>
  );
}
