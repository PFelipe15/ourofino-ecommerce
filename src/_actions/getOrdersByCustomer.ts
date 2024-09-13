'use server'

const getOrdersByCustomer = async (email: string) => {
    const token = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API;
    if (!token) throw new Error("Token de API Shopify não encontrado");

    const clienteShopify = await fetch(`https://6bc81c-70.myshopify.com/admin/api/2024-04/customers/search.json?query=email:${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token
        },
    });

    const dataClient = await clienteShopify.json();
 
    if (!dataClient.customers || dataClient.customers.length === 0) {
        return []; // Retorna um array vazio se não encontrar o cliente
    }

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
 
    // Retorna apenas o array de pedidos, não o objeto completo
    return data.orders || [];
};

export default getOrdersByCustomer;