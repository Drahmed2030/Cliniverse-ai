import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { specialty, difficulty, department } = await request.json();

    const prompt = `Generate a detailed medical simulation case for ${specialty  'Emergency Medicine'} - ${department  'ED'} department, difficulty: ${difficulty || 'intermediate'}.

Return ONLY valid JSON in this exact format:
{
  "title": "Case title",
  "specialty": "${specialty || 'Emergency Medicine'}",
  "difficulty": "${difficulty || 'intermediate'}",
  "department": "${department || 'ED'}",
  "patient": {
    "age": 55,
    "gender": "Male",
    "chiefComplaint": "Chief complaint here"
  },
  "vitals": {
    "bp": "140/90",
    "hr": 95,
    "rr": 18,
    "temp": 37.2,
    "spo2": 96
  },
  "history": "Brief patient history",
  "physicalExam": "Key physical findings",
  "questions": [
    {
      "question": "What is your first action?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this is correct"
    }
  ],
  "diagnosis": "Final diagnosis",
  "management": "Key management steps",
  "keyLearning": "Main teaching point",
  "xp": 75
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const caseData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, case: caseData });

  } catch (error: any) {
    console.error('Generate case error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
