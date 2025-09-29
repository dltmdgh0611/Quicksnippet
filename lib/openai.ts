import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface SnippetData {
  what: string;
  why: string;
  highlight: string;
  lowlight: string;
  tomorrow: string;
}

export interface Scores {
  growth: number;
  specificity: number;
  actionability: number;
  authenticity: number;
  clarity: number;
}

export interface Feedback {
  growth: string;
  specificity: string;
  actionability: string;
  authenticity: string;
  clarity: string;
}

export interface AnalysisResult {
  scores: Scores;
  feedback: Feedback;
}

export async function analyzeSnippet(snippet: SnippetData): Promise<AnalysisResult> {
  const userContent = `
What: ${snippet.what}
Why: ${snippet.why}
Highlight: ${snippet.highlight}
Lowlight: ${snippet.lowlight}
Tomorrow: ${snippet.tomorrow}
  `.trim();

  const messages = [
    {
      role: "system" as const,
      content: "너는 데일리 스니펫 전문 평가자 역할을 수행한다. 사용자가 작성한 스니펫을 다음 5가지 항목으로 평가하고, 점수(JSON)와 피드백(JSON) 두 개만 출력해야 한다. 점수는 0~20 사이의 정수로 주며, 모든 항목에 대해 구체적인 개선점을 포함한 피드백을 작성한다.\n\n평가 기준:\n1. 성장성 (Growth): What에서 결과 중심 서술, Why에서 목적성, Highlight에서 배움의 순간 포착\n2. 구체성 (Specificity): 구체적인 기술/개념 명시, 카테고리화, 결과물 중심 서술\n3. 실행력 (Actionability): Tomorrow에서 구체적이고 실행 가능한 계획, 시간과 내용 명시\n4. 진정성 (Authenticity): Lowlight에서 구체적인 원인 진단, 건설적인 자기반성\n5. 명확성 (Clarity): 각 섹션 간의 논리적 연결성, 전체적인 가독성\n\n* 사용자의 노력과 성과를 인정하며, 긍정적이고 격려하는 톤으로 피드백을 작성한다. 완벽하지 않아도 잘한 부분을 먼저 언급하고, 개선점은 건설적으로 제시한다."
    },
    {
      role: "user" as const,
      content: `다음은 사용자가 작성한 스니펫이다:\n\n${userContent}\n\n아래의 두 JSON을 반드시 출력하라.\n\n[출력 형식 예시]\n\n1. 점수 JSON:\n{\n  "growth": 18,\n  "specificity": 19,\n  "actionability": 17,\n  "authenticity": 20,\n  "clarity": 18\n}\n\n2. 피드백 JSON:\n{\n  "growth": "What에서 결과 중심 서술이 잘 되어 있습니다. Why에서 목적성을 더 명확히 하면 완벽할 것 같습니다.",\n  "specificity": "구체적인 기술과 개념이 잘 명시되어 있습니다. 카테고리화를 추가하면 더욱 좋을 것 같습니다.",\n  "actionability": "Tomorrow 계획이 잘 작성되어 있습니다. 시간을 더 구체적으로 명시하면 완벽할 것 같습니다.",\n  "authenticity": "Lowlight에서 솔직한 자기반성이 잘 드러나 있습니다. 원인 분석을 더 구체적으로 하면 더욱 좋을 것 같습니다.",\n  "clarity": "전체적으로 가독성이 좋습니다. 각 섹션 간의 연결성을 더 강화하면 완벽할 것 같습니다."\n}\n\n위 형식을 반드시 그대로 따르고, 다른 텍스트는 출력하지 마라.`
    }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // JSON 파싱
    const lines = response.split('\n');
    let scoresJson = '';
    let feedbackJson = '';
    let isScores = false;
    let isFeedback = false;

    for (const line of lines) {
      if (line.includes('점수 JSON:') || line.includes('1. 점수 JSON:')) {
        isScores = true;
        isFeedback = false;
        continue;
      }
      if (line.includes('피드백 JSON:') || line.includes('2. 피드백 JSON:')) {
        isScores = false;
        isFeedback = true;
        continue;
      }
      
      if (isScores && line.trim()) {
        scoresJson += line + '\n';
      }
      if (isFeedback && line.trim()) {
        feedbackJson += line + '\n';
      }
    }

    const rawScores = JSON.parse(scoresJson.trim()) as Scores;
    const feedback = JSON.parse(feedbackJson.trim()) as Feedback;

    // 20점 초과 점수가 있으면 100점 만점으로 간주하고 환산
    const isHundredPointScale = Object.values(rawScores).some(score => score > 20);
    
    const scores: Scores = isHundredPointScale ? {
      growth: Math.round((rawScores.growth / 100) * 20),
      specificity: Math.round((rawScores.specificity / 100) * 20),
      actionability: Math.round((rawScores.actionability / 100) * 20),
      authenticity: Math.round((rawScores.authenticity / 100) * 20),
      clarity: Math.round((rawScores.clarity / 100) * 20)
    } : rawScores;

    return { scores, feedback };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('AI 분석 중 오류가 발생했습니다.');
  }
}
