const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

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
        VALUES 
        ($1, $2, $3, $4) 
        RETURNING id
        `,
        [age || null, city, homepage, userId]
    );
};

module.exports.getUserData = (email) => {
    return db.query(
        `SELECT * FROM users 
    WHERE email = ($1)`,
        [email]
    );
};

module.exports.addUserData = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) 
        VALUES($1, $2, $3, $4)
        RETURNING id
        `,
        [first, last, email, password]
    );
};

module.exports.getSignerData = (userId) => {
    return db.query(
        `SELECT * FROM user_profiles  
        LEFT JOIN users                   
        ON user_profiles.userId = users.id
        WHERE userId = ($1)`,
        [userId]
    );
};

module.exports.updateUsers = (first, last, email, userId) => {
    return db.query(
        `UPDATE users
        SET first = ($1), last = ($2), email = ($3)
        WHERE userId = ($4)`,
        [first, last, email, userId]
    );
};

module.exports.updateUsersChangePSW = (
    first,
    last,
    email,
    password,
    userId
) => {
    return db.query(
        `UPDATE users
        SET first = ($1), last = ($2), email = ($3), password = ($4)
        WHERE userId = ($5)`,
        [first, last, email, password, userId]
    );
};

module.exports.updateProfile = (age, city, homepage, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, homepage)
        VALUES ($1,$2,$3)
        ON CONFLICT (userId)
         DO UPDATE SET age=$1, city=$2, homepage=$3`, ////or $4,5,6?
        [age || null, city, homepage, userId]
    );
};

module.exports.deleteSig = (sigId) => {
    return db.query(
        `DELETE FROM signatures
        WHERE id = ($1)`,
        [sigId]
    );
};

module.exports.getSignersList = () => {
    return db.query(
        `SELECT * FROM signatures 
        JOIN users  
        ON userId = userId
        JOIN user_profiles              
        ON user_profiles.userId = users.id`
    );
};
module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT * FROM user_profiles  
        LEFT JOIN users                   
        ON user_profiles.userId = users.id                
        WHERE city = ($1)                      
        AND LOWER(city) = LOWER($1) `,
        [city]
    );
};
