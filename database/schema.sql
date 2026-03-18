CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  plan_type VARCHAR(16) NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_plan_type_check CHECK (plan_type IN ('free', 'pro'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users (plan_type);

CREATE TABLE IF NOT EXISTS short_urls (
  id BIGSERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(32) NOT NULL UNIQUE,
  click_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT short_urls_original_url_check CHECK (char_length(original_url) > 0),
  CONSTRAINT fk_short_urls_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_short_urls_short_code ON short_urls (short_code);
CREATE INDEX IF NOT EXISTS idx_short_urls_expires_at ON short_urls (expires_at);
CREATE INDEX IF NOT EXISTS idx_short_urls_user_id ON short_urls (user_id);
CREATE INDEX IF NOT EXISTS idx_short_urls_created_at ON short_urls (created_at DESC);

CREATE TABLE IF NOT EXISTS click_analytics (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(32) NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  country VARCHAR(64) NULL,
  device_type VARCHAR(32) NULL,
  CONSTRAINT fk_click_analytics_short_code
    FOREIGN KEY (short_code)
    REFERENCES short_urls (short_code)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_click_analytics_short_code_timestamp
  ON click_analytics (short_code, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_analytics_timestamp
  ON click_analytics (clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_analytics_country
  ON click_analytics (country);
CREATE INDEX IF NOT EXISTS idx_click_analytics_device_type
  ON click_analytics (device_type);
