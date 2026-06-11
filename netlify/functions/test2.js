exports.handler = async function(event, context) {
  // Étape 1: vérifier la clé API
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const keyLength = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0;
  
  // Étape 2: vérifier que fetch existe
  const hasFetch = typeof fetch !== 'undefined';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      hasKey: hasKey,
      keyLength: keyLength,
      hasFetch: hasFetch,
      nodeVersion: process.version
    })
  };
};
