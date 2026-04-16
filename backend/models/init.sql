-- Run this script once to initialize the database

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'commercial' CHECK (role IN ('commercial', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(30) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Classification
  service_concerne VARCHAR(100) NOT NULL,
  type_plainte VARCHAR(100) NOT NULL,
  objet VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Impact & priorité
  impact_metier VARCHAR(100),
  priorite VARCHAR(20) DEFAULT 'Moyenne' CHECK (priorite IN ('Faible','Moyenne','Élevée','Critique')),
  
  -- Statut
  statut VARCHAR(50) DEFAULT 'Soumise' CHECK (statut IN (
    'Soumise','En cours d''analyse','Affectée au service',
    'En traitement','En attente d''information','Escaladée',
    'Résolue','Clôturée','Rejetée'
  )),
  
  -- Dates
  date_incident DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  
  -- Admin fields
  service_assigne VARCHAR(100),
  commentaire_admin TEXT,
  
  -- References
  reference_metier VARCHAR(255),
  piece_jointe VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS complaint_history (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  commentaire TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_statut ON complaints(statut);
CREATE INDEX IF NOT EXISTS idx_complaints_service ON complaints(service_concerne);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at DESC);

-- Default admin user (password: Admin@2026 — CHANGE THIS!)
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@societe.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG',
  'Administrateur',
  'admin'
) ON CONFLICT DO NOTHING;
