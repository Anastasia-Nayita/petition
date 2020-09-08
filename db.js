const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSigner = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.getSignature = (sigId) => {
    return db.query(
        `SELECT signature FROM signatures 
    WHERE id = ($1)`,
        [sigId]
    );
};

module.exports.addSigner = (signature, userId) => {
    return db.query(
        `
    INSERT INTO signatures (signature, userId)
    VALUES($1, $2)  
    RETURNING id
    `,
        ///// add RETURNING in the `` to return values
        ///$-interpolation... prevents attacks!  $ for each argument
        [signature, userId]
    );
};

module.exports.addProfile = (age, city, homepage, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, homepage, userId)
    VALUES($1, $2, $3, $4)  
    RETURNING id
        `,
        [age, city, homepage, userId]
    );
};

module.exports.getUserData = (email) => {
    return db.query(
        `SELECT * FROM users 
    WHERE email = ($1)`,
        [email]
    );
};

module.exports.addUserData = (
    first,
    last,
    email,
    password,
    created_at,
    userId
) => {
    return db.query(
        `INSERT INTO users (first, last, email, password, created_at, userId) 
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
        [first, last, email, password, created_at, userId]
    );
};
///////////add querys to 'users'
