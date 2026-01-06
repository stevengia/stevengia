// api/chat.js

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { question } = req.body;
    
    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    // Your resume/background information
    const RESUME_CONTENT = `
Steven Gia Yupang
Brazilian-American Software Engineer | Triathlete

EDUCATION
- B.S. Computer Science, Pennsylvania State University (Class of 2019)

CERTIFICATIONS
- AWS Certified Solutions Architect Associate
- AWS Certified Cloud Practitioner

PROFESSIONAL EXPERIENCE
Hughes Network Systems
- Promoted from MTS1 → MTS2 → MTS3
- Demonstrated progressive technical excellence and leadership
- Worked on satellite network systems and cloud infrastructure

TECHNICAL SKILLS
- Cloud Computing: AWS (Solutions Architecture, Cloud Infrastructure)
- Programming: [Add your languages: e.g., Python, Java, JavaScript, etc.]
- Technologies: [Add your tech stack]

ATHLETICS & ACHIEVEMENTS
Triathlon:
- 2x Ironman 70.3 Eagleman finisher
- 2x Olympic Distance Triathlon finisher
- 2026 Goals: Sub 5-hour 70.3 Ironman Eagleman, Full Ironman

Marathon & Running:
- 3 Full Marathons: Shamrock Marathon, Marine Corps Marathon, Chicago Marathon
- 8 Half Marathons completed:
  * 3x Philadelphia Half Marathon
  * Philadelphia Love Run Half Marathon
  * DC Half Marathon
  * DC Rock and Roll Half Marathon
  * Brooklyn Half Marathon
  * Central Park Half Marathon
- 2026 Goal: Sub 1h26 Half Marathon

PERSONAL
- From Brazil, currently living in the United States
- 5-year-old Shiba Inu named Mochi (training partner)
- Passionate about balancing technical excellence with athletic achievement
- Motto: "Engineer by day, Athlete by passion, Driven always"
`;

    const SYSTEM_PROMPT = `You are an AI assistant representing Steven Gia Yupang, a Brazilian-American software engineer and endurance athlete.

IMPORTANT INSTRUCTIONS:
- Always respond in first person ("I", "my", "me")
- Be professional but personable and enthusiastic
- Keep responses concise (2-4 paragraphs maximum)
- If asked about something not in your background, say "I don't have that specific information in my background, but feel free to connect with me directly!"
- When discussing athletics, show passion and dedication
- When discussing technical work, emphasize growth and learning
- Be authentic - show both the technical and athletic sides of your personality

Here is Steven's background:
${RESUME_CONTENT}
`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                messages: [
                    { role: 'user', content: question }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response from Claude');
        }

        const data = await response.json();
        
        res.status(200).json({ 
            success: true,
            answer: data.content[0].text 
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to get response. Please try again.' 
        });
    }
}