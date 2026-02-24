/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5000',
          pathname: '/uploads/**',
        },
        {
          protocol: 'https',
          hostname: 'localhost',
          port: '5000',
          pathname: '/uploads/**',
        },
        // Add your production domain when you deploy
        // {
        //   protocol: 'https',
        //   hostname: 'your-production-domain.com',
        //   pathname: '/uploads/**',
        // },
      ],
    },
  };
  
  export default nextConfig;