import eventData from "../../event-data.txt";

const sessions = {};

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { message } = await request.json();

    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "unknown";

    if (!sessions[ip]) {
      sessions[ip] = {
        unrelatedCount: 0
      };
    }

    const systemPrompt = `
You are the official AI assistant for IEEE Department Innovation Challenge Spring 2026.

You must understand user questions naturally. Do NOT rely only on exact keywords.

LANGUAGE SUPPORT:
- Support English
- Support Urdu
- Support Roman Urdu
- If the user asks in Urdu, answer in Urdu.
- If the user asks in Roman Urdu, answer in Roman Urdu or simple Urdu-style English.
- If the user asks in English, answer in English.

MAIN PURPOSE:
Help users with anything related to the event, including:
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
- how to prepare
- how to succeed
- which competition suits them
- complex questions related to the event

EVENT DATA:
Use this information as your source of truth:

${eventData}

UNRELATED QUESTION RULE:
You may answer only ONE unrelated/general question per chat session.

If the question is unrelated for the first time:
Start your answer exactly with:
"I can help you with anything event-related, including how to succeed in the event and detailed guidance about the event. But since you asked nicely, I’ll answer this one time."

Then answer briefly.

If the user asks unrelated questions again, reply exactly:
"Sorry my friend, now I can answer only event-related questions in this chat session."

If information is missing from the event data, say:
"Please contact the organizer for confirmation."

RESPONSE STYLE:
- Friendly
- Clear
- Brief
- Student-friendly
- Do not be robotic
- Do not invent event details
`;

    const classifierPrompt = `
Decide if the user's question is related to IEEE Department Innovation Challenge Spring 2026.

Event-related includes:
registration, fee, venue, date, schedule, competitions, certificates, awards, rules, eligibility, preparation, success tips, choosing a category, contact, event logistics, or anything reasonably connected to the event.

Question:
${message}

Answer ONLY with:
RELATED
or
UNRELATED
`;

    const classifyResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a strict classifier. Reply only RELATED or UNRELATED."
          },
          {
            role: "user",
            content: classifierPrompt
          }
        ],
        temperature: 0,
        max_tokens: 5
      })
    });

    const classifyData = await classifyResponse.json();
    const classification =
      classifyData?.choices?.[0]?.message?.content?.trim().toUpperCase() || "UNRELATED";

    if (classification === "UNRELATED") {
      sessions[ip].unrelatedCount++;

      if (sessions[ip].unrelatedCount > 1) {
        return Response.json({
          reply:
            "Sorry my friend, now I can answer only event-related questions in this chat session."
        });
      }
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
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
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        reply: "DeepSeek error: " + JSON.stringify(data)
      }, { status: 500 });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not answer that.";

    return Response.json({ reply });

  } catch (error) {
    return Response.json({
      reply: "Server error: " + error.message
    }, { status: 500 });
  }
}
