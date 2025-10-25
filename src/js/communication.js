// /src/js/communication.js
export async function sendContact(payload) {
  const res = await fetch('/.netlify/functions/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>res.statusText);
    throw new Error('Failed to send: ' + txt);
  }
  return res.json();
}
