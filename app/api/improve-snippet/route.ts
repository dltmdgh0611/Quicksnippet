import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// 각 섹션별 개선 프롬프트
const sectionPrompts: Record<string, string> = {
  what: `사용자가 작성한 "What (무엇을 했나요?)" 섹션의 어휘를 더 정제된 표현으로 개선하여 100점 만점에 가깝게 만들어주세요.

중요 원칙:
- 사용자가 작성한 내용의 사실과 맥락을 절대 변경하지 말 것
- 없는 내용을 추가하지 말 것
- 기존 문장 구조와 순서를 최대한 유지할 것

어휘 개선 기준:
- "했다" → "달성했다", "완료했다", "수행했다" 등 더 전문적이고 임팩트 있는 동사 사용
- 일반적인 표현을 더 구체적이고 정제된 표현으로 교체
- 불필요한 수식어를 제거하고 핵심을 명확하게
- 평이한 어휘를 더 세련되고 전문적인 어휘로 교체

원본의 의미와 사실을 그대로 유지하면서, 어휘와 표현만 더 세련되게 개선된 버전만 출력하세요.`,

  why: `사용자가 작성한 "Why (왜 그렇게 했나요?)" 섹션의 어휘를 더 정제된 표현으로 개선하여 100점 만점에 가깝게 만들어주세요.

중요 원칙:
- 사용자가 작성한 이유와 동기를 절대 변경하지 말 것
- 없는 이유나 배경을 추가하지 말 것
- 기존 논리와 흐름을 최대한 유지할 것

어휘 개선 기준:
- "~하려고" → "~하고자", "~하기 위해" 등 더 명확한 목적 표현
- 구어체를 문어체로, 평범한 표현을 더 설득력 있는 표현으로
- 애매한 표현을 더 명확하고 단호한 표현으로
- "생각했다" → "판단했다", "결정했다" 등 더 주도적인 어휘 사용

원본의 이유와 논리를 그대로 유지하면서, 어휘와 표현만 더 설득력 있게 개선된 버전만 출력하세요.`,

  highlight: `사용자가 작성한 "Highlight (오늘의 하이라이트)" 섹션의 어휘를 더 정제된 표현으로 개선하여 100점 만점에 가깝게 만들어주세요.

중요 원칙:
- 사용자가 느낀 감정과 경험을 절대 변경하지 말 것
- 없는 성과나 배움을 추가하지 말 것
- 기존의 긍정적 톤과 에너지를 유지할 것

어휘 개선 기준:
- "좋았다" → "의미 있었다", "값진 경험이었다" 등 더 깊이 있는 표현
- 일반적인 긍정 표현을 더 구체적이고 생생한 표현으로
- 평범한 감정 표현을 더 진정성 있고 임팩트 있는 표현으로
- "배웠다" → "통찰을 얻었다", "깨달았다" 등 더 성장 지향적인 어휘

원본의 경험과 감정을 그대로 유지하면서, 어휘와 표현만 더 임팩트 있게 개선된 버전만 출력하세요.`,

  lowlight: `사용자가 작성한 "Lowlight (어려웠던 점)" 섹션의 어휘를 더 정제된 표현으로 개선하여 100점 만점에 가깝게 만들어주세요.

중요 원칙:
- 사용자가 경험한 어려움과 문제를 절대 변경하지 말 것
- 없는 문제나 원인을 추가하지 말 것
- 기존의 솔직함과 자기반성 톤을 유지할 것

어휘 개선 기준:
- "힘들었다" → "도전적이었다", "난관에 봉착했다" 등 더 건설적인 표현
- 부정적 표현을 중립적이고 분석적인 표현으로
- "못했다" → "미흡했다", "개선이 필요했다" 등 더 객관적인 어휘
- 불평보다는 문제 인식과 성찰이 드러나는 표현으로

원본의 어려움과 문제를 그대로 유지하면서, 어휘와 표현만 더 건설적이고 성숙하게 개선된 버전만 출력하세요.`,

  tomorrow: `사용자가 작성한 "Tomorrow (내일 계획)" 섹션의 어휘를 더 정제된 표현으로 개선하여 100점 만점에 가깝게 만들어주세요.

중요 원칙:
- 사용자가 계획한 내용을 절대 변경하지 말 것
- 없는 계획이나 목표를 추가하지 말 것
- 기존 계획의 우선순위와 흐름을 유지할 것

어휘 개선 기준:
- "~할 예정이다" → "~한다", "~을 실행한다" 등 더 확정적이고 주도적인 표현
- "하려고 한다" → "진행한다", "추진한다" 등 더 강한 의지가 드러나는 동사
- 애매한 계획 표현을 더 명확하고 구체적인 액션 표현으로
- "해볼까 한다" → "추진한다", "착수한다" 등 더 결단력 있는 어휘

원본의 계획과 목표를 그대로 유지하면서, 어휘와 표현만 더 주도적이고 실행력 있게 개선된 버전만 출력하세요.`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field, content } = body;

    if (!field || !content) {
      return NextResponse.json(
        { error: '필드와 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!sectionPrompts[field]) {
      return NextResponse.json(
        { error: '유효하지 않은 필드입니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: sectionPrompts[field]
        },
        {
          role: "user",
          content: `다음 내용을 개선해주세요:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const improvedContent = completion.choices[0]?.message?.content;
    
    if (!improvedContent) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ 
      improvedContent: improvedContent.trim()
    });
  } catch (error: any) {
    console.error('Improve snippet error:', error);
    
    return NextResponse.json(
      { 
        error: 'AI 개선 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    );
  }
}

