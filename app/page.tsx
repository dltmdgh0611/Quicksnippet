'use client';

import { useState } from 'react';
import Link from 'next/link';
import DarkVeil from '@/components/DarkVeil';
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
    <div className="relative min-h-screen">
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
      <header className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-glow rounded-full"></div>
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
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Daily Snippet
            <br />
            쉽고 빠른 추적 관리
          </h1>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/snippet" className="btn-primary text-lg px-8 py-4">
              Get Started
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              More Info
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
