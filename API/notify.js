const twilio = require('twilio');

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientName, clientPhone, placement, date, deposit, estimatedPrice } = req.body;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const artistNumber = process.env.ARTIST_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || !artistNumber) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const client = twilio(accountSid, authToken);

  try {
    // 1. Client confirmation text
    if (clientPhone) {
      await client.messages.create({
        body: `Your session with Kenzo is confirmed for ${date}. Your deposit of $${deposit} has been received and secured your spot. We'll reach out shortly to finalize details. — Tatted by Kenzo | @tattedbykenzo`,
        from: fromNumber,
        to: clientPhone,
      });
    }

    // 2. Artist notification text
    await client.messages.create({
      body: `New Booking — ${clientName} | ${placement} | ${date} | Deposit: $${deposit} paid. Check your dashboard for full details.`,
      from: fromNumber,
      to: artistNumber,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Twilio error:', error);
    return res.status(500).json({ error: error.message });
  }
}
