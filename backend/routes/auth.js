const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../models/db');
const { sendVerificationEmail, notifyAdminsNewUser } = require('../middleware/mailer');
const router = express.Router();

// POST /api/auth/register — auto-enrôlement avec vérification email
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caractères' });
  }
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà enregistré' });
    }
    const hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active, email_verified, email_verify_token, pending_approval)
       VALUES ($1, $2, $3, 'commercial', false, false, $4, true)`,
      [email.toLowerCase(), hash, full_name, verifyToken]
    );

    // Envoyer email de vérification
    await sendVerificationEmail(email.toLowerCase(), full_name, verifyToken);

    res.status(201).json({
      message: 'Compte créé. Vérifiez votre email pour confirmer votre adresse.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token manquant' });

  try {
    const result = await pool.query(
      'SELECT id, full_name, email FROM users WHERE email_verify_token = $1 AND email_verified = false',
      [token]
    );
    if (!result.rows[0]) {
      return res.status(400).json({ error: 'Lien invalide ou déjà utilisé' });
    }
    const user = result.rows[0];

    // Marquer email comme vérifié
    await pool.query(
      'UPDATE users SET email_verified = true, email_verify_token = NULL WHERE id = $1',
      [user.id]
    );

    // Notifier tous les admins
    const admins = await pool.query(
      "SELECT email FROM users WHERE role = 'admin' AND is_active = true"
    );
    const adminEmails = admins.rows.map(a => a.email);
    await notifyAdminsNewUser(adminEmails, user.full_name, user.email);

    res.json({ message: 'Email confirmé. Votre compte est en attente de validation par un administrateur.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Veuillez confirmer votre adresse email avant de vous connecter.' });
    }
    if (user.pending_approval) {
      return res.status(403).json({ error: 'Votre compte est en attente de validation par un administrateur.' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Votre compte a été suspendu. Contactez un administrateur.' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
