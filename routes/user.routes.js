const router=require('express').Router()
const authentication = require('../middlewares/authentication.mid')
const User = require("../models/User.model")
const fileUploader = require('../config/cloudinary.config')
var cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  });

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

router.patch('/', authentication, async(req,res,next)=>{
    console.log('patch : body :',req.body)
    try {
        const foundUser = await User.findOne({_id:req.user._id})
        if(!foundUser){
            res.status(404).json({message:"user not found !"})
            return
        }
        const ans = await User.findOneAndUpdate({_id:req.user._id},req.body,{new:true}).select({emailValidationCode:0, password:0})
        console.log('ANS : ',ans)
        res.status(200).json(ans)
    } catch (error) {
        next(error)
    }
})

router.post("/image", authentication,fileUploader.single("image"), async(req, res, next) => {
    console.log("file is: ", req.file)    
    if (!req.file) {
        next(new Error("No file uploaded!"));
        return;
    }
    try {
        const foundUser = await User.findOne({_id:req.user._id})
        if(foundUser.imageUrl){
            const imageUrlParts = foundUser.imageUrl.split('ecommerce-avatars/')
            const nameToDelete = `ecommerce-avatars/${imageUrlParts[1].split('.')[0]}`
            cloudinary.uploader.destroy(nameToDelete, function(result) { console.log('--->deleted ? ',result) });
        }
        const ans = await User.findOneAndUpdate({_id:req.user._id},{imageUrl:req.file.path},{new:true})
        res.json(ans);
    }catch(error){
        next(error)
    }
});


module.exports=router