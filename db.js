const {Pool} = require("pg");

const pool = new Pool({
    user: "postgres",
    password: "pgadmin",
    host: "localhost",
    port: 5432,
    database: "heremeds_db"

});



module.exports = pool;
