exports.handler = async (event) => {
  const { message } = JSON.parse(event.body);

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const prompt = `
You are the official AI assistant for the IEEE Department Innovation Challenge Spring 2026.

Event Information:
- Venue: Bahria University E8 Islamabad
- Date: May 19-20, 2026
- Registration Fee: Rs. 100
- Competitions:
  1. Programming Competition
  2. UI/UX Challenge
  3. Project Excellence League
  4. FYP-II Competition

Answer user questions professionally and briefly.

User Question:
${message}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AIzaSyC6nD0AUTpXsoSISuloh4OLIa1FwCotPgQ}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not answer that.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server error.",
      }),
    };
  }
};
