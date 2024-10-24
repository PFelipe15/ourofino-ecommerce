'use server'
  
interface UserData {
    email: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    address: {
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
}
 

export async function SubmitAddress(UserData: UserData | null | undefined) {
    const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
  try{
    if (!UserData) {
        throw new Error("Dados de usuário ou endereço ausentes");
    }
    const hasCliente = await fetch(`${HOST}/api/customers?filters[email][$eq]=${UserData.email}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${TOKEN_STRAPI}`,
        },
    });


    const cliente = await hasCliente.json();
    let customerId;

    if (cliente.data.length > 0) {
         customerId = cliente.data[0].id;
     } else {
         const customerResponse = await fetch(`${HOST}/api/customers`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${TOKEN_STRAPI}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data:{
              email: UserData.email,
              phone: UserData.phone,
              first_name: UserData.firstName,
              last_name: UserData.lastName,
              address: UserData.address
            } }) 
        });

        if (!customerResponse.ok) {
            const errorData = await customerResponse.json();
            console.error("Resposta completa:", JSON.stringify(errorData));
            throw new Error(`Erro ao criar cliente: ${JSON.stringify(errorData)}`);
        }

        const newCustomer = await customerResponse.json();
         customerId = newCustomer.data.id;
    }
    
    const updateAddressCustomer = await fetch(`${HOST}/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
            "Authorization": `Bearer ${TOKEN_STRAPI}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data:{
            address: UserData.address
        } })
    });

    if (!updateAddressCustomer.ok) {
        const errorData = await updateAddressCustomer.json();
        console.error("Resposta completa:", JSON.stringify(errorData));
        throw new Error(`Erro ao atualizar endereço do cliente: ${JSON.stringify(errorData)}`);
    }

    return customerId; // Retorna customerId como uma Promise
}catch (error: unknown) { 
    if (error instanceof Error) { 
        throw new Error("Erro ao criar Customer: " + error.message);
    }
    throw new Error("Erro desconhecido ao criar Customer"); 
}
  
}