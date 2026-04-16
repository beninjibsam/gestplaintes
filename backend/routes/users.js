const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { notifyAccountActivated } = require('../middleware/mailer');
const router = express.Router();

// GET /api/users — liste tous les users (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, full_name, role, is_active, email_verified, pending_approval,
            created_at, last_login,
            (SELECT COUNT(*) FROM complaints WHERE user_id = users.id) as complaint_count
     FROM users ORDER BY
       CASE WHEN pending_approval = true AND email_verified = true THEN 0 ELSE 1 END,
       created_at DESC`
  );
  res.json({ users: result.rows });
});

// PATCH /api/users/:id — modifier is_active, role, pending_approval
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { is_active, role, pending_approval } = req.body;
  const updates = [];
  const params = [];
  let idx = 1;

  if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); params.push(is_active); }
  if (role) { updates.push(`role = $${idx++}`); params.push(role); }
  if (pending_approval !== undefined) { updates.push(`pending_approval = $${idx++}`); params.push(pending_approval); }

  if (!updates.length) return res.status(400).json({ error: 'Rien à modifier' });

  params.push(req.params.id);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
     RETURNING id, email, full_name, role, is_active, pending_approval`,
    params
  );
  const user = result.rows[0];

  // Si on active le compte (is_active = true et pending_approval = false) → email au commercial
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
