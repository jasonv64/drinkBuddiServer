const connectDatabase = require('../functions/connectDatabase.js');

const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
const cloudinary = require('cloudinary');
dotenv.config({path:'../.env'});

router.get('/api/user',(req,res,next)=>{
    var db = connectDatabase();
    let sql =    
    `SELECT 
        *
    FROM 
        USERS
    WHERE 
        USER_ID='454121'`;

    db.query(sql,(err,result)=>{
        if(err) throw res.status(400).send('err');
        if (result.length) res.send(result);
        else res.json({});
    })

    db.end((err)=>{if (err) throw err;});
});


router.post('/api/user/signup',async (req,res) => {
    var db  = create_connection();
    var data = req.body;
    console.log(data)

    if(!data.imageUploaded) {
        console.log("use default")
        data['profilePictureLink'] = 'https://res.cloudinary.com/dppkrg7h5/image/upload/v1679691231/not-sw/Screenshot_2023-03-24_135342_fdr6cp.png';
        delete data.imageUploaded;
    } else {
        cloudinary.config({
            cloud_name: process.env.cloudinaryCloudName,
            api_key: process.env.cloudinaryAPIKEY,
            api_secret: process.env.cloudinarySecret,
            folder: 'not-sw'
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

    data['USER_ID'] = (uuidv4());
    data['SUBSCRIPTION_ID '] = (uuidv4());
    data['DATE_JOINED'] = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    let sql = 'INSERT INTO user SET ?';

    db.query(sql, data, (err, result) => {
        if(err) throw err;
    });

    db.end(function(err){
        if (err) throw err;
    });

    res.send('Sign-up Successful!')
})

router.post('/api/user/login', (req, res)=> {
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