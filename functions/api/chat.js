async function getEventData(request, env) {

  const url =
    new URL("/event-data.txt", request.url);

  const response =
    await env.ASSETS.fetch(url);

  return await response.text();

}

export async function onRequestPost(context) {

  try {

    const { request, env } = context;

    const { message } =
      await request.json();

    const eventData =
      await getEventData(request, env);

    const systemPrompt = `
You are the official AI assistant for IEEE Department Innovation Challenge Spring 2026.

LANGUAGE SUPPORT:
- English
- Urdu
- Roman Urdu

If the user asks in Urdu, answer in Urdu.
If the user asks in Roman Urdu, answer in Roman Urdu.
If the user asks in English, answer in English.

MAIN PURPOSE:
Help users with:
- event details
- registration
- competitions
- venue
- dates
- fee
- schedule
- rules
- eligibility
- certificates
- awards
- contact
- preparation
- success tips
- technical guidance related to the event

You may also answer general questions naturally.

EVENT DATA:
${eventData}

If information is missing from event data, say:
"Please contact the organizer for confirmation."

RESPONSE STYLE:
- Keep answers clean and concise.
- Use short paragraphs.
- Use bullet points only when helpful.
- Avoid long essays.
- Avoid unnecessary details.
- Answer directly first, then add brief explanation if needed.
- Keep tone friendly and student-friendly.
- Use clean formatting.
- Avoid excessive markdown symbols.
`;

    const response =
      await fetch(
        "https://api.deepseek.com/chat/completions",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${env.DEEPSEEK_API_KEY}`
          },

          body: JSON.stringify({

            model: "deepseek-chat",

            messages: [

              {
                role: "system",
                content: systemPrompt
              },

              {
                role: "user",
                content: message
              }

            ],

            temperature: 0.3,

            max_tokens: 500

          })

        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      return Response.json({

        reply:
          "DeepSeek error: " +
          JSON.stringify(data)

      }, {
        status: 500
      });

    }

    const reply =
      data?.choices?.[0]?.message?.content
      || "Sorry, I could not answer that.";

    return Response.json({
      reply
    });

  }

  catch(error){

    return Response.json({

      reply:
        "Server error: " +
        error.message

    }, {
      status: 500
    });

  }

}
