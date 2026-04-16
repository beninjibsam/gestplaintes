const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendNotification = async (to, subject, htmlContent) => {
  if (!process.env.MAIL_USER) return; // Skip if not configured
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'Gestion Plaintes <noreply@societe.com>',
      to,
      subject,
      html: htmlContent
    });
  } catch (err) {
    console.error('Erreur email:', err.message);
  }
};

const notifyStatusChange = async (userEmail, reference, newStatut, commentaire = '') => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e40af,#dc2626);padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">Mise à jour de votre plainte</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0">
        <p style="color:#374151">Votre plainte <strong style="color:#1e40af">${reference}</strong> a été mise à jour.</p>
        <div style="background:white;border-left:4px solid #1e40af;padding:16px;border-radius:4px;margin:16px 0">
          <p style="margin:0;color:#374151"><strong>Nouveau statut :</strong> ${newStatut}</p>
          ${commentaire ? `<p style="margin:8px 0 0;color:#6b7280">${commentaire}</p>` : ''}
        </div>
        <p style="color:#6b7280;font-size:14px">Connectez-vous pour voir le détail complet.</p>
      </div>
    </div>`;
  await sendNotification(userEmail, `Plainte ${reference} — ${newStatut}`, html);
};

module.exports = { sendNotification, notifyStatusChange };
