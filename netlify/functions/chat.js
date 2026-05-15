exports.handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body || "{}");
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          reply: "Missing GEMINI_API_KEY in Netlify environment variables."
        })
      };
    }

    const prompt = `
You are the official AI assistant for IEEE Department Innovation Challenge Spring 2026.

Event Details:
- Event Name: IEEE Department Innovation Challenge Spring 2026
- Venue: Bahria University E8 Islamabad
- Dates: May 19-20, 2026
- Registration Fee: Rs. 100 per participant
- Competitions:
  1. Programming Competition
  2. UI/UX Challenge
  3. Project Excellence League
  4. FYP-II Competition

Answer briefly, clearly, and professionally.
Support English and Urdu.

User Question:
${message}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          reply: "Gemini error: " + JSON.stringify(data)
        })
      };
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not answer that.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server error: " + error.message
      })
    };
  }
};
