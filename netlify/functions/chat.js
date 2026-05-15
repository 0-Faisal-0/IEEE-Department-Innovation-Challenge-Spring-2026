exports.handler = async function(event) {

const body = JSON.parse(event.body);

const prompt = `
You are the official assistant for IEEE Department Innovation Challenge Spring 2026.

Event Details:
- Venue: Bahria University E8 Islamabad
- Dates: 19–20 May 2026
- Fee: Rs.100 per participant

Competitions:
- Programming Competition
- UI/UX Challenge
- Project Excellence League
- FYP-II Competition

Contact:
Saad Malik — 03330526861

User Question:
${body.message}
`;

const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
parts:[
{
text:prompt
}
]
}
]
})
}
);

const data = await response.json();

const reply =
data.candidates?.[0]?.content?.parts?.[0]?.text
|| "Please contact organizer.";

return {
statusCode:200,
body:JSON.stringify({
reply
})
};

};