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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `Tu es un expert des Familles d'Âmes. Tu reponds UNIQUEMENT en JSON valide.
REGLES ABSOLUES pour le JSON:
1. Dans les valeurs string, echappe les apostrophes avec \\' ou utilise \\u2019
2. N'utilise JAMAIS de tirets pour remplacer des apostrophes
3. Tous les accents francais doivent etre presents et corrects
4. Commence directement par { et termine par }
5. Pas de markdown, pas de backticks autour du JSON`,
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
    
    // Nettoyer côté serveur avant d'envoyer au client
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
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Erreur serveur' })
    };
  }
};
