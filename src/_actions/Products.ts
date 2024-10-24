"use server";

import { ProductsAllResponse, ProductsData } from "../../types/product-all-strape";
import { ProductIdResponse } from "../../types/product-id-strape";

export const getProductById = async (id: string | string[]) => {
   
  const token = process.env.STRAPI_TOKEN;
  if (!token) throw new Error("Token de API Shopify não encontrado");

  // Buscar produto
  const productResponse = await fetch(
    `http://localhost:1337/api/products/${id}?populate=*`,
    {
      headers: {
        "X-Shopify-Access-Token": token,
      },
    }
  );

  const productData = await productResponse.json();

  // Buscar variações
  const variationsResponse = await fetch(
    `http://localhost:1337/api/variations?populate=*`,
    {
      headers: {
        "X-Shopify-Access-Token": token,
      },
    }
  );

  const variationsData = await variationsResponse.json();
  // Associar variações ao produto
const productWithVariations = {
  ...productData,
    variants: variationsData.data.filter((variation: { attributes: { product: { data: { id: string } } } }) => 
      variation.attributes.product.data.id == id
    ),

  };

    return productWithVariations as ProductIdResponse ;
};

export const getAllProducts = async () => {
    const token = process.env.STRAPI_TOKEN;
    if (!token) throw new Error("Token de API Strapi não encontrado");
 
    // Buscar produtos
    const productsResponse = await fetch(
     `http://localhost:1337/api/products?populate=*`,
     {
       headers: {
          "Authorization": `Bearer ${token}`,
       },
     }
   );
   
    const productsData = await productsResponse.json(); // Atualizar a tipagem
     // Buscar variações
    const variationsResponse = await fetch(
     `http://localhost:1337/api/variations?populate=*`,
     {
       headers: {
          "Authorization": `Bearer ${token}`,
       },
     }
   );
 
    const variationsData = await variationsResponse.json();
 
    // Associar variações aos produtos
    const productsWithVariations = productsData.data.map((product: { id: any; attributes: any; }) => {
       const productVariations = variationsData.data.filter((variation: { attributes: { product: { data: { id: any; }; }; }; }) => 
          variation.attributes.product.data.id === product.id
       );
       return {
          ...product,
          attributes: {
             ...product.attributes,
             variants: productVariations.map((variation: { attributes: { min_size: any; max_size: any; price: any; weight: any; }; }) => ({
                min_size: variation.attributes.min_size,
                max_size: variation.attributes.max_size,
                price: variation.attributes.price,
                weight: variation.attributes.weight,
             })),
          },
       };
    });
 
   
    return productsWithVariations as ProductsAllResponse[]; // Retornar produtos com variações
 };

export const getProductsByFilter = async (filter:string): Promise<ProductsData[]> => {
    const token = process.env.STRAPI_TOKEN;
  if (!token) throw new Error("Token de API Strapi não encontrado");

     const productsResponse = await fetch(
   `http://localhost:1337/api/products?populate=*&${filter}`,
   {
     headers: {
        "Authorization": `Bearer ${token}`,
     },
   }
 );


 
  const productsData:ProductsAllResponse = await productsResponse.json() 
  
return productsData.data;  


};