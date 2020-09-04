DROP TABLE IF EXISTS petitionList; ---  why shall I do that ????

CREATE TABLE petitionList (
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (last != ''),
     signature VARCHAR NOT NULL CHECK (signature != '')
);