'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DarkVeil from '@/components/DarkVeil';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Firestore에서 사용자 데이터 로드
    if (user?.email) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      console.log('Loading user data for:', user.email);
      const response = await fetch(`/api/user?user_email=${encodeURIComponent(user.email)}`);
      console.log('User API response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        setTeamId(userData.team_id || '');
      } else {
        const errorData = await response.json();
        console.error('User API error:', errorData);
        setMessage(`사용자 데이터 로드 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      setMessage('사용자 데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamJoin = async () => {
    if (!teamId.trim()) {
      setMessage('팀 ID를 입력해주세요.');
      return;
    }

    if (!user?.email) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    setIsJoining(true);
    setMessage('');

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          team_id: teamId.trim()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('등록이 완료되었습니다!');
        // 성공 메시지 후 2초 뒤에 메시지 초기화
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(result.error || '팀 참여에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      setMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsJoining(false);
    }
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
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="팀 ID를 입력하세요"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors"
                  disabled={isJoining}
                />
                {message && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${
                    message.includes('완료') 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {message}
                  </div>
                )}
                <button 
                  onClick={handleTeamJoin}
                  disabled={isJoining || !teamId.trim()}
                  className="mt-3 px-4 py-2 bg-purple-glow text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? '참여 중...' : '팀 참여'}
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
