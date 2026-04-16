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
  if (!process.env.MAIL_USER) return;
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'GestPlaintes <noreply@societe.com>',
      to,
      subject,
      html: htmlContent
    });
  } catch (err) {
    console.error('Erreur email:', err.message);
  }
};

// Email de vérification d'adresse
const sendVerificationEmail = async (userEmail, fullName, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e40af,#dc2626);padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">Confirmez votre adresse email</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0">
        <p style="color:#374151">Bonjour <strong>${fullName}</strong>,</p>
        <p style="color:#374151">Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${verifyUrl}"
             style="background:#1e40af;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
            Confirmer mon email
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    </div>`;
  await sendNotification(userEmail, 'Confirmez votre adresse email — GestPlaintes', html);
};

// Notification aux admins : nouveau compte à valider
const notifyAdminsNewUser = async (adminEmails, fullName, userEmail) => {
  const appUrl = `${process.env.FRONTEND_URL}/admin/users`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e40af,#dc2626);padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">Nouveau compte à valider</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0">
        <p style="color:#374151">Un nouveau commercial a confirmé son email et attend votre validation :</p>
        <div style="background:white;border-left:4px solid #1e40af;padding:16px;border-radius:4px;margin:16px 0">
          <p style="margin:0;color:#374151"><strong>Nom :</strong> ${fullName}</p>
          <p style="margin:8px 0 0;color:#374151"><strong>Email :</strong> ${userEmail}</p>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${appUrl}"
             style="background:#1e40af;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
            Gérer les utilisateurs
          </a>
        </div>
      </div>
    </div>`;
  for (const email of adminEmails) {
    await sendNotification(email, `Nouveau compte à valider : ${fullName}`, html);
  }
};

// Email de confirmation d'activation du compte
const notifyAccountActivated = async (userEmail, fullName) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e40af,#dc2626);padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">Votre compte est activé !</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0">
        <p style="color:#374151">Bonjour <strong>${fullName}</strong>,</p>
        <p style="color:#374151">Votre compte a été validé par un administrateur. Vous pouvez maintenant vous connecter et déclarer vos plaintes.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${process.env.FRONTEND_URL}/login"
             style="background:#1e40af;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
            Se connecter
          </a>
        </div>
      </div>
    </div>`;
  await sendNotification(userEmail, 'Votre compte GestPlaintes est activé', html);
};

// Notification changement statut plainte
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

module.exports = {
  sendNotification,
  sendVerificationEmail,
  notifyAdminsNewUser,
  notifyAccountActivated,
  notifyStatusChange
};
