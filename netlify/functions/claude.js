exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const messages = body.messages || [{ role: 'user', content: body.prompt }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: `Tu es un expert des Familles d'Ames. Tu reponds UNIQUEMENT en JSON valide.
REGLES ABSOLUES:
1. Dans les valeurs string JSON, remplace TOUTES les apostrophes par \\u2019
2. Exemple: "c\\u2019est", "j\\u2019ai", "l\\u2019energie", "d\\u2019intention"
3. JAMAIS de tirets pour remplacer des apostrophes
4. Tous les accents francais doivent etre presents
5. Commence par { et termine par }
6. Pas de markdown ni backticks`,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.error?.message || 'Erreur API Anthropic' })
      };
    }

    let rawText = data.content?.[0]?.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: rawText })
    };

  } catch (err) {
