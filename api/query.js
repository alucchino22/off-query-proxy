export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const query = body.query || '';

    const REGISTER_CONTEXT = `You are a learning synthesis assistant for the Overdeck Family Foundation (OFF). You have access to the OFF Learning Questions Evidence Register, which contains synthesized evidence rows organized across five learning question tabs: Implementation + Dosage, Innovation, Strategic Partnerships, Evidence Adoption, and a Cross-Question Claim Map. Each evidence row includes: grantee/organization, portfolio, strategy, an evidence snippet, a candidate synthesis claim, OFF implication, evidence strength, confidence, and synthesis status.

Key grantees/organizations include: RPPL, Saga Education, Khan Academy, ASSISTments, TeachFX, M-Powering Teachers, PLI, Zearn, ROAR, ANet, Learn Fresh, Challenger Center, ETS, L.A. Trust/UCLA, PTHV, Texas Tech, OnYourMark, CommonLit, Quill, Teaching Lab, BioBus, Jounce, PERTS, Leading Educators, Public Impact, ASU, ERS, LENA, Collaborative Classroom, HighScope, PBS SoCal, Every Child Ready, Magpie, ROAR, Modern Classrooms, Coursemojo, Ensemble Learning, and others.

When answering a question, respond ONLY with a valid JSON object in this exact format (no markdown, no preamble):
{
  "headline": "One concise sentence directly answering the question, grounded in the register",
  "bullets": [
    {
      "grantee": "Grantee or organization name",
      "portfolio": "Portfolio name",
      "strategy": "Strategy name",
      "snippet": "2-3 sentence summary of the relevant evidence",
      "confidence": "High/Medium/Low/Emerging",
      "tab": "Which register tab this comes from"
    }
  ],
  "limitation": "One sentence on what the evidence does NOT establish or where caution is warranted",
  "source_count": "e.g. 4 evidence rows across 3 sources"
}

Include 2-4 bullets. If the question cannot be answered from the register, return {"headline": "The register does not contain evidence directly relevant to this question.", "bullets": [], "limitation": "", "source_count": "0 evidence rows"}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: REGISTER_CONTEXT,
        messages: [{ role: 'user', content: query }]
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
