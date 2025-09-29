'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DarkVeil from '@/components/DarkVeil';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    // Load team ID from localStorage
    const savedTeamId = localStorage.getItem('teamId');
    if (savedTeamId) {
      setTeamId(savedTeamId);
    }
  }, []);

  const handleTeamIdChange = (value: string) => {
    setTeamId(value);
    localStorage.setItem('teamId', value);
  };

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <DarkVeil
            hueShift={200}
            noiseIntensity={0.03}
            scanlineIntensity={0.08}
            speed={0.4}
            scanlineFrequency={40}
            warpAmount={0.15}
          />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
            <Link href="/login" className="btn-primary">
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={200}
          noiseIntensity={0.03}
          scanlineIntensity={0.08}
          speed={0.4}
          scanlineFrequency={40}
          warpAmount={0.15}
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
                <Link href="/dashboard" className="text-white hover:text-purple-glow transition-colors">
                  헬스체크
                </Link>
            <button
              onClick={logout}
              className="text-white hover:text-purple-glow transition-colors"
            >
              로그아웃
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-2xl">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h1 className="text-3xl font-bold text-center mb-8">개인 설정</h1>
            
            {/* 사용자 정보 */}
            <div className="mb-8 p-6 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="프로필"
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{user.displayName || '사용자'}</h2>
                  <p className="text-gray-300">{user.email}</p>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                <p>가입일: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ko-KR') : '알 수 없음'}</p>
                <p>마지막 로그인: {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('ko-KR') : '알 수 없음'}</p>
              </div>
            </div>

            {/* 설정 옵션 */}
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="mb-3">
                  <h3 className="font-medium">팀 ID</h3>
                  <p className="text-sm text-gray-300">팀에 참여하기 위한 ID를 입력하세요</p>
                </div>
                <input
                  type="text"
                  value={teamId}
                  onChange={(e) => handleTeamIdChange(e.target.value)}
                  placeholder="팀 ID를 입력하세요"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors"
                />
                <button 
                  onClick={() => handleTeamIdChange(teamId)}
                  className="mt-3 px-4 py-2 bg-purple-glow text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  팀 참여
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <div className="mb-3">
                  <h3 className="font-medium">개발자에게 후원하기</h3>
                  <p className="text-sm text-gray-300">서비스 개선을 위한 후원을 부탁드립니다</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-300 mb-1">기업은행</p>
                  <p className="font-mono text-lg">97406010101011</p>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText('97406010101011')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  계좌번호 복사
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/" className="btn-secondary">
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
