/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
                hostname: 'images.tcdn.com.br',
                
            },
            {
                hostname: 'cdn.shopify.com',
                
            }
        ]
    }
};

export default nextConfig;
