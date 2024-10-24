/** @type {import('next').NextConfig} */
const nextConfig = {
     images:{
        remotePatterns:[
            {
                hostname: 'images.tcdn.com.br',
                
            },
            {
                hostname: 'cdn.shopify.com',
                
            },
            {
                hostname:'localhost'
            },
            {
                hostname: 'www.mercadopago.com',
                
            },{
                hostname: 'http2.mlstatic.com',
            },
            {
                hostname: 'sandbox.melhorenvio.com.br',
            }
        ]
    }
};

export default nextConfig;
