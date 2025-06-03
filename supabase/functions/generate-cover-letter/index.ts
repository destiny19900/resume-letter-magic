
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const prompt = `Generate a professional cover letter based on the following information:

Job Description: ${jobDescription}

CV/Resume Content: ${cvContent}

Company Name: ${companyName}
Position Title: ${positionTitle}

User Profile:
- Name: ${userProfile.full_name || 'Not provided'}
- Email: ${userProfile.email || 'Not provided'}
- Phone: ${userProfile.phone_number || 'Not provided'}
- Address: ${userProfile.address || 'Not provided'}

Please create a compelling cover letter that:
1. Addresses the specific requirements mentioned in the job description
2. Highlights relevant experience and skills from the CV
3. Shows enthusiasm for the role and company
4. Maintains a professional tone
5. Is properly formatted with appropriate sections

The cover letter should be ready to send and specifically tailored to this job opportunity.`;

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
