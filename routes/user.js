const connectDatabase = require('../functions/connectDatabase.js');

const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
const cloudinary = require('cloudinary');
const { v4: uuidv4 } = require('uuid')
var bcrypt = require('bcryptjs');

dotenv.config({path:'../.env'});

router.get('/api/user:user_id',(req,res,next)=>{
    var db = connectDatabase();
    let sql =    
    `SELECT 
        *
    FROM 
        USERS
    WHERE 
        USER_ID='${req.params.user_id}'`;

    db.query(sql,(err,result)=>{
        if(err) throw res.status(400).send('err');
        if (result.length) res.send(result);
        else res.json({});
    })

    db.end((err)=>{if (err) throw err;});
});

router.post('/api/user/signup',async (req,res) => {
    var data = req.body;
    let sql = 'INSERT INTO USERS SET ?';
    var db  = connectDatabase();

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.PASSWORD, salt, function(err, hash) {
            data["PASSWORD"] = hash;
            data['USER_ID'] = (uuidv4());
            data['SUBSCRIPTION_ID'] = (uuidv4());
            data['DATE_JOINED'] = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            //retrives cloudinary URL and assigns it in data.
            if(!data.imageUploaded) {
                console.log("use default")
                data['PICTURE'] = 'https://res.cloudinary.com/dppkrg7h5/image/upload/v1679691231/not-sw/Screenshot_2023-03-24_135342_fdr6cp.png';
                delete data.imageUploaded;
            } else {
                cloudinary.config({
                    cloud_name: process.env.cloudinaryCloudName,
                    api_key: process.env.cloudinaryAPIKEY,
                    api_secret: process.env.cloudinarySecret,
                    folder: 'not-sw'
                  });
                
                const uploadResponse = cloudinary.uploader.upload(
                    data.profilePicture,
                    {
                        upload_preset:'dev_setups'
                    }
                ).catch(res => (console.log(res, uploadResponse)));
            
                data['PICTURE'] = uploadResponse.secure_url;
                delete data.profilePicture;
                delete data.imageUploaded;
            }            
            db.query(sql, data, (err, result) => {
                if(err) throw err;
            });
            db.end(function(err){
                if (err) throw err;
            });
        });
    }); 
    res.send({Message: 'Sign-up Successful!'})
})

router.post('/api/user/login', (req, res)=> {
    var db = connectDatabase();
    var user_email = req.body.EMAIL;
    var user = {};

    let sql = 'SELECT * FROM USERS WHERE EMAIL = ?';

    db.query(sql, user_email, (err, result) => {
          console.log(req.body.PASSWORD, result[0].PASSWORD)
        if(result.length === 0) {
            return res.send({message: "Email does not exist. Please sign up"})
        }

        if (err) throw err;
        
        bcrypt.compare(req.body.PASSWORD, result[0].PASSWORD, function(err, r) {
            if (r) {
                user = Object.assign(JSON.parse(JSON.stringify(result[0])),user);
                console.log("we're in boys")
            } else {
                return res.send({message: "wrong password"}) 
            }
        });


    
    db.end(function(err){
            if (err) throw err;
        });
    });    
});

module.exports = router;