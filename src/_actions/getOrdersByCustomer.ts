'use server'

const getOrdersByCustomer = async (email: string) => {
    const token = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API;
    if (!token) throw new Error("Token de API Shopify não encontrado");



    const clienteShopify = await fetch(`https://6bc81c-70.myshopify.com/admin/api/2024-04/customers/search.json?query=email:${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API!
        },
    });

    const dataClient = await clienteShopify.json();
 
    const customerId = dataClient.customers[0].id;

    const orders = await fetch(
        `https://6bc81c-70.myshopify.com/admin/api/2024-07/customers/${customerId}/orders.json`,
        {
          headers: {
            "X-Shopify-Access-Token": token,
          },
        }
      );

      const data = await orders.json();
 
    
    return data;
};

export default getOrdersByCustomer;