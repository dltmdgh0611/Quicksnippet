'use client';

import Link from 'next/link';
import DarkVeil from '@/components/DarkVeil';

interface PatchNote {
  version: string;
  date: string;
  type: 'feature' | 'improvement' | 'bugfix';
  title: string;
  description: string;
}

const patchNotes: PatchNote[] = [
  {
    version: 'v1.1.0',
    date: '2025.10.01',
    type: 'feature',
    title: '📝 섹션별 확대 편집 기능 추가',
    description: '각 섹션(What, Why, Highlight, Lowlight, Tomorrow)에 확대 아이콘을 추가했습니다. 클릭하면 큰 에디터와 마크다운 미리보기를 볼 수 있습니다.'
  },
  {
    version: 'v1.1.0',
    date: '2025.10.01',
    type: 'feature',
    title: '⚠️ 팀 ID 필수 체크 기능',
    description: '팀 ID가 설정되지 않으면 스니펫 및 헬스체크 작성을 시작할 수 없도록 예외처리를 추가했습니다. default 팀 ID로 저장되는 문제를 방지합니다.'
  },
  {
    version: 'v1.1.0',
    date: '2025.10.01',
    type: 'feature',
    title: '✨ Magic Snippet 기능 추가',
    description: '각 섹션마다 Magic Snippet 버튼을 추가했습니다. OpenAI를 통해 현재 작성한 내용을 100점에 가깝도록 개선해줍니다.'
  },
  {
    version: 'v1.0.0',
    date: '2025.09.28',
    type: 'feature',
    title: '🎉 Quick Snippet 정식 출시',
    description: 'Daily Snippet 작성 및 AI 가채점 기능을 포함한 첫 버전이 출시되었습니다.'
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    case 'improvement':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    case 'bugfix':
      return 'bg-red-500/20 text-red-300 border-red-500/50';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'feature':
      return 'NEW';
    case 'improvement':
      return 'IMPROVED';
    case 'bugfix':
      return 'FIXED';
    default:
      return 'UPDATE';
  }
};

export default function PatchNotesPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={240}
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
            <Link href="/" className="text-white hover:text-purple-glow transition-colors">
              홈
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full mb-4">
              <span className="text-purple-300 text-sm font-semibold">PATCH NOTES</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">업데이트 내역</h1>
            <p className="text-gray-300 text-lg">Quick Snippet의 최신 기능과 개선사항을 확인하세요</p>
          </div>

          {/* Patch Notes List */}
          <div className="space-y-6">
            {patchNotes.map((note, index) => (
              <div
                key={index}
                className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-glow/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-3 md:mb-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(note.type)}`}>
                      {getTypeLabel(note.type)}
                    </span>
                    <span className="text-white font-semibold text-lg">{note.version}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{note.date}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{note.title}</h3>
                <p className="text-gray-300 leading-relaxed">{note.description}</p>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-glow text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>홈으로 돌아가기</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

