const { Resend } = require('resend');

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, tel, email, service, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Wypełnij pola: imię, e-mail i opis zlecenia.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from:     'PRO-SOLID <onboarding@resend.dev>',
      to:       [process.env.NOTIFICATION_EMAIL],
      reply_to: email.trim(),
      subject:  `Nowe zapytanie PRO-SOLID od: ${esc(name)}`,
      html: `
        <table style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;max-width:600px;width:100%">
          <tr>
            <td style="background:#D4870E;padding:20px 28px">
              <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px">PRO-SOLID – nowe zapytanie</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px">
              <p style="margin:0 0 12px"><strong>Imię i nazwisko:</strong><br>${esc(name)}</p>
              <p style="margin:0 0 12px"><strong>Telefon:</strong><br>${esc(tel) || '—'}</p>
              <p style="margin:0 0 12px"><strong>E-mail:</strong><br><a href="mailto:${esc(email)}">${esc(email)}</a></p>
              <p style="margin:0 0 12px"><strong>Rodzaj usługi:</strong><br>${esc(service) || '—'}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
              <p style="margin:0 0 8px"><strong>Opis zlecenia:</strong></p>
              <p style="margin:0;white-space:pre-wrap">${esc(message)}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f5f5;padding:14px 28px;font-size:12px;color:#888">
              Wiadomość wysłana przez formularz na stronie PRO-SOLID
            </td>
          </tr>
        </table>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[send-email] Resend error:', err);
    return res.status(500).json({ error: 'Błąd serwera podczas wysyłki. Spróbuj ponownie.' });
  }
};
