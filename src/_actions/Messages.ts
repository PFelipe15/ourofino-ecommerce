"use server";

export interface DefaultMessageProps {
    data: Daum[]
    meta: Meta
  }
  
  export interface Daum {
    id: number
    attributes: Attributes
  }
  
  export interface Attributes {
    mensagem: string
    remetente: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
  
  export interface Meta {
    pagination: Pagination
  }
  
  export interface Pagination {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
  
const getAllDefaultMessages = async () => {
  const token = process.env.STRAPI_TOKEN;
  if (!token) throw new Error("Token de API Strapi não encontrado");

  // Buscar produtos
  const messagesResponse = await fetch(
    `http://localhost:1337/api/default-messages?populate=*`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const messagesData: DefaultMessageProps = await messagesResponse.json();

  return messagesData
 };

export default getAllDefaultMessages;
