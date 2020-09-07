const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSigner = () => {
    return db.query(`SELECT * FROM petitionList`);
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
///////////add querys to 'users'
