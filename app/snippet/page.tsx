'use client';

import { useState } from 'react';
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

  const handleInputChange = (field: string, value: string) => {
    setSnippet(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
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
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-glow rounded-full"></div>
            </div>
            <span className="text-xl font-bold">Quick Snippet</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/settings" className="text-white hover:text-purple-glow transition-colors">
              개인 설정
            </Link>
            <Link href="/health" className="text-white hover:text-purple-glow transition-colors">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 작성 폼 */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">오늘의 기록</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    What? (무엇을 했나요?)
                  </label>
                  <textarea
                    value={snippet.what}
                    onChange={(e) => handleInputChange('what', e.target.value)}
                    placeholder="오늘 한 일들을 구체적으로 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Why? (왜 그렇게 했나요?)
                  </label>
                  <textarea
                    value={snippet.why}
                    onChange={(e) => handleInputChange('why', e.target.value)}
                    placeholder="그렇게 한 이유나 동기를 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Highlight (오늘의 하이라이트)
                  </label>
                  <textarea
                    value={snippet.highlight}
                    onChange={(e) => handleInputChange('highlight', e.target.value)}
                    placeholder="오늘 가장 좋았던 순간이나 성과를 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lowlight (어려웠던 점)
                  </label>
                  <textarea
                    value={snippet.lowlight}
                    onChange={(e) => handleInputChange('lowlight', e.target.value)}
                    placeholder="오늘 어려웠던 점이나 아쉬웠던 부분을 적어보세요..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-glow transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tomorrow (내일 계획)
                  </label>
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
                    className="flex-1 bg-purple-glow text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
