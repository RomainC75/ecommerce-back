const router = require('express').Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User.model')
const Admin = require("../models/Admin.model")

router.use( async (req,res,next)=>{
    try{
        console.log('received Authorization : ', req.headers.authorization)
        const token = req.headers.authorization.split(' ')[1]
        const data = jwt.verify(token,process.env.TOKEN_SECRET)
        let Account=null
        if('isadmin' in req.headers && req.headers.isadmin){
            console.log("==>is Admin !")
            Account=Admin
        }else{
            console.log("==>is User !")
            Account=User
        }
        const user = await Account.findById(data.userId)
        console.log('=> Authentication // found user ', user)
        if(user===null){
            res.status(400).json({message: "wrong Token/user"})
            return 
        }
        console.log("authentication : ", user)
        req.user = {
            _id:user._id,
            email: user.email,
            imageUrl:user.imageUrl ? user.imageUrl : ""
        }
        next()
        
    }catch(e){
        res.status(403).json({message : 'not authorized'})
    }
})

module.exports = router