// netlify/functions/sendMessage.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return { statusCode: 500, body: 'Webhook not configured' };

    const payload = {
      embeds: [
        {
          title: `Portfolio Message from ${body.name || 'Unknown'}`,
          description: body.message || '(no message)',
          fields: [
            { name: 'Email', value: body.email || 'n/a', inline: true },
            { name: 'Time', value: body.time || new Date().toISOString(), inline: true }
          ]
        }
      ]
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text().catch(()=>res.statusText);
      return { statusCode: 500, body: `Webhook error: ${res.status} ${text}` };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
};
