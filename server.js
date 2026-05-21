require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function sanitize(str) {
  return validator.escape(String(str || '').trim());
}

function adminEmailHtml(data) {
  const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #1a1a2e; color: #fff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
    .body { padding: 30px; }
    .field { border-bottom: 1px solid #f0f0f0; padding: 12px 0; display: flex; }
    .label { color: #888; font-size: 13px; width: 160px; flex-shrink: 0; }
    .value { color: #1a1a2e; font-size: 14px; font-weight: 600; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #aaa; }
    .date-badge { background: #f0f4ff; border-left: 4px solid #1a1a2e; padding: 12px 16px; margin-top: 20px; border-radius: 4px; font-size: 13px; color: #555; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nouvelle demande de parrainage</h1>
    </div>
    <div class="body">
      <div class="field"><span class="label">Nom</span><span class="value">${data.nom}</span></div>
      <div class="field"><span class="label">Prénom</span><span class="value">${data.prenom}</span></div>
      <div class="field"><span class="label">Téléphone</span><span class="value">${data.telephone}</span></div>
      <div class="field"><span class="label">Adresse</span><span class="value">${data.adresse}</span></div>
      <div class="field"><span class="label">Code postal</span><span class="value">${data.code_postal}</span></div>
      <div class="field"><span class="label">Ville</span><span class="value">${data.ville}</span></div>
      <div class="field"><span class="label">Email</span><span class="value">${data.email}</span></div>
      <div class="field"><span class="label">Code de parrainage</span><span class="value">${data.code_parrainage}</span></div>
      <div class="date-badge">Reçu le : ${now}</div>
    </div>
    <div class="footer">Netz Informatique &bull; Formulaire de parrainage</div>
  </div>
</body>
</html>`;
}

function clientEmailHtml(data) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #1a1a2e; color: #fff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
    .body { padding: 30px; color: #333; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .message { font-size: 14px; line-height: 1.7; color: #555; margin-bottom: 24px; }
    .recap-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 12px; }
    .field { border-bottom: 1px solid #f0f0f0; padding: 10px 0; display: flex; }
    .label { color: #aaa; font-size: 13px; width: 160px; flex-shrink: 0; }
    .value { color: #1a1a2e; font-size: 14px; font-weight: 600; }
    .signature { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 14px; color: #555; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #aaa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Votre demande a bien été reçue</h1>
    </div>
    <div class="body">
      <p class="greeting">Bonjour <strong>${data.prenom}</strong>,</p>
      <p class="message">
        Nous avons bien reçu votre demande.<br>
        Elle sera traitée rapidement.
      </p>
      <div class="recap-title">Récapitulatif</div>
      <div class="field"><span class="label">Nom</span><span class="value">${data.nom}</span></div>
      <div class="field"><span class="label">Prénom</span><span class="value">${data.prenom}</span></div>
      <div class="field"><span class="label">Téléphone</span><span class="value">${data.telephone}</span></div>
      <div class="field"><span class="label">Adresse</span><span class="value">${data.adresse}</span></div>
      <div class="field"><span class="label">Code postal</span><span class="value">${data.code_postal}</span></div>
      <div class="field"><span class="label">Ville</span><span class="value">${data.ville}</span></div>
      <div class="field"><span class="label">Email</span><span class="value">${data.email}</span></div>
      <div class="field"><span class="label">Code de parrainage</span><span class="value">${data.code_parrainage}</span></div>
      <div class="signature">
        Merci,<br>
        <strong>Netz Informatique</strong>
      </div>
    </div>
    <div class="footer">Netz Informatique &bull; Cet email est envoyé automatiquement, merci de ne pas y répondre directement.</div>
  </div>
</body>
</html>`;
}

app.post('/submit', limiter, async (req, res) => {
  const { nom, prenom, telephone, adresse, code_postal, ville, email, code_parrainage, honeypot } = req.body;

  if (honeypot && honeypot.trim() !== '') {
    return res.status(200).json({ success: true });
  }

  const errors = [];
  if (!nom || nom.trim().length < 2) errors.push('Nom invalide.');
  if (!prenom || prenom.trim().length < 2) errors.push('Prénom invalide.');
  if (!telephone || !/^[\d\s\+\-\(\)]{6,20}$/.test(telephone.trim())) errors.push('Numéro de téléphone invalide.');
  if (!adresse || adresse.trim().length < 5) errors.push('Adresse invalide.');
  if (!code_postal || !/^\d{4,10}$/.test(code_postal.trim())) errors.push('Code postal invalide.');
  if (!ville || ville.trim().length < 2) errors.push('Ville invalide.');
  if (!email || !validator.isEmail(email.trim())) errors.push('Adresse email invalide.');
  if (!code_parrainage || code_parrainage.trim().length < 1) errors.push('Code de parrainage manquant.');

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const cleanData = {
    nom: sanitize(nom),
    prenom: sanitize(prenom),
    telephone: sanitize(telephone),
    adresse: sanitize(adresse),
    code_postal: sanitize(code_postal),
    ville: sanitize(ville),
    email: validator.normalizeEmail(email.trim()) || email.trim(),
    code_parrainage: sanitize(code_parrainage),
  };

  const from = '"Netz Informatique" <' + process.env.SMTP_USER + '>';

  try {
    await transporter.sendMail({
      from,
      to: process.env.MAIL_TO,
      replyTo: process.env.SMTP_USER,
      subject: 'Nouvelle demande de parrainage',
      html: adminEmailHtml(cleanData),
    });

    await transporter.sendMail({
      from,
      to: cleanData.email,
      replyTo: process.env.SMTP_USER,
      subject: 'Votre demande a bien été reçue',
      html: clientEmailHtml(cleanData),
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Erreur envoi email:', err.message);
    return res.status(500).json({ error: "Erreur lors de l'envoi de l'email. Veuillez réessayer." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
