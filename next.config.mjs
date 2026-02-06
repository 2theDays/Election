/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Vercel can also handle dynamic, but standard static export works well for data-heavy dashboards
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
