const connectDatabase = require('../functions/functions.js');

const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
dotenv.config({path:'../.env'});

router.get('/api/vendors', (req,res,next)=>{
    var db = connectDatabase(); 
    ///https://stackoverflow.com/questions/12065931/mysql-select-rows-on-first-occurrence-of-each-unique-value
    let sql = `
    SELECT 
    Vendorinfo
    FROM Vendors AS V 
    WHERE V.Region = User.Region
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