CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  open_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NULL,
  role VARCHAR(24) NOT NULL DEFAULT 'donor',
  organization_name VARCHAR(180) NULL,
  area VARCHAR(180) NULL,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
);

CREATE TABLE IF NOT EXISTS app_sessions (
  token_hash VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(40) NOT NULL PRIMARY KEY,
  donor_id VARCHAR(64) NOT NULL,
  donor_name VARCHAR(180) NOT NULL,
  ngo_id VARCHAR(64) NULL,
  ngo_name VARCHAR(180) NULL,
  partner_id VARCHAR(64) NULL,
  partner_name VARCHAR(180) NULL,
  food_name VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL,
  quantity INT NOT NULL,
  unit VARCHAR(32) NOT NULL,
  servings INT NOT NULL,
  area VARCHAR(255) NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  pickup_window VARCHAR(180) NOT NULL,
  storage VARCHAR(255) NOT NULL,
  food_safety_notes TEXT NOT NULL,
  allergens JSON NOT NULL,
  prepared_at DATETIME NOT NULL,
  use_by DATETIME NOT NULL,
  eta_minutes INT NOT NULL DEFAULT 22,
  status VARCHAR(32) NOT NULL,
  delivered_quantity INT NULL,
  needs_reassignment BOOLEAN NOT NULL DEFAULT FALSE,
  assignment_history JSON NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_donations_status_expiry (status, use_by),
  INDEX idx_donations_donor (donor_id),
  INDEX idx_donations_ngo (ngo_id),
  INDEX idx_donations_partner (partner_id)
);

CREATE TABLE IF NOT EXISTS activity_events (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  donation_id VARCHAR(40) NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  kind VARCHAR(32) NOT NULL,
  title VARCHAR(180) NOT NULL,
  detail TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_events_donation (donation_id, created_at)
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  recipient_id VARCHAR(64) NOT NULL,
  title VARCHAR(180) NOT NULL,
  detail TEXT NOT NULL,
  tone VARCHAR(20) NOT NULL,
  `read` BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  INDEX idx_notifications_recipient (recipient_id, created_at)
);
