"use server";

import type { ProductProps } from "../../types/product-type";

const getAllProducts = async () => {
  const token = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API;
  if (!token) throw new Error("Token de API Shopify não encontrado");


  const products = await fetch(
    `https://6bc81c-70.myshopify.com/admin/api/2024-04/products.json?`,
    {
      headers: {
        "X-Shopify-Access-Token": token,
      },
    }
  );
  const data = await products.json();
  return data.products as ProductProps[];
};

export default getAllProducts;
