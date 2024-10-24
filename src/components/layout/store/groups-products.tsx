"use client";
import { useEffect, useState } from "react";
import {getAllProducts} from "@/_actions/Products";
import ProductCard from "./Product-Card/ProductCard";
import {
  CarouselContent,
  CarouselItem,
  Carousel,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {getProductsByFilter} from "@/_actions/Products";
import qs from "qs";
import { ProductsData } from "../../../../types/product-all-strape";
export default function GroupProducts({
  title,
  slug,
  id
}: {
  title: string;
  slug: string; // destaque | promocoes | novos
  id: string;
}) {
  const [products, setProducts] = useState<ProductsData[]>([]);
  const [loading, setLoading] = useState(true); // Adicionando estado de carregamento
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Verifica a largura da tela na montagem do componente
    window.addEventListener("resize", handleResize); // Adiciona o listener

    return () => {
      window.removeEventListener("resize", handleResize); // Limpa o listener
    };
  }, []);

  useEffect(() => {
    switch (slug) {
      case "destaque": {
        const query = qs.stringify(
          {
            filters: {
              hot: {
                $eq: true,
              },
            },
          },
          {
            encodeValuesOnly: true,
          }
        );
         getProductsByFilter(query).then((products) => {
          setProducts(products);
          setLoading(false); // Atualizando estado de carregamento
        });

        break;
      }

      case "promocoes": {
        break;
      }

      case "novos": {
        break;
      }

      default: {
        getAllProducts().then((products) => {
          setProducts(products);
          setLoading(false); // Atualizando estado de carregamento
        });

        break;
      }
    }
  }, []);

  return (
    <div className="w-full p-4 mt-8  " id={id}>
      <div className="flex items-center flex-col">
        <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
        <div className="bg-primary h-1 mb-3 w-16"></div>
      </div>
      <div>
        {loading ? (
          <div className="container flex">
            {Array.from({ length: isMobile ? 1 : 4 }).map((_, index) => ( // Verifica a largura da tela
              <div
                key={index}
                className="flex gap-4   mx-2 items-center justify-center sm:basis-1/1 md:basis-1/2"
              >
                <div className="w-full h-auto bg-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="aspect-square w-full overflow-hidden bg-gray-300 rounded-lg mb-4"></div>
                  <div className="flex flex-col justify-center items-center">
                    <div className="h-6 w-full bg-gray-400 rounded mb-2"></div>
                    <div className="h-4 w-[50%] bg-gray-400 rounded mb-2"></div>
                    <div className="h-4 w-[30%] bg-gray-400 rounded mb-2"></div>
                    <div className="h-4 w-[20%] bg-gray-400 rounded mb-2"></div>
                    <div className="h-8 rounded-md w-[97%] bg-gray-400 mt-4"></div>
                    <div className="h-8 rounded-md w-[97%] bg-gray-400 mt-4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}
            className="container block"
          >
            <CarouselContent className="-ml-4">
              {products?.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="flex gap-4 w-full items-center justify-center basis-full sm:basis-1/1  md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute top-1/2 left-[-12px] bg-primary text-white hover:bg-yellow-800 " />
            <CarouselNext className="absolute top-1/2 right-[-12px] bg-primary text-white hover:bg-yellow-800  " />
          </Carousel>
        )}
      </div>
    </div>
  );
}
