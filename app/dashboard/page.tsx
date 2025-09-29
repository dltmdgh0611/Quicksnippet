'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DarkVeil from '@/components/DarkVeil';
import { useAuth } from '@/contexts/AuthContext';

interface HealthCheckData {
  user_email: string;
  snippet_date: string;
  rating: number;
  content: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [healthData, setHealthData] = useState<HealthCheckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageScore, setAverageScore] = useState(0);
  const [selectedView, setSelectedView] = useState<'average' | string>('average');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  useEffect(() => {
    // Load team ID from localStorage
    const savedTeamId = localStorage.getItem('teamId');
    if (savedTeamId) {
      setTeamId(savedTeamId);
    }
  }, []);

  useEffect(() => {
    if (teamId) {
      fetchTeamHealthData();
    }
  }, [teamId]);

  const fetchTeamHealthData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/team-health?team_id=${teamId}`);
      
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        
        if (data.length > 0) {
          // Calculate average score
          const totalScore = data.reduce((sum: number, item: HealthCheckData) => sum + item.rating, 0);
          setAverageScore(totalScore / data.length);
          
          // Get unique team members
          const members = Array.from(new Set(data.map((item: HealthCheckData) => item.user_email))) as string[];
          setTeamMembers(members);
        } else {
          setAverageScore(0);
          setTeamMembers([]);
        }
      } else {
        console.error('Failed to fetch team health data');
        setHealthData([]);
        setAverageScore(0);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Failed to fetch team health data:', error);
      setHealthData([]);
      setAverageScore(0);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarWidth = (score: number) => {
    return (score / 10) * 100;
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-400';
    if (score >= 6) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Filter data based on selected view
  const filteredData = selectedView === 'average' 
    ? healthData 
    : healthData.filter(item => item.user_email === selectedView);

  // Group data by date
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.snippet_date]) {
      acc[item.snippet_date] = [];
    }
    acc[item.snippet_date].push(item);
    return acc;
  }, {} as Record<string, HealthCheckData[]>);

  const sortedDates = Object.keys(groupedData).sort().reverse();

  // Calculate current view average
  const currentViewAverage = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + item.rating, 0) / filteredData.length 
    : 0;

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={150}
          noiseIntensity={0.03}
          scanlineIntensity={0.06}
          speed={0.4}
          scanlineFrequency={45}
          warpAmount={0.12}
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
            <Link href="/snippet" className="text-white hover:text-purple-glow transition-colors">
              스니펫 작성
            </Link>
            <Link href="/settings" className="text-white hover:text-purple-glow transition-colors">
              개인 설정
            </Link>
            <Link href="/health" className="text-white hover:text-purple-glow transition-colors">
              팀 헬스체크
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h1 className="text-3xl font-bold text-center mb-8">팀 대시보드</h1>
            
            {!teamId ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h2 className="text-xl font-semibold mb-4">팀 ID를 설정해주세요</h2>
                <p className="text-gray-300 mb-6">
                  팀 대시보드를 보려면 먼저 개인 설정에서 팀 ID를 입력해야 합니다.
                </p>
                <Link href="/settings" className="btn-primary">
                  개인 설정으로 이동
                </Link>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-glow mx-auto mb-4"></div>
                <p className="text-gray-300">팀 데이터를 불러오는 중...</p>
              </div>
            ) : healthData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-xl font-semibold mb-4">아직 헬스체크 데이터가 없습니다</h2>
                <p className="text-gray-300 mb-6">
                  팀원들이 스니펫을 작성하고 헬스체크를 완료하면 데이터가 표시됩니다.
                </p>
                <Link href="/snippet" className="btn-primary">
                  스니펫 작성하기
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Team Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">팀 ID</h3>
                    <p className="text-2xl font-bold text-purple-glow">{teamId}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">총 멤버 수</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {teamMembers.length}
                    </p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedView === 'average' ? '팀 평균 점수' : '개인 평균 점수'}
                    </h3>
                    <p className={`text-2xl font-bold ${getScoreColor(currentViewAverage)}`}>
                      {currentViewAverage.toFixed(1)}/10
                    </p>
                  </div>
                </div>

                {/* Member Selection */}
                <div className="bg-white/5 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">보기 선택</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedView('average')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedView === 'average'
                          ? 'bg-purple-glow text-white shadow-lg'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      팀 평균
                    </button>
                    {teamMembers.map((member) => (
                      <button
                        key={member}
                        onClick={() => setSelectedView(member)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedView === member
                            ? 'bg-purple-glow text-white shadow-lg'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Chart */}
                <div className="bg-white/5 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedView === 'average' ? '팀 평균 점수 추이' : `${selectedView} 점수 추이`}
                  </h3>
                  <div className="h-64 relative">
                    <svg className="w-full h-full" viewBox="0 0 800 200">
                      {/* Grid lines */}
                      {[0, 2, 4, 6, 8, 10].map(score => (
                        <g key={score}>
                          <line
                            x1="60"
                            y1={180 - (score * 16)}
                            x2="740"
                            y2={180 - (score * 16)}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                          />
                          <text
                            x="50"
                            y={185 - (score * 16)}
                            fill="rgba(255,255,255,0.6)"
                            fontSize="12"
                            textAnchor="end"
                          >
                            {score}
                          </text>
                        </g>
                      ))}
                      
                      {/* Data points and line */}
                      {sortedDates.map((date, index) => {
                        const dayData = groupedData[date];
                        const dayAverage = dayData.reduce((sum, item) => sum + item.rating, 0) / dayData.length;
                        const x = 100 + (index * (640 / Math.max(sortedDates.length - 1, 1)));
                        const y = 180 - (dayAverage * 16);
                        
                        return (
                          <g key={date}>
                            {/* Data point */}
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#8B5CF6"
                              className="hover:r-6 transition-all cursor-pointer"
                            />
                            {/* Date label */}
                            <text
                              x={x}
                              y="195"
                              fill="rgba(255,255,255,0.6)"
                              fontSize="10"
                              textAnchor="middle"
                            >
                              {new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </text>
                            {/* Score label */}
                            <text
                              x={x}
                              y={y - 10}
                              fill="#8B5CF6"
                              fontSize="12"
                              textAnchor="middle"
                              className="font-medium"
                            >
                              {dayAverage.toFixed(1)}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Line connecting points */}
                      {sortedDates.length > 1 && (
                        <polyline
                          points={sortedDates.map((date, index) => {
                            const dayData = groupedData[date];
                            const dayAverage = dayData.reduce((sum, item) => sum + item.rating, 0) / dayData.length;
                            const x = 100 + (index * (640 / Math.max(sortedDates.length - 1, 1)));
                            const y = 180 - (dayAverage * 16);
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="2"
                          className="drop-shadow-sm"
                        />
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
