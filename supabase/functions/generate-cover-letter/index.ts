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

    const prompt = `You are an expert career coach and professional writer. Write a modern, highly professional, and compelling cover letter using the following information. The letter should:
- Be tailored to the job and company
- Use a confident, positive, and engaging tone
- Follow current best practices in cover letter writing (2024)
- Be well-structured with clear sections (greeting, introduction, body, closing, signature)
- Use bullet points if appropriate for skills/achievements
- Be formatted for easy reading and visual appeal
- Avoid generic phrases and clichés
- Be ready to send as a PDF

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

Return only the cover letter content, no extra commentary.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional career counselor and cover letter expert. Generate high-quality, personalized cover letters that help candidates stand out.' },
          { role: 'user', content: prompt }
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
