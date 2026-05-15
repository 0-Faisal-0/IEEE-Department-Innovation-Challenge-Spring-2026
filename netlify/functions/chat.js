exports.handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `
You are the official AI assistant for the IEEE Department Innovation Challenge Spring 2026.

EVENT DETAILS:
- Event Name: IEEE Department Innovation Challenge Spring 2026
- Venue: Bahria University E8 Islamabad
- Dates: May 19-20, 2026
- Registration Fee: Rs. 100 per participant

COMPETITIONS:
1. Programming Competition
2. UI/UX Challenge
3. Project Excellence League
4. FYP-II Competition

GUIDELINES:
- Answer clearly and professionally
- Keep answers short and helpful
- Only answer event-related questions
- If question is unrelated, politely redirect to the event

USER QUESTION:
${message}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

    console.log(JSON.stringify(data));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not answer that.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        reply
      })
    };

  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        reply: "Server error."
      })
    };
  }
};
