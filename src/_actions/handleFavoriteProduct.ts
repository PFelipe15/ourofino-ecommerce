'use server'

import qs from 'qs'
import { getCustomerOrCreate, userData } from './Customers';

export type ResponseDataFavoriteProduct = {
  data: ResponseFavoritesProducts[];
  meta: { 
    pagination: { 
      page: number, 
      pageSize: number,
      pageCount: number,
      total: number 
    }
   }
}
export interface ResponseFavoritesProducts {
  id: number
  attributes: Attributes
}

export interface Attributes {
  createdAt: string
  updatedAt: string
  publishedAt: string
  customer: any[]
  product: any[]
}
 
export const createFavoriteProduct = async (product_id: number, user: userData) => {
    const HOST = process.env.HOST;
    const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
    
    // 1. Obter o ID do cliente correspondente ao email
    const hasCliente = await fetch(`${HOST}/api/customers?filters[email][$eq]=${user.data.email}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${TOKEN_STRAPI}`,
        },
    });

    const clienteData = await hasCliente.json();
    let customerId = clienteData.data[0]?.id; 

    if (!customerId) {
        const customer = await getCustomerOrCreate(user)
        customerId = customer.id
    }

    const favoriteResponse = await fetch(`${HOST}/api/favorites`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${TOKEN_STRAPI}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            data: {
                customer: {
                    connect: [customerId] // Usar o ID do cliente encontrado
                },
                product: {
                    connect: [product_id]
                }
            }
        })
    });

    if (!favoriteResponse.ok) {
        const errorData = await favoriteResponse.json();
        console.error("Resposta completa:", JSON.stringify(errorData));
        throw new Error(`Erro ao criar favorito: ${JSON.stringify(errorData)}`);
    }

    const favoriteResponseData = await favoriteResponse.json();
    return favoriteResponseData;
}
export const deleteFavoriteProduct = async(product_id: number, customer_email: string) => { 
 
    const HOST = process.env.HOST;
    const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
 
    // 1. Obter o ID do favorito correspondente ao produto e ao cliente
    const query = qs.stringify({
        filters: {
            customer: {
                email: {
                    $eq: customer_email,
                },
            },
            product: {
                id: {
                    $eq: product_id,
                },
            },
        },
    });

    const favoriteResponse = await fetch(`${HOST}/api/favorites?${query}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${TOKEN_STRAPI}`,
        },
    });

    if (!favoriteResponse.ok) {
        const errorData = await favoriteResponse.json();
        console.error("Resposta completa:", JSON.stringify(errorData));
        throw new Error(`Erro ao buscar favorito: ${JSON.stringify(errorData)}`);
    }

    const favoriteData = await favoriteResponse.json();
    const favoriteId = favoriteData.data[0]?.id; // Obtém o ID do favorito

    if (!favoriteId) {
        throw new Error("Favorito não encontrado.");
    }

    // 2. Deletar o favorito usando o ID obtido
    const deleteResponse = await fetch(`${HOST}/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${TOKEN_STRAPI}`,
        }
    });

    if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        console.error("Resposta completa:", JSON.stringify(errorData));
        throw new Error(`Erro ao deletar favorito: ${JSON.stringify(errorData)}`);
    }

    const deleteResponseData = await deleteResponse.json();
     return deleteResponseData; 
}
export const getFavoriteProducts = async (customer_email: string | undefined) => {
    const HOST = process.env.HOST;
    const TOKEN_STRAPI = process.env.STRAPI_TOKEN;

    // 1. Obter os produtos favoritos com populate
            const favoritesResponse = await fetch(
                `${HOST}/api/favorites?filters[customer][email][$eq]=${customer_email}&populate=*`,
                {
                    headers: {
                        "Authorization": `Bearer ${TOKEN_STRAPI}`,
            },
        }
    );

    if (!favoritesResponse.ok) {
        const errorData = await favoritesResponse.json();
        console.error("Resposta completa:", JSON.stringify(errorData));
        throw new Error(`Erro ao buscar favoritos: ${errorData.error.message}`);
    }

    const favoritesData = await favoritesResponse.json();

     const productIds = favoritesData.data.map((favorite: { attributes: { product: { data: { id: any; }; }; }; }) => favorite.attributes.product.data.id);

    if(productIds.length === 0) {
      return []

    }
 
    const query = qs.stringify({
      filters: {
        id: {
          $in: productIds,
        },
      },
    }, {
      encodeValuesOnly: true,  
    });

    const productsResponse = await fetch(
        `${HOST}/api/products?${query}&populate=*`, // Usando o populate para obter todas as informações
        {
            headers: {
                "Authorization": `Bearer ${TOKEN_STRAPI}`,
            },
        }
    );



    if (!productsResponse.ok) {
        const errorData = await productsResponse.json();
        console.error("Resposta completa:", JSON.stringify(errorData));
        throw new Error(`Erro ao buscar produtos: ${errorData.error.message}`);
    }

    const productsData = await productsResponse.json();

    // 4. Formatar os produtos com variações no formato de ProductsResponse
    const productsWithVariations = productsData.data.map((product: { id: any; attributes: any; }) => {
        return {
            id: product.id,
            attributes: {
                name: product.attributes.name,
                createdAt: product.attributes.createdAt,
                updatedAt: product.attributes.updatedAt,
                publishedAt: product.attributes.publishedAt,
                description: product.attributes.description,
                active: product.attributes.active,
                hot: product.attributes.hot,
                images: product.attributes.images, // Presumindo que você tenha imagens
                collection: product.attributes.collection, // Presumindo que você tenha coleção
                variants: productVariations.map((variation: { min_size: any; max_size: any; price: any; weight: any; }) => ({
                    min_size: variation.min_size,
                    max_size: variation.max_size,
                    price: variation.price,
                    weight: variation.weight,
                })),
            },
        };
    });

    return productsWithVariations as ProductsResponse[]; // Retornar produtos formatados como ProductsResponse
}
export const getHasFavoriteProduct = async (product_id: number, email: string | undefined): Promise<boolean> => {
	const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;

	const query = qs.stringify({
		filters: {
			customer: {
				email: {
					$eq: email,
				},
			},
			product: {
				id: {
					$eq: product_id,
				},
			},
		},
	});

	const favoriteResponse = await fetch(`${HOST}/api/favorites?${query}&populate=*`, {
		method: 'GET',
		headers: {
			"Authorization": `Bearer ${TOKEN_STRAPI}`,
		},
	});

 
	if (!favoriteResponse.ok) {
		const errorData = await favoriteResponse.json();
		console.error("Resposta completa:", JSON.stringify(errorData));
		throw new Error(`Erro ao verificar favorito: ${errorData.error.message}`);
	}
  
	const favoriteData:ResponseDataFavoriteProduct = await favoriteResponse.json();
 
if(favoriteData.meta.pagination.total > 0){

  return true; // Retornar true se o produto favorito existir
}

return false

}
