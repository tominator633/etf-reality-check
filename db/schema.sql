-- ETF Reality Check – tabulka leadů (tech-spec 7.3).
-- Spustit jednou v Neon SQL Editoru (dev i produkční větev). Idempotentní (IF NOT EXISTS).
-- CHECK omezení jsou druhá vrstva ochrany za validací v /api/lead: databáze nepřijme
-- nic, co by aplikace sama neměla poslat.

CREATE TABLE IF NOT EXISTS leads (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL UNIQUE
                              CHECK (char_length(email) BETWEEN 3 AND 254 AND email = lower(email) AND email LIKE '%_@_%'),
  created_at      timestamptz NOT NULL DEFAULT now(),
  variant         text        NOT NULL DEFAULT 'a' CHECK (variant IN ('a', 'b')),
  utm_source      text        CHECK (char_length(utm_source) <= 100),
  utm_medium      text        CHECK (char_length(utm_medium) <= 100),
  utm_campaign    text        CHECK (char_length(utm_campaign) <= 100),
  utm_content     text        CHECK (char_length(utm_content) <= 100),
  quiz_answer     text        CHECK (quiz_answer IN ('ano', 'ne')),   -- NULL = bez odpovědi
  consent_version text        NOT NULL CHECK (char_length(consent_version) BETWEEN 1 AND 50)
);

-- Neukládáme IP adresu ani user agent (tech-spec 7.3).
