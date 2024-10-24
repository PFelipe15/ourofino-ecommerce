'use server'

export interface Collection {
    id: number;
    name: string;
    description: string;
    slug: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    collections: Collection[];
  }

export const getCategoriesAndCollections = async () => {
    const HOST = process.env.HOST;
    const TOKEN_STRAPI = process.env.STRAPI_TOKEN;

    const response = await fetch(`${HOST}/api/collections?populate=*`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${TOKEN_STRAPI}`,
        },
    });

    const data = await response.json();

    // Organizar os dados por categoria
    const categoriesMap = new Map<number, Category>();

    data.data.forEach((item: any) => {
        const categoryId = item.attributes.categoria.data.id;
        const categoryName = item.attributes.categoria.data.attributes.nome;
        const collection = {
            id: item.id,
            name: item.attributes.name,
            description: item.attributes.description,
            slug: item.attributes.slug || item.attributes.name.toLowerCase().replace(/ /g, '-'),
        };

        if (!categoriesMap.has(categoryId)) {
            categoriesMap.set(categoryId, {
                id: categoryId,
                name: categoryName,
                collections: [],
            });
        }

        categoriesMap.get(categoryId)?.collections.push(collection);
    });

    return Array.from(categoriesMap.values());
};


export const getCategoryByName = async (categoryName: string): Promise<Category | null> => {
    const HOST = process.env.HOST;
    const TOKEN_STRAPI = process.env.STRAPI_TOKEN;

    const categories = await getCategoriesAndCollections();
    return categories.find(category => category.name.toLowerCase() === categoryName.toLowerCase()) || null;
};

export const getCollectionByName = async (collectionName: string): Promise<Collection | null> => {
    const HOST = process.env.HOST;
    const TOKEN_STRAPI = process.env.STRAPI_TOKEN;

    const categories = await getCategoriesAndCollections();
    for (const category of categories) {
        const collection = category.collections.find(
            collection => collection.name.toLowerCase() === collectionName.toLowerCase() || 
                          collection.slug.toLowerCase() === collectionName.toLowerCase()
        );
        if (collection) {
            return collection;
        }
    }
    return null;
};
