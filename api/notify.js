import twilio from 'twilio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientName, clientPhone, placement, date, deposit } = req.body;

  const accountSid   = process.env.TWILIO_ACCOUNT_SID;
  const authToken    = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber   = process.env.TWILIO_PHONE_NUMBER;
  const artistNumber = process.env.ARTIST_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || !artistNumber) {
    console.error('Missing env vars');
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const client = twilio(accountSid, authToken);

  try {
    // Artist notification — always fires
    await client.messages.create({
      body: `New Booking — ${clientName} | ${placement} | ${date} | Deposit: $${deposit} paid. Check your dashboard.`,
      from: fromNumber,
      to: artistNumber,
    });

    // Client confirmation — only if phone number entered
    if (clientPhone && clientPhone.replace(/\D/g, '').length >= 10) {
      const cleaned = '+1' + clientPhone.replace(/\D/g, '').slice(-10);
      await client.messages.create({
        body: `Your session with Kenzo is confirmed for ${date}. Your deposit of $${deposit} has been received and secured your spot. We'll reach out shortly to finalize details. — Tatted by Kenzo | @tattedbykenzo`,
        from: fromNumber,
        to: cleaned,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Twilio error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
