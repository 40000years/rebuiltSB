/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // เพิ่ม domain ถ้าใช้ external images เช่น ['example.com']
    minimumCacheTTL: 60, // cache รูปภาพ 60 วินาทีเพื่อลดปัญหาการ cache เก่า
  },
  env: {
    NEXT_PUBLIC_USER_API_URL: process.env.NEXT_PUBLIC_USER_API_URL,
    NEXT_PUBLIC_PRODUCT_API_URL: process.env.NEXT_PUBLIC_PRODUCT_API_URL,
  },
  // ปิดการ compress เพื่อลด memory usage ใน build
  compress: false,
  // ใช้ standalone output สำหรับ Render.com
  output: 'standalone',
};

export default nextConfig;