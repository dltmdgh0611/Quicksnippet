'use client';

import { useState } from 'react';
import Link from 'next/link';
import DarkVeil from '@/components/DarkVeil';
import ShinyText from '@/components/ShinyText';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const [backgroundParams, setBackgroundParams] = useState({
    hueShift: 0,
    noiseIntensity: 0,
    scanlineIntensity: 0,
    speed: 0.5,
    scanlineFrequency: 0,
    warpAmount: 0,
  });

  const changeBackground = () => {
    setBackgroundParams({
      hueShift: Math.random() * 360,
      noiseIntensity: Math.random() * 0.1,
      scanlineIntensity: Math.random() * 0.3,
      speed: 0.3 + Math.random() * 0.7,
      scanlineFrequency: Math.random() * 100,
      warpAmount: Math.random() * 0.5,
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={backgroundParams.hueShift}
          noiseIntensity={backgroundParams.noiseIntensity}
          scanlineIntensity={backgroundParams.scanlineIntensity}
          speed={backgroundParams.speed}
          scanlineFrequency={backgroundParams.scanlineFrequency}
          warpAmount={backgroundParams.warpAmount}
        />
      </div>

      {/* Header */}
      <header className="relative z-50">
        <nav className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <svg 
                className="w-8 h-8" 
                viewBox="0 0 24 24" 
                fill="none"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 12px rgba(255, 193, 7, 0.6))'
                }}
              >
                <defs>
                  <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="30%" stopColor="#FFA500" />
                    <stop offset="70%" stopColor="#FF8C00" />
                    <stop offset="100%" stopColor="#FF6347" />
                  </linearGradient>
                  <filter id="lightningGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path 
                  d="M7 2v11h3v9l7-12h-4l4-8z" 
                  fill="url(#lightningGradient)"
                  filter="url(#lightningGlow)"
                  style={{
                    stroke: '#FFD700',
                    strokeWidth: '0.5',
                    strokeLinejoin: 'round'
                  }}
                />
              </svg>
              {/* 3D highlight effect */}
              <div className="absolute top-0.5 left-0.5 w-2 h-3 bg-gradient-to-b from-white/60 to-transparent rounded-sm pointer-events-none"></div>
            </div>
            <span className="text-xl font-bold">Quick Snippet</span>
          </Link>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/settings" className="text-white hover:text-purple-glow transition-colors">
                  개인 설정
                </Link>
                <button
                  onClick={logout}
                  className="text-white hover:text-purple-glow transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login" className="text-white hover:text-purple-glow transition-colors">
                로그인
              </Link>
            )}
                <Link href="/dashboard" className="text-white hover:text-purple-glow transition-colors">
                  헬스체크
                </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 -mt-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Patch Notes Banner */}
          <Link
            href="/patch-notes"
            className="inline-block mb-8 group"
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40 rounded-full hover:border-purple-glow transition-all duration-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-300 group-hover:text-purple-glow transition-colors">
                🎉 v1.1.0 업데이트 - 확대 편집 & Magic Snippet 개선
              </span>
              <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-glow transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <ShinyText 
              text="Daily Snippet" 
              disabled={false}
              speed={3}
              className="text-white text-5xl md:text-7xl font-bold"
            />
            <br />
            <ShinyText 
              text="쉽고 빠른 추적 관리" 
              disabled={false}
              speed={4}
              className="text-white text-5xl md:text-7xl font-bold"
            />
          </h1>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/snippet" className="btn-primary text-lg px-8 py-4">
              Get Started
            </Link>
            <Link href="/patch-notes" className="btn-secondary text-lg px-8 py-4">
              More Info
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto">
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Ascentum</h3>
                    <p className="text-sm text-gray-400">Innovation Team</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                  팀의 성장과 발전을 위한 혁신적인 솔루션을 제공합니다. 
                  Quick Snippet을 통해 일상의 성찰을 체계적으로 관리하세요.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/snippet" className="text-gray-300 hover:text-purple-glow transition-colors text-sm">
                      스니펫 작성
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-gray-300 hover:text-purple-glow transition-colors text-sm">
                      팀 헬스체크
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="text-gray-300 hover:text-purple-glow transition-colors text-sm">
                      개인 설정
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">이승호</p>
                  <p className="text-gray-300 text-sm">Developer</p>
                  <p className="text-gray-300 text-sm">ascentum@team.com</p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Ascentum Team. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Made with ❤️ by Ascentum</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
