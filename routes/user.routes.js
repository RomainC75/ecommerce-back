const router=require('express').Router()
const authentication = require('../middlewares/authentication.mid')
const User = require("../models/User.model")
router.get('/', authentication, async(req,res,next)=>{
    try {
        const foundUser = await User.findOne({_id:req.user._id}).select({emailValidationCode:0, password:0})
        if(!foundUser){
            res.status(404).json({message:"user not found !"})
            return
        }
        res.status(200).json(foundUser)
    } catch (error) {
        next(error)
    }
})

module.exports=router