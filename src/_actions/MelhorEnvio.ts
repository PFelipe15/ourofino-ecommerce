'use server'

import axios from 'axios';
import { ResponseDataMelhorEnvio } from '../../types/melhor-envio';


interface CotacaoFrete {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  products: {
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
  }[];
}


const AccessToken = process.env.MELHOR_ENVIO_TOKEN;
export const cotarFreteCliente = async (cep: string, peso: number, comprimento: number, altura: number, largura: number): Promise<ResponseDataMelhorEnvio[]> => {

  try {
    const data: CotacaoFrete = {
      from: {
        postal_code: "01001000", // CEP de origem (exemplo: São Paulo)
      },
      to: {
        postal_code: cep,
      },
      products: [
        {
          id: "1", // ID do produto (pode ser um valor fixo para cotação)
          width: largura,
          height: altura,
          length: comprimento,
          weight: peso,
          insurance_value: 0, // Valor do seguro (opcional)
          quantity: 1,
        },
      ],
    };

    const response = await axios.post<ResponseDataMelhorEnvio[]>(
      'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
      data,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AccessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao cotar frete:', error);
    throw new Error('Não foi possível realizar a cotação do frete');
  }
};

 

