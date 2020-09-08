DROP TABLE IF EXISTS signatures; 

CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     signature TEXT NOT NULL CHECK (signature != ''),
     userId INT NOT NULL REFERENCES users(id)
);

