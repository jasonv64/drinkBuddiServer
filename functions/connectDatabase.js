const dotenv = require('dotenv');
dotenv.config({path:'./.env'});
const mysql = require('mysql');

function connectDatabase(){
    ///gotta close this connection.
    const db = mysql.createConnection({
        host: process.env.db_host,
        user: process.env.user,
        password: process.env.db_password,
        database: process.env.database,
        port: 3306,
        ssl: true    
    });
    db.connect(function(err){
        if (err) {
            console.log("err")
            throw err;
        }
    })
    return db
}  

module.exports = connectDatabase;