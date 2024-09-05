"use server";

import type { ProductProps } from "../../types/product-type";

const getProductById = async (id: string | string[] ) => {

  const token = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API;
  if (!token) throw new Error("Token de API Shopify não encontrado");

  const product = await fetch(
    `https://6bc81c-70.myshopify.com/admin/api/2024-04/products/${id}.json`,
    {
      headers: {
        "X-Shopify-Access-Token": token,
      },
    }
  );
  
  const data = await product.json();
     return data.product as ProductProps;
};

export default getProductById;
