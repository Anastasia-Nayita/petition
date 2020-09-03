const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/geography");
module.exports.getCities = () => {
    return db.query(`SELECT * FROM cities`);
};
module.exports.addCity = (city, pop, country) => {
    return db.query(
        `
    INSERT INTO cities (city, population, country)
    VALUES($1, $2, $3)  
    `,
        ///// add RETURNING in the `` to return values
        ///$-interpolation... prevents attacks!  $ for each argument
        [city, pop, country]
    );
};
