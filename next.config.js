/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 15
  // experimental 기능들을 제거하여 배포 안정성 확보
  
  // Firebase 최적화 설정
  webpack: (config, { isServer }) => {
    // Firebase 모듈 최적화
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Firebase 번들 크기 최적화
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        firebase: {
          test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
          name: 'firebase',
          chunks: 'all',
          priority: 10,
        },
      },
    };
    
    return config;
  },
  
  // 환경 변수 최적화
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 이미지 최적화
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  
  // 압축 활성화
  compress: true,
  
  // 성능 최적화
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
