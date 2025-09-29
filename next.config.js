/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 15
  experimental: {
    optimizeCss: true,
  },
  // 폰트 최적화를 위한 설정
  optimizeFonts: true,
}

module.exports = nextConfig
