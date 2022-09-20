const router = require('express').Router()
const User = require('../models/User.model')
const jwt = require('jsonwebtoken')
const path = require('path');
const Admin = require('../models/Admin.model')

router.get('/:token',async (req,res,next)=>{
    try {
        console.log('---> verification :')
        
        const {token}=req.params
        let tokenData = {}
        try{
            tokenData = jwt.verify(token,process.env.TOKEN_SECRET)
        }catch(e){
            console.log('token decryption problem')
            res.status(400).sendFile(path.join(__dirname, '../pages/emailNotValidated.html'));
            return
        }
        let foundAccount = null
        if('isAdmin' in tokenData && tokenData.isAdmin){
            foundAccount = await Admin.find({email:tokenData.email})
        }else{
            foundAccount = await User.find({email:tokenData.email})
        }
        if(foundAccount.length===0){
            res.status(400).json({message:'user not found !'})
            return
        }
        if(foundAccount[0].emailValidationCode!==tokenData.emailValidationCode){
            console.log('emailValidationCode not valid !')
            res.status(404).sendFile(path.join(__dirname, '../pages/emailNotValidated.html'));
            return
        }
        if(foundAccount[0].isMailValidated===true){
            res.status(404).sendFile(path.join(__dirname, '../pages/emailAlreadyValidated.html'));
            return
        }
        //set user.isMailValidated -> true 
        let ans = null
        if('isAdmin' in tokenData && tokenData.isAdmin){
            ans = await Admin.findByIdAndUpdate(foundAccount[0]._id,{
                isMailValidated:true,
            })    
        }else{
            ans = await User.findByIdAndUpdate(foundAccount[0]._id,{
                isMailValidated:true,
            })
        }
        
        res.status(200).sendFile(path.join(__dirname, '../pages/emailValidated.html'));
        console.log("tokenData : ", tokenData)

    } catch (error) {
        next(error)
    }
})

module.exports = router