const connectDatabase = require('../functions/functions.js');

const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
const cloudinary = require('cloudinary');
dotenv.config({path:'../.env'});

router.get('/api/userinformation/:user_id',(req,res,next)=>{
    var db = connectDatabase();
    let sql =    
    `SELECT 
        FIRST_NAME as firstName,
        LAST_NAME as lastName,
        CITY as city,
        STATE as state,
        PROFILEPICTURELINK as profilePictureLink,
        SIGNEDUP as signedUp 
    FROM 
        USER 
    WHERE 
        USER_ID='${req.params.user_id}'`;

    

    db.query(sql,(err,result)=>{
        if(err) throw res.status(400).send('err');
        if (result.length) res.send(result);
        else res.json({});
    })

    db.end((err)=>{if (err) throw err;});
});


router.post('/api/signup',async (req,res) => {
    var db  = create_connection();
    var data = req.body;
    console.log(data)

    if(!data.imageUploaded) {
        console.log("use default")
        data['profilePictureLink'] = 'https://res.cloudinary.com/ledgiswap/image/upload/v1641720849/mwx9hcko2wqdb37f4vnp.svg';
        delete data.imageUploaded;
    } else {
        cloudinary.config({
            cloud_name: process.env.cloudinaryCloudName,
            api_key: process.env.cloudinaryAPIKEY,
            api_secret: process.env.cloudinarySecret,
            folder: 'ledgiswap'
          });
        
        const uploadResponse = await cloudinary.uploader.upload(
            data.profilePicture,
            {
                upload_preset:'dev_setups'
            }
        ).catch(res => (console.log(res, uploadResponse)));
    
        data['profilePictureLink'] = uploadResponse.secure_url;
        delete data.profilePicture;
        delete data.imageUploaded;
    }

    data['user_id'] = (uuidv4());
    data['signedup'] = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    var preferences = {
        user_id: data.user_id,
        doge:false, 
        btc:false, 
        lite:false
    }
    
    let sql = 'INSERT INTO user SET ?';
    let preferencesSql = 'INSERT INTO PREFERENCES SET ?'

    db.query(sql, data, (err, result) => {
        if(err) throw err;
    });

    db.query(preferencesSql, preferences, (err, result) => {
        if(err) throw err;
    });

    db.end(function(err){
        if (err) throw err;
    });

    res.send('Sign-up Successful!')
})

router.post('/api/login', (req, res)=> {
    var db = create_connection();
    var user_email = req.body.email;
    var user_attempted_password = req.body.password;
    var user = {};
    let sql = 'SELECT * FROM USER WHERE EMAIL = ?';

    db.query(sql, user_email, (err, result) => {
        if(result.length === 0) {
            console.log('Email does not exist. Please sign up')
            return res.send('Email does not exist. Please sign up')
        }
        if (err) throw err;
        ///this line will be replaced with bycrypt
        if (result[0].password === user_attempted_password) {
            user = Object.assign(JSON.parse(JSON.stringify(result[0])),user);

        } else {
            console.log('Wrong password.')
            return res.send('Wrong password.')           
        }
    
    let preferencesSql = `SELECT * FROM PREFERENCES WHERE USER_ID = '${user.user_id}'`;
    db.query(preferencesSql,(err,result) => {
        if(err) throw err;
        user = Object.assign({preferences: JSON.parse(JSON.stringify(result)) },user);
        console.log(user)
        return res.send(user)
    })
    db.end(function(err){
            if (err) throw err;
        });
    });    
});

module.exports = router;