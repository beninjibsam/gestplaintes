const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/users — list all users (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, full_name, role, is_active, created_at, last_login,
            (SELECT COUNT(*) FROM complaints WHERE user_id = users.id) as complaint_count
     FROM users ORDER BY created_at DESC`
  );
  res.json({ users: result.rows });
});

// PATCH /api/users/:id — toggle active / change role
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { is_active, role } = req.body;
  const updates = [];
  const params = [];
  let idx = 1;

  if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); params.push(is_active); }
  if (role) { updates.push(`role = $${idx++}`); params.push(role); }

  if (!updates.length) return res.status(400).json({ error: 'Rien à modifier' });

  params.push(req.params.id);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, full_name, role, is_active`,
    params
  );
  res.json({ user: result.rows[0] });
});

// POST /api/users/:id/reset-password — admin reset
router.post('/:id/reset-password', authenticate, requireAdmin, async (req, res) => {
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
  const hash = await bcrypt.hash(tempPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.params.id]);
  res.json({ tempPassword, message: 'Mot de passe réinitialisé' });
});

module.exports = router;
