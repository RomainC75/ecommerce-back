const router = require('express').Router()
const jwt = require('jsonwebtoken')
const path = require('path');
const User = require('../models/User.model')
const Admin = require('../models/Admin.model')

router.get('/:token',async (req,res,next)=>{
    try {
        console.log('---> verification :')
        
        const {token}=req.params
        let tokenData = {}
        try{
            tokenData = jwt.verify(token,process.env.TOKEN_SECRET)
            console.log("tokenData : ", tokenData)
        }catch(e){
            console.log('token decryption problem')
            res.status(400).sendFile(path.join(__dirname, '../pages/emailNotValidated.html'));
            return
        }
        
        let Account=null
        if('isadmin' in tokenData && tokenData.isadmin){
            Account=Admin
        }else{
            Account=User
        }
        
        let foundAccount = await Account.findOne({email:tokenData.email})
        if(!foundAccount){
            res.status(400).json({message:'user not found !'})
            return
        }
        if(foundAccount.emailValidationCode!==tokenData.emailValidationCode){
            console.log('emailValidationCode not valid !')
            res.status(404).sendFile(path.join(__dirname, '../pages/emailNotValidated.html'));
            return
        }
        if(foundAccount.isMailValidated===true){
            res.status(404).sendFile(path.join(__dirname, '../pages/emailAlreadyValidated.html'));
            return
        }
        //set user.isMailValidated -> true 
        const ans = await Account.findByIdAndUpdate(foundAccount._id,{
            isMailValidated:true,
        })
        res.status(200).sendFile(path.join(__dirname, '../pages/emailValidated.html'));
        console.log("tokenData : ", tokenData)

    } catch (error) {
        next(error)
    }
})

module.exports = router