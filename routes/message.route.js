const router = require('express').Router()
const authentication = require('../middlewares/authentication.mid')
const Room = require('../models/Room.model')
const Message = require('../models/Message.model')

router.get('/lastMessage/:roomId', authentication, async(req,res, next)=>{
    try {
        const roomId=req.params.roomId
        const messages = await Message.find({room:roomId})
        if(!messages){
            res.status(400).json({message:'found no message for this room'})
            return
        }
        const lastMessage = messages.pop()
        res.status(200).json({message:lastMessage})
    } catch (error) {
        
    }
})

router.get('/:roomId',authentication,async(req,res,next)=>{
    try {
        const roomId=req.params.roomId
        const messages = await Message.find({room:roomId})
        // console.log('messages : ', messages)
        // console.log("++++++++++FINISHED ! ++++++++")
        if(!messages){
            res.status(400).json({message:'found no message for this room'})
            return
        }
        res.status(200).json(messages)
    } catch (error) {
        console.log('message error : ', error)
    }
})


module.exports=router