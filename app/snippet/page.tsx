'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DarkVeil from '@/components/DarkVeil';
import { useAuth } from '@/contexts/AuthContext';

export default function SnippetPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [snippet, setSnippet] = useState({
    what: '',
    why: '',
    highlight: '',
    lowlight: '',
    tomorrow: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoadingTeamId, setIsLoadingTeamId] = useState(true);
  const [improvingField, setImprovingField] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [expandedContent, setExpandedContent] = useState('');
  const [analysis, setAnalysis] = useState<{
    scores: {
      growth: number;
      specificity: number;
      actionability: number;
      authenticity: number;
      clarity: number;
    };
    feedback: {
      growth: string;
      specificity: string;
      actionability: string;
      authenticity: string;
      clarity: string;
    };
  } | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadUserTeamId();
    }
  }, [user]);

  const loadUserTeamId = async () => {
    if (!user?.email) return;
    
    setIsLoadingTeamId(true);
    try {
      const response = await fetch(`/api/user?user_email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData.team_id && userData.team_id !== 'default') {
          setTeamId(userData.team_id);
        } else {
          setTeamId(null);
        }
      } else {
        setTeamId(null);
      }
    } catch (error) {
      console.error('Failed to load team ID:', error);
      setTeamId(null);
    } finally {
      setIsLoadingTeamId(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSnippet(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpandSection = (field: string) => {
    const currentValue = snippet[field as keyof typeof snippet];
    setExpandedField(field);
    setExpandedContent(currentValue);
  };

  const handleCloseExpanded = () => {
    setExpandedField(null);
    setExpandedContent('');
  };

  const handleSaveExpanded = () => {
    if (expandedField) {
      setSnippet(prev => ({
        ...prev,
        [expandedField]: expandedContent
      }));
    }
    handleCloseExpanded();
  };

  const handleImproveSection = async (field: string) => {
    const currentValue = snippet[field as keyof typeof snippet];
    
    if (!currentValue.trim()) {
      alert('먼저 내용을 작성해주세요.');
      return;
    }

    setImprovingField(field);
    
    try {
      const response = await fetch('/api/improve-snippet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: field,
          content: currentValue
        }),
      });

      if (!response.ok) {
        throw new Error('개선 요청에 실패했습니다.');
      }

      const result = await response.json();
      
      // 개선된 내용으로 업데이트
      setSnippet(prev => ({
        ...prev,
        [field]: result.improvedContent
      }));
      
    } catch (error) {
      console.error('Improve error:', error);
      alert('AI 개선 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setImprovingField(null);
    }
  };

  const handleImproveExpanded = async () => {
    if (!expandedField || !expandedContent.trim()) {
      alert('먼저 내용을 작성해주세요.');
      return;
    }

    setImprovingField(expandedField);
    
    try {
      const response = await fetch('/api/improve-snippet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: expandedField,
          content: expandedContent
        }),
      });

      if (!response.ok) {
        throw new Error('개선 요청에 실패했습니다.');
      }

      const result = await response.json();
      setExpandedContent(result.improvedContent);
      
    } catch (error) {
      console.error('Improve error:', error);
      alert('AI 개선 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setImprovingField(null);
    }
  };

  const handleSave = () => {
    // 팀 ID 체크
    if (!teamId) {
      alert('팀 ID가 설정되지 않았습니다. 설정 페이지에서 팀에 먼저 참여해주세요.');
      router.push('/settings');
      return;
    }

    // Check if all fields are filled
    const isComplete = Object.values(snippet).every(value => value.trim() !== '');
    
    if (!isComplete) {
      alert('모든 필드를 작성해주세요.');
      return;
    }

    // Save to sessionStorage
    sessionStorage.setItem('snippetData', JSON.stringify(snippet));
    
    // Navigate to health check page
    router.push('/health');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snippet),
      });

      if (!response.ok) {
        throw new Error('분석 요청에 실패했습니다.');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <DarkVeil
            hueShift={300}
            noiseIntensity={0.04}
            scanlineIntensity={0.1}
            speed={0.6}
            scanlineFrequency={60}
            warpAmount={0.25}
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
          hueShift={300}
          noiseIntensity={0.04}
          scanlineIntensity={0.1}
          speed={0.6}
          scanlineFrequency={60}
          warpAmount={0.25}
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
            <Link href="/settings" className="text-white hover:text-purple-glow transition-colors">
              개인 설정
            </Link>
                <Link href="/dashboard" className="text-white hover:text-purple-glow transition-colors">
                  헬스체크
                </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Daily Snippet</h1>
            <p className="text-gray-300">오늘 하루를 기록하고 AI가 분석해드립니다</p>
            {!isLoadingTeamId && !teamId && (
              <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 font-medium">⚠️ 팀 ID가 설정되지 않았습니다.</p>
                <p className="text-red-200 text-sm mt-1">
                  스니펫을 저장하려면 먼저{' '}
                  <Link href="/settings" className="underline hover:text-white">
                    설정 페이지
                  </Link>
                  에서 팀에 참여해주세요.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 작성 폼 */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">오늘의 기록</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      What? (무엇을 했나요?)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExpandSection('what')}
                        className="text-xs px-2 py-1 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-all flex items-center"
                        title="확대하기"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleImproveSection('what')}
                        disabled={improvingField === 'what'}
                        className="text-xs px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {improvingField === 'what' ? (
                          <>
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>개선 중...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Magic Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={snippet.what}
                    onChange={(e) => handleInputChange('what', e.target.value)}
                    placeholder="오늘 한 일들을 구체적으로 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Why? (왜 그렇게 했나요?)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExpandSection('why')}
                        className="text-xs px-2 py-1 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-all flex items-center"
                        title="확대하기"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleImproveSection('why')}
                        disabled={improvingField === 'why'}
                        className="text-xs px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {improvingField === 'why' ? (
                          <>
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>개선 중...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Magic Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={snippet.why}
                    onChange={(e) => handleInputChange('why', e.target.value)}
                    placeholder="그렇게 한 이유나 동기를 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Highlight (오늘의 하이라이트)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExpandSection('highlight')}
                        className="text-xs px-2 py-1 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-all flex items-center"
                        title="확대하기"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleImproveSection('highlight')}
                        disabled={improvingField === 'highlight'}
                        className="text-xs px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {improvingField === 'highlight' ? (
                          <>
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>개선 중...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Magic Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={snippet.highlight}
                    onChange={(e) => handleInputChange('highlight', e.target.value)}
                    placeholder="오늘 가장 좋았던 순간이나 성과를 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Lowlight (어려웠던 점)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExpandSection('lowlight')}
                        className="text-xs px-2 py-1 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-all flex items-center"
                        title="확대하기"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleImproveSection('lowlight')}
                        disabled={improvingField === 'lowlight'}
                        className="text-xs px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {improvingField === 'lowlight' ? (
                          <>
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>개선 중...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Magic Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={snippet.lowlight}
                    onChange={(e) => handleInputChange('lowlight', e.target.value)}
                    placeholder="오늘 어려웠던 점이나 아쉬웠던 부분을 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Tomorrow (내일 계획)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExpandSection('tomorrow')}
                        className="text-xs px-2 py-1 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-all flex items-center"
                        title="확대하기"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleImproveSection('tomorrow')}
                        disabled={improvingField === 'tomorrow'}
                        className="text-xs px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {improvingField === 'tomorrow' ? (
                          <>
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>개선 중...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Magic Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={snippet.tomorrow}
                    onChange={(e) => handleInputChange('tomorrow', e.target.value)}
                    placeholder="내일 할 일이나 목표를 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
                  >
                    {isAnalyzing ? 'AI 분석 중...' : 'AI 가채점'}
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>

            {/* AI 분석 결과 */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">AI 분석 결과</h2>
              
              {isAnalyzing ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-glow mx-auto mb-4"></div>
                    <p className="text-gray-300">AI가 분석 중입니다...</p>
                  </div>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* 점수 표시 */}
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">📊 평가 점수 (20점 만점)</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-sm font-medium text-green-400">성장성</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-green-400">{analysis.scores.growth}/20</div>
                          <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-400 transition-all duration-500"
                              style={{ width: `${(analysis.scores.growth / 20) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-400">구체성</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-blue-400">{analysis.scores.specificity}/20</div>
                          <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-400 transition-all duration-500"
                              style={{ width: `${(analysis.scores.specificity / 20) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                          <span className="text-sm font-medium text-purple-400">실행력</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-purple-400">{analysis.scores.actionability}/20</div>
                          <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-400 transition-all duration-500"
                              style={{ width: `${(analysis.scores.actionability / 20) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <span className="text-sm font-medium text-yellow-400">진정성</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-yellow-400">{analysis.scores.authenticity}/20</div>
                          <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all duration-500"
                              style={{ width: `${(analysis.scores.authenticity / 20) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <span className="text-sm font-medium text-white">명확성</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-white">{analysis.scores.clarity}/20</div>
                          <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white transition-all duration-500"
                              style={{ width: `${(analysis.scores.clarity / 20) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 총점 */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">총점</span>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl font-bold text-white">
                            {analysis.scores.growth + analysis.scores.specificity + analysis.scores.actionability + analysis.scores.authenticity + analysis.scores.clarity}/100
                          </div>
                          <div className="w-32 h-3 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-glow transition-all duration-500"
                              style={{ width: `${((analysis.scores.growth + analysis.scores.specificity + analysis.scores.actionability + analysis.scores.authenticity + analysis.scores.clarity) / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 피드백 표시 */}
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">💡 상세 피드백</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-400 pl-4">
                        <div className="font-medium text-green-400 mb-1">성장성</div>
                        <div className="text-sm text-gray-200">{analysis.feedback.growth}</div>
                      </div>
                      <div className="border-l-4 border-blue-400 pl-4">
                        <div className="font-medium text-blue-400 mb-1">구체성</div>
                        <div className="text-sm text-gray-200">{analysis.feedback.specificity}</div>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-4">
                        <div className="font-medium text-purple-400 mb-1">실행력</div>
                        <div className="text-sm text-gray-200">{analysis.feedback.actionability}</div>
                      </div>
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <div className="font-medium text-yellow-400 mb-1">진정성</div>
                        <div className="text-sm text-gray-200">{analysis.feedback.authenticity}</div>
                      </div>
                      <div className="border-l-4 border-purple-glow pl-4">
                        <div className="font-medium text-purple-glow mb-1">명확성</div>
                        <div className="text-sm text-gray-200">{analysis.feedback.clarity}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-4">🤖</div>
                    <p>AI 가채점 버튼을 눌러서</p>
                    <p>오늘의 기록을 분석해보세요!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 확대 모달 */}
      {expandedField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-7xl h-[90vh] bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold">
                {expandedField === 'what' && 'What? (무엇을 했나요?)'}
                {expandedField === 'why' && 'Why? (왜 그렇게 했나요?)'}
                {expandedField === 'highlight' && 'Highlight (오늘의 하이라이트)'}
                {expandedField === 'lowlight' && 'Lowlight (어려웠던 점)'}
                {expandedField === 'tomorrow' && 'Tomorrow (내일 계획)'}
              </h2>
              <button
                onClick={handleCloseExpanded}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden">
              {/* 에디터 */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">편집</h3>
                  <button
                    onClick={handleImproveExpanded}
                    disabled={improvingField === expandedField}
                    className="text-xs px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {improvingField === expandedField ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>개선 중...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Magic Snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={expandedContent}
                  onChange={(e) => setExpandedContent(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors resize-none font-mono text-sm"
                  placeholder="내용을 작성하세요..."
                />
              </div>

              {/* 마크다운 미리보기 */}
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-3">미리보기</h3>
                <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg overflow-auto">
                  <div className="prose prose-invert max-w-none">
                    {expandedContent.split('\n').map((line, idx) => {
                      // 간단한 마크다운 렌더링
                      if (line.startsWith('# ')) {
                        return <h1 key={idx} className="text-3xl font-bold mb-4">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-2xl font-bold mb-3">{line.substring(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-xl font-bold mb-2">{line.substring(4)}</h3>;
                      } else if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <li key={idx} className="ml-4 mb-1">{line.substring(2)}</li>;
                      } else if (line.trim() === '') {
                        return <br key={idx} />;
                      } else {
                        return <p key={idx} className="mb-2">{line}</p>;
                      }
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-white/10">
              <button
                onClick={handleCloseExpanded}
                className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveExpanded}
                className="px-6 py-2 bg-purple-glow text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
