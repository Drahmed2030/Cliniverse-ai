import { NextRequest, NextResponse } from 'next/server';

// Sample store data — stands in for real store data during the demo.
// Once a real client signs on, this becomes a per-store config pulled
// from Supabase instead of a hardcoded object.
const SAMPLE_STORE = {
  name: "Sample Store",
  shipping: "Delivery takes 2-4 business days within the city, 5-7 days for other regions. Free shipping on orders over 200 SAR.",
  returns: "Items can be returned within 14 days of delivery if unused and in original packaging. Refund processed within 5-7 business days.",
  sizes: "Available sizes: S, M, L, XL, XXL. Size chart available on each product page.",
  hours: "Customer service available Sunday-Thursday, 9am-9pm.",
};

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    const prompt = `You are a helpful customer service assistant for an online store called "${SAMPLE_STORE.name}".

Store information:
- Shipping: ${SAMPLE_STORE.shipping}
- Returns: ${SAMPLE_STORE.returns}
- Sizes: ${SAMPLE_STORE.sizes}
- Support hours: ${SAMPLE_STORE.hours}

A customer asked: "${question}"

Reply helpfully and concisely (2-4 sentences) using ONLY the store information above. If the question is about something not covered here, politely say a team member will follow up. Match the customer's language (Arabic or English).`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Claude call failed:', res.status, errText);
      return NextResponse.json({ error: 'AI service failed' }, { status: 502 });
    }

    const data = await res.json();
    const answer = data?.content?.[0]?.text || 'Sorry, I could not generate a response.';

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('NeuraOps demo route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
