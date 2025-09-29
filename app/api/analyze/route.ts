import { NextRequest, NextResponse } from 'next/server';
import { analyzeSnippet, SnippetData } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 디버깅
    console.log('NEXT_PUBLIC_OPENAI_API_KEY exists:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);
    console.log('NEXT_PUBLIC_OPENAI_API_KEY length:', process.env.NEXT_PUBLIC_OPENAI_API_KEY?.length);
    
    const snippet: SnippetData = await request.json();
    
    // 입력 검증
    if (!snippet.what && !snippet.why && !snippet.highlight && !snippet.lowlight && !snippet.tomorrow) {
      return NextResponse.json(
        { error: '스니펫 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await analyzeSnippet(snippet);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'AI 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
