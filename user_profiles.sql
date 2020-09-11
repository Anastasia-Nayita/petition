DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles(
  id SERIAL PRIMARY KEY,
  age INT,
  city VARCHAR(255),
  homepage VARCHAR(255),
  userId INT NOT NULL UNIQUE REFERENCES users(id)
);
