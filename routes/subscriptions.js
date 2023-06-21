const connectDatabase = require('../functions/connectDatabase.js');

const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
dotenv.config({path:'../.env'});

router.get('/api/subscriptions', (req,res,next)=>{
    var db = connectDatabase(); 
    ///https://stackoverflow.com/questions/12065931/mysql-select-rows-on-first-occurrence-of-each-unique-value
    let sql = `
    SELECT 
    usersubscriptions
    FROM USERS AS U 
    WHERE U.USERID = ${req.id}
    `
    db.query(sql,(err,result) => {
        if(err) 
            throw res.status(400).send(err);
        if (result.length){
            res.json(result);
        }
        else res.json({});
        }
    );
    db.end((err)=>{if (err) throw err;});
});

module.exports = router;