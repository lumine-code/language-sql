-- A SQL sample, kept idiomatic so it is worth opening in the editor.

/* Schema. */
CREATE TABLE users (
  id         INTEGER      PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  age        INT          DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX users_email_idx ON users (email);

CREATE VIEW adults AS
  SELECT id, email FROM users WHERE age >= 18;

-- Reads.
SELECT u.email,
       COUNT(o.id)   AS order_count,
       SUM(o.total)  AS lifetime_value
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
WHERE u.age BETWEEN 18 AND 65
  AND u.email LIKE '%@example.com'
  AND u.id NOT IN (SELECT user_id FROM banned)
GROUP BY u.email
HAVING COUNT(o.id) > 0
ORDER BY lifetime_value DESC
LIMIT 50 OFFSET 100;

-- Writes.
INSERT INTO users (email, age) VALUES ('ada@example.com', 36);

UPDATE users
   SET age = age + 1
 WHERE id = 1;

DELETE FROM users WHERE created_at < '2020-01-01';

BEGIN;
  ALTER TABLE users ADD COLUMN nickname TEXT;
COMMIT;

DROP TABLE IF EXISTS banned;
