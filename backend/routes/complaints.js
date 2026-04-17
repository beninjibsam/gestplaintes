const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../models/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { notifyStatusChange } = require('../middleware/mailer');
const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|txt|mp3|mp4|wav|ogg|webm|mov|avi/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});

// Generate reference like PL-2026-0001
const generateRef = async () => {
  const year = new Date().getFullYear();
  const result = await pool.query(
    "SELECT COUNT(*) FROM complaints WHERE reference LIKE $1",
    [`PL-${year}-%`]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `PL-${year}-${String(count).padStart(4, '0')}`;
};

// Log history
const addHistory = async (complaint_id, user_id, action, old_val, new_val, comment) => {
  await pool.query(
    'INSERT INTO complaint_history (complaint_id, user_id, action, old_value, new_value, commentaire) VALUES ($1,$2,$3,$4,$5,$6)',
    [complaint_id, user_id, action, old_val, new_val, comment]
  );
};

// ─── COMMERCIAL ROUTES ───────────────────────────────────────────

// POST /api/complaints — create
router.post('/', authenticate, upload.single('piece_jointe'), async (req, res) => {
  const {
    service_concerne, type_plainte, objet, description,
    impact_metier, priorite, date_incident, reference_metier
  } = req.body;

  if (!service_concerne || !type_plainte || !objet || !description) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    const reference = await generateRef();
    const piece_jointe = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO complaints
       (reference, user_id, service_concerne, type_plainte, objet, description,
        impact_metier, priorite, date_incident, reference_metier, piece_jointe)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [reference, req.user.id, service_concerne, type_plainte, objet, description,
       impact_metier, priorite || 'Moyenne', date_incident || null, reference_metier || null, piece_jointe]
    );

    const complaint = result.rows[0];
    await addHistory(complaint.id, req.user.id, 'Création', null, 'Soumise', 'Plainte créée');
    res.status(201).json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/complaints — commercial: ses plaintes / admin: toutes
router.get('/', authenticate, async (req, res) => {
  const { statut, service, priorite, date_from, date_to, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let conditions = [];
  let params = [];
  let paramIdx = 1;

  // MIDDLEWARE: commercial voit seulement ses plaintes
  if (req.user.role === 'commercial') {
    conditions.push(`c.user_id = $${paramIdx++}`);
    params.push(req.user.id);
  }

  if (statut) { conditions.push(`c.statut = $${paramIdx++}`); params.push(statut); }
  if (service) { conditions.push(`c.service_concerne = $${paramIdx++}`); params.push(service); }
  if (priorite) { conditions.push(`c.priorite = $${paramIdx++}`); params.push(priorite); }
  if (date_from) { conditions.push(`c.created_at >= $${paramIdx++}`); params.push(date_from); }
  if (date_to) { conditions.push(`c.created_at <= $${paramIdx++}`); params.push(date_to + ' 23:59:59'); }
  if (search) {
    conditions.push(`(c.reference ILIKE $${paramIdx} OR c.objet ILIKE $${paramIdx} OR c.description ILIKE $${paramIdx})`);
    params.push(`%${search}%`); paramIdx++;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM complaints c ${where}`, params
    );

    const result = await pool.query(
      `SELECT c.*, u.full_name as declarant_name, u.email as declarant_email,
              NOW()::date - c.created_at::date AS anciennete_jours
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      complaints: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/complaints/:id — detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.full_name as declarant_name, u.email as declarant_email
       FROM complaints c LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`, [req.params.id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'Plainte introuvable' });

    // Commercial ne peut voir que ses propres plaintes
    if (req.user.role === 'commercial' && result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const history = await pool.query(
      `SELECT ch.*, u.full_name FROM complaint_history ch
       LEFT JOIN users u ON ch.user_id = u.id
       WHERE ch.complaint_id = $1 ORDER BY ch.created_at ASC`, [req.params.id]
    );

    res.json({ complaint: result.rows[0], history: history.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── ADMIN ROUTES ────────────────────────────────────────────────

// PATCH /api/complaints/:id — admin update statut/assignation
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { statut, service_assigne, commentaire_admin, priorite } = req.body;

  try {
    const current = await pool.query('SELECT * FROM complaints WHERE id = $1', [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Plainte introuvable' });

    const old = current.rows[0];
    const updates = [];
    const params = [];
    let idx = 1;

    if (statut) { updates.push(`statut = $${idx++}`); params.push(statut); }
    if (service_assigne !== undefined) { updates.push(`service_assigne = $${idx++}`); params.push(service_assigne); }
    if (commentaire_admin !== undefined) { updates.push(`commentaire_admin = $${idx++}`); params.push(commentaire_admin); }
    if (priorite) { updates.push(`priorite = $${idx++}`); params.push(priorite); }
    if (statut === 'Résolue' || statut === 'Clôturée') {
      updates.push(`resolved_at = $${idx++}`); params.push(new Date());
    }
    updates.push(`updated_at = $${idx++}`); params.push(new Date());
    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE complaints SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    // History log
    if (statut && statut !== old.statut) {
      await addHistory(req.params.id, req.user.id, 'Changement statut', old.statut, statut, commentaire_admin);
    }
    if (service_assigne && service_assigne !== old.service_assigne) {
      await addHistory(req.params.id, req.user.id, 'Assignation', old.service_assigne, service_assigne, null);
    }
    if (commentaire_admin) {
      await addHistory(req.params.id, req.user.id, 'Commentaire', null, commentaire_admin, null);
    }

    // Email notification to commercial
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [old.user_id]);
    if (userResult.rows[0] && statut) {
      await notifyStatusChange(userResult.rows[0].email, old.reference, statut, commentaire_admin);
    }

    res.json({ complaint: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/complaints/stats/dashboard — admin dashboard
router.get('/stats/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const [total, byStatut, byService, byPriorite, topDeclarants, avgDelay, recent] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM complaints'),
      pool.query("SELECT statut, COUNT(*) as count FROM complaints GROUP BY statut ORDER BY count DESC"),
      pool.query("SELECT service_concerne, COUNT(*) as count FROM complaints GROUP BY service_concerne ORDER BY count DESC LIMIT 8"),
      pool.query("SELECT priorite, COUNT(*) as count FROM complaints GROUP BY priorite"),
      pool.query(`SELECT u.full_name, u.email, COUNT(*) as count 
                  FROM complaints c JOIN users u ON c.user_id = u.id 
                  GROUP BY u.id, u.full_name, u.email ORDER BY count DESC LIMIT 5`),
      pool.query(`SELECT AVG(EXTRACT(epoch FROM (COALESCE(resolved_at, NOW()) - created_at))/86400)::numeric(10,1) as avg_days
                  FROM complaints WHERE statut IN ('Résolue','Clôturée')`),
      pool.query(`SELECT c.reference, c.objet, c.statut, c.priorite, c.service_concerne, 
                         u.full_name as declarant, c.created_at
                  FROM complaints c JOIN users u ON c.user_id = u.id
                  ORDER BY c.created_at DESC LIMIT 5`)
    ]);

    res.json({
      total: parseInt(total.rows[0].total),
      byStatut: byStatut.rows,
      byService: byService.rows,
      byPriorite: byPriorite.rows,
      topDeclarants: topDeclarants.rows,
      avgResolutionDays: avgDelay.rows[0].avg_days,
      recentComplaints: recent.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
