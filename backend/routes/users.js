const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { notifyAccountActivated } = require('../middleware/mailer');
const router = express.Router();

// GET /api/users
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, full_name, role, is_active, email_verified, pending_approval,
            whatsapp, telephone, created_at, last_login,
            (SELECT COUNT(*) FROM complaints WHERE user_id = users.id) as complaint_count
     FROM users ORDER BY
       CASE WHEN pending_approval = true AND email_verified = true THEN 0 ELSE 1 END,
       created_at DESC`
  );
  res.json({ users: result.rows });
});

// POST /api/users — création de compte par l'admin (directement actif, pas de validation email)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { email, password, full_name, role, whatsapp, telephone } = req.body;

  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }
  if (!['commercial', 'admin', 'direction'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });
  }

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà enregistré' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users
         (email, password_hash, full_name, role, whatsapp, telephone,
          is_active, email_verified, pending_approval)
       VALUES ($1, $2, $3, $4, $5, $6, true, true, false)
       RETURNING id, email, full_name, role, is_active`,
      [email.toLowerCase(), hash, full_name, role,
       whatsapp?.trim() || '', telephone?.trim() || null]
    );

    res.status(201).json({ user: result.rows[0], message: 'Compte créé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/users/:id
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { is_active, role, pending_approval } = req.body;
  const updates = [], params = [];
  let idx = 1;

  if (is_active !== undefined)      { updates.push(`is_active = $${idx++}`);       params.push(is_active); }
  if (role)                         { updates.push(`role = $${idx++}`);             params.push(role); }
  if (pending_approval !== undefined) { updates.push(`pending_approval = $${idx++}`); params.push(pending_approval); }

  if (!updates.length) return res.status(400).json({ error: 'Rien à modifier' });

  params.push(req.params.id);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
     RETURNING id, email, full_name, role, is_active, pending_approval`,
    params
  );
  const user = result.rows[0];

  if (is_active === true && pending_approval === false) {
    await notifyAccountActivated(user.email, user.full_name);
  }

  res.json({ user });
});

// POST /api/users/:id/reset-password
router.post('/:id/reset-password', authenticate, requireAdmin, async (req, res) => {
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
  const hash = await bcrypt.hash(tempPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.params.id]);
  res.json({ tempPassword, message: 'Mot de passe réinitialisé' });
});

module.exports = router;
