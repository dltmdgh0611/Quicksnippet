'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DarkVeil from '@/components/DarkVeil';
import { useAuth } from '@/contexts/AuthContext';

interface SnippetData {
  what: string;
  why: string;
  highlight: string;
  lowlight: string;
  tomorrow: string;
}

export default function HealthPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [snippetData, setSnippetData] = useState<SnippetData | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [apiResponse, setApiResponse] = useState<string>('');

  useEffect(() => {
    // Check if snippet data exists in sessionStorage
    const savedSnippet = sessionStorage.getItem('snippetData');
    if (savedSnippet) {
      setSnippetData(JSON.parse(savedSnippet));
    }

    // Load team ID from localStorage
    const savedTeamId = localStorage.getItem('teamId');
    if (savedTeamId) {
      setTeamId(savedTeamId);
    }
  }, []);


  const handleGoBack = () => {
    router.push('/snippet');
  };

  const handleSubmit = async () => {
    if (!snippetData || !user || selectedRating === null) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd format
      const content = `What: ${snippetData.what}\nWhy: ${snippetData.why}\nHighlight: ${snippetData.highlight}\nLowlight: ${snippetData.lowlight}\nTomorrow: ${snippetData.tomorrow}`;
      
      const response = await fetch('https://n8n.1000.school/webhook/0a43fbad-cc6d-4a5f-8727-b387c27de7c8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          api_id: teamId || 'default',
          snippet_date: today,
          content: content
        }),
      });

      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);
      
      const responseText = await response.text();
      console.log('API Response Body:', responseText);

      // 웹에 응답 표시
      setApiResponse(`Status: ${response.status}\nResponse: ${responseText}`);

      if (response.ok) {
        // n8n webhook 성공 후 Firebase Firestore에도 저장
        try {
          const dbResponse = await fetch('/api/team-health', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_email: user.email,
              team_id: teamId || 'default',
              snippet_date: today,
              content: content,
              rating: selectedRating
            }),
          });
          
          if (dbResponse.ok) {
            console.log('Health check data saved to Firebase Firestore');
          }
        } catch (dbError) {
          console.error('Firebase Firestore save failed:', dbError);
        }
        
        alert('스니펫이 성공적으로 저장되었습니다!');
        // sessionStorage.removeItem('snippetData');
        // router.push('/');
      } else {
        console.error('API Error:', response.status, responseText);
        throw new Error(`저장에 실패했습니다. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={120}
          noiseIntensity={0.02}
          scanlineIntensity={0.05}
          speed={0.2}
          scanlineFrequency={30}
          warpAmount={0.1}
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
            <Link href="/" className="text-white hover:text-purple-glow transition-colors">
              홈
            </Link>
            <Link href="/login" className="text-white hover:text-purple-glow transition-colors">
              로그인
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-2xl">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h1 className="text-3xl font-bold text-center mb-8">팀 헬스체크</h1>
            
            {snippetData ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">오늘의 팀 상태는 어떠신가요?</h2>
                  <p className="text-sm text-gray-300 mb-6">
                    팀의 전반적인 상태를 1-10점으로 평가해주세요
                  </p>
                </div>
                
                {/* Rating Buttons */}
                <div className="flex justify-center space-x-2 mb-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`w-12 h-12 rounded-full border-2 transition-all text-lg font-medium ${
                        selectedRating === rating
                          ? 'bg-purple-glow border-purple-glow text-white'
                          : 'border-white/30 text-white hover:border-purple-glow hover:bg-white/10'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>

                {/* Rating Description */}
                {selectedRating && (
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-300">
                      {selectedRating <= 3 && "팀에 문제가 있는 것 같습니다. 개선이 필요해요."}
                      {selectedRating >= 4 && selectedRating <= 6 && "팀 상태가 보통입니다. 더 나아질 수 있어요."}
                      {selectedRating >= 7 && selectedRating <= 8 && "팀 상태가 좋습니다. 잘하고 있어요!"}
                      {selectedRating >= 9 && "팀 상태가 매우 좋습니다. 훌륭해요!"}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleGoBack}
                    className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    이전으로 돌아가기
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={selectedRating === null || isSubmitting}
                    className="px-6 py-3 bg-purple-glow text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{isSubmitting ? '전송 중...' : '최종 전송'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">🏥</div>
                <h2 className="text-xl font-semibold mb-4">스니펫을 먼저 작성해주세요</h2>
                <p className="text-gray-300 mb-6">
                  팀 헬스체크를 하려면 먼저 스니펫을 작성해야 합니다.
                </p>
                <Link href="/snippet" className="btn-primary">
                  스니펫 작성하기
                </Link>
              </div>
            )}

            {/* API Response Display */}
            {apiResponse && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">API 응답</h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-black/20 p-3 rounded">
                  {apiResponse}
                </pre>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
