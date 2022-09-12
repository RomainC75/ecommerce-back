const router = require('express').Router()
const Cart = require("../models/Cart.model")
const Product = require('../models/Product.model')
const Order = require('../models/Order.model')

const authentication = require('../middlewares/authentication.mid')
const {generator} = require('../pages/orderConfirmationGenerator')

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAILGMAIL,
      pass: process.env.EMAILGMAIL_PASS,
    },
  });
  
router.get('/',authentication, async(req,res,next)=>{
    console.log(req.user)
    try {
        const ans = await Cart.findOne({userId:req.user._id}).select({userId:0}).populate('products.productId')
        res.status(200).json(ans)
    } catch (error) {
        next(error)
    }
})

router.post("/checkout/", authentication, async(req,res,next)=>{
    try {
        console.log("received card validation : ",req.body)
        const actualCart = await Cart.findOne({userId:req.user._id})
        if(!actualCart){
            res.status(400).json({message:"cart not found!"})
            return
        }
        const orderAns = await Order.create({
            userId:req.user,
            totalCost:req.body.totalCost,
            creditCard:req.body.creditCard,
            products:actualCart.products,
            shipping:{
                address:req.body.address
            }
        })

        await Cart.findOneAndDelete({userId:req.user._id})
        
        transporter
            .sendMail({
                from: process.env.EMAILGMAIL,
                to: req.user.email,
                subject: "Commande confirmation",
                text: "Thank you for purchasing our items",
                html: generator(orderAns._id, orderAns.shipping.address, orderAns.products,orderAns.totalCost),
            })
            .then((info) => console.log("-->email sent :-) !!", info))
            .catch((error) => console.log("-->nodemailer error : ", error));

        res.status(200).json({message: "cart validated !"})
    } catch (error) {
        next(error)
    }
})

router.post('/',authentication, async(req,res,next)=>{
    try {
        const ans = await Cart.find({userId:req.user._id})
        console.log('BODY : ',req.body)
        if(ans.length>0){
            res.status(400).json({message: 'cart already exists !'})
            return
        }
        //test values inside the request
        if(Array.isArray(req.body)){
            const ans = await Cart.create({
                userId:req.user._id,
                products:req.body
            })
            if(ans){
                const newCartAns = await Cart.findOne({userId:req.user._id}).populate('products.productId')
                console.log("POST new cart ANS : ",newCartAns)
                res.status(200).json(newCartAns)
                return
            }
        }
        res.status(404).json({message: 'data format problem (array'})
    } catch (error) {
        next(error)
    }
})

router.patch('/',authentication, async (req,res,next)=>{
    console.log('patch received : ',req.body)
    try {
        const ans = await Cart.find({userId:req.user._id})
        if(ans.length===0){
            res.json(404).json({message:"cart doesn\'t exist !"})
            return
        }
        const ansUpdate = await Cart.findOneAndUpdate({userId:req.user._id},{products:req.body},{new:true}).populate('products.productId')
        console.log("UPDATE cart ANS : ",ans)
        res.status(200).json(ansUpdate)
    } catch (error) {
        next(error)
    }
})

router.delete('/', authentication, async (req,res,next)=>{
    try {
        const ans = await Cart.findOneAndDelete({userId:req.user._id})
        console.log('delete : ',ans )
        res.status(400).json(ans)
    } catch (error) {
        next(error)
    }
})

module.exports=router