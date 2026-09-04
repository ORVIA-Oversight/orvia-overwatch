export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const firstName = String(body.fname || '').trim().slice(0, 80);
  const lastName = String(body.lname || '').trim().slice(0, 80);
  const email = String(body.email || '').trim().slice(0, 180);
  const organisation = String(body.org || '').trim().slice(0, 180);
  const sector = String(body.sector || '').trim().slice(0, 120);
  const interest = String(body.interest || '').trim().slice(0, 120);
  const notes = String(body.notes || '').trim().slice(0, 2000);

  if (!firstName || !lastName || !organisation || !email || !email.includes('@')) {
    return res.status(400).json({ ok: false, error: 'Please complete your name, organisation and a valid email address.' });
  }

  const payload = {
    source: 'orvia-overwatch-demo',
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    email,
    organisation,
    sector,
    interest,
    notes,
    createdAt: new Date().toISOString()
  };

  const endpoint = process.env.ORVIA_LEAD_WEBHOOK_URL;
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Lead webhook returned ${response.status}`);
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('ORVIA Overwatch lead webhook failed', error);
    }
  }

  const subject = encodeURIComponent(`ORVIA Overwatch demo request — ${organisation}`);
  const message = encodeURIComponent(
    `Hello ORVIA,\n\nI would like an ORVIA Overwatch demo.\n\n` +
    `Name: ${payload.name}\n` +
    `Email: ${email}\n` +
    `Organisation: ${organisation}\n` +
    `Sector: ${sector || 'Not specified'}\n` +
    `Interested in: ${interest || 'Not specified'}\n\n` +
    `Notes:\n${notes || 'None'}\n`
  );

  return res.status(503).json({
    ok: false,
    fallback: `mailto:hello@orvia.org.uk?subject=${subject}&body=${message}`,
    error: 'Online demo delivery is not configured yet. Your email application can be opened instead.'
  });
}
