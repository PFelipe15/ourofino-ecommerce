'use server'
import qs from 'qs'

export const getParametroLoginRequeridoAtendimento = async (): Promise<boolean> => {
    const token = process.env.STRAPI_TOKEN;
    const host = process.env.HOST;
   
    if (!token) throw new Error("Token de API Strapi não encontrado");
    if (!host) throw new Error("Host não encontrado");

const query = qs.stringify({
    populate: '*',
    filters: {
        slug: {
            $eq: 'login-requerido-atendimento'
        }
    }
}, {
    encodeValuesOnly: true,
});

    const response = await fetch(`${host}/api/parametros?${query}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

     if (!response.ok) throw new Error("Erro ao buscar parâmetros");
    const data = await response.json();

 
    return data.data[0].attributes.configuracao;
}


