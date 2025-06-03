import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Make sure to set OPENAI_API_KEY in your .env file for this function to work.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, cvContent, companyName, positionTitle, userProfile } = await req.json();

    const prompt = `You are an expert career coach and professional writer. Write a concise, highly tailored, and persuasive cover letter using the information below. The letter should:
- Be laser-focused on the specific job and company, making the candidate seem like a perfect fit
- Strongly connect the candidate's experience and skills to the position, even exaggerating alignment if needed
- Highlight only the most relevant achievements and skills for this job
- Be no longer than 250 words (short, punchy, and memorable)
- Use a confident, enthusiastic, and proactive tone
- Avoid generic phrases, clichés, and unnecessary background
- Make the candidate stand out as the ideal hire for this role
- Use a modern, visually appealing structure (greeting, intro, body, closing, signature)
- Return only the cover letter content, no extra commentary
- Use a professional and engaging tone
- Use bullet points if appropriate for skills/achievements
- Be formatted for easy reading and visual appeal

Job Description:
${jobDescription}

CV/Resume Content:
${cvContent}

Company Name: ${companyName}
Position Title: ${positionTitle}

User Profile:
- Name: ${userProfile.full_name || 'Not provided'}
- Email: ${userProfile.email || 'Not provided'}
- Phone: ${userProfile.phone_number || 'Not provided'}
- Address: ${userProfile.address || 'Not provided'}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate the cover letter.' }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const coverLetterContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ coverLetterContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-cover-letter function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
