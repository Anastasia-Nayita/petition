const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSigner = () => {
    return db.query(`SELECT * FROM petitionList`);
};

module.exports.getSignature = (signature) => {
    return db.query(
        `SELECT * FROM petitionList WHERE id = req.session.signatureId`,
        [signature]
    );
};

module.exports.addSigner = (first, last, signature) => {
    return db.query(
        `
    INSERT INTO petitionList (first, last, signature)
    VALUES($1, $2, $3)  
    RETURNING id
    `,
        ///// add RETURNING in the `` to return values
        ///$-interpolation... prevents attacks!  $ for each argument
        [first, last, signature]
    );
};

module.exports.addPassword = (first, last, email, password, created_at) => {
    return db.query(
        //////CONTINUE HERE ///////////
        `INSERT INTO users (first, last, email, password, created_at) 
        VALUES($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [first, last, email, password, created_at]
    );
};
///////////add querys to 'users'
