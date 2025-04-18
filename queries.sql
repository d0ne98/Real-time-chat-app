CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL
);

CREATE TABLE messages(
  id SERIAL PRIMARY KEY,
  message TEXT,
  user_id INTEGER REFERENCES users(id)
);

/* Add password column for authentication */
ALTER TABLE users
  ADD COLUMN password TEXT;