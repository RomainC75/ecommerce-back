// const socket = require("socket.io-client")("https://example.com", {
//   rejectUnauthorized: false // WARN: please do not do this in production
// });
const User = require('../models/User.model')
const Admin = require('../models/Admin.model')
const Room = require('../models/Room.model')
const Message = require('../models/Message.model')

const http = require('http')
const { Server } = require('socket.io')
const {getOrCreateRoom} = require('./tools')
const jwt = require('jsonwebtoken')
// const server = http.createServer(app)

const io = new Server(process.env.SOCKET_PORT,{ 
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
  }
})

console.log('===========================')

const socket = () =>{
    io.on('connection',async (socket)=>{
        
        console.log('===========>client connected: ',socket.id)
        
        socket.use(async(socket, next)=>{
          console.log("+++++++++++++MIDDLEWARE++++++++++++")
          console.log(socket)
          try {
            const data = jwt.verify(socket[1].token,process.env.TOKEN_SECRET)
            console.log('jwt data : ',data)
            const Account = socket[1].isadmin ? Admin : User
            const foundUser = await Account.findOne({_id:data.userId})
            if(foundUser && socket[1].userId===foundUser._id.toString()){
              console.log('====MIDDLEWARE PASSED======')
              next()
              return
            }
            console.log('=====MIDDLEWARE BLOCKED =======')
          } catch (error) {
            console.log('error : ',error)
          }
        })

        socket.on("admin_to_user",async(data)=>{
          console.log("=====>>>>>admin_to_user received !",data)
          const foundRoom = await Room.findOne({_id:data.room})
          console.log('foundRoom',foundRoom)
          if(!foundRoom){
            return
          }
          const messageAns = await Message.create({
            room:data.room,
            senderId:data.userId,
            receiverId:foundRoom.userId,
            message:data.message,
            senderType:'Admin',
            receiverType:'User'
          })
          socket.to(data.room).emit("admin_to_user",data)
          io.in("adminRoom").emit("receive_message",data)
          
        })

        socket.on("join_room", async(data)=>{
          try {
            console.log("+++++++++++++JOIN_ROOM++++++++++++")
            console.log('==>room name: ',data.room)
            // console.log("==> list : ",io.sockets.sockets)
            // console.log('==> list : ',io.sockets.clients('data.room')
            socket.join(data.room)
          } catch (error) {
            console.log("join_room ERROR : ",error)
          }
        })
        
        socket.on("send_message",async(data)=>{
          console.log("+++++++++++++SEND_MESSAGE++++++++++++")
          console.log('==> ',data)
          // socket.in(data.room).emit(data.message)
          // socket.broadcast.emit(data.message)
          const foundRoom = await Room.findOne({_id:data.room})
          const firstAdmin = await Admin.findOne({})
          console.log('foundRoom : ', foundRoom)
          const messageAns = await Message.create({
            room:data.room,
            senderId:data.userId,
            receiverId:firstAdmin._id,
            message:data.message,
            senderType:'User',
            receiverType:'Admin'
          })
          socket.to("adminRoom").emit("receive_message",{
            room:data.room
          })
          // socket.to(data.room).emit("admin_to_user",data)
          io.in(data.room).emit("admin_to_user",data)
        })
      
        // socket.join('clock-room')
        
        socket.on('disconnect',(reason)=>{
          console.log(reason)
        })
      })
}

//   setInterval(()=>{
//     io.to('clock-room').emit('time', new Date())
// },1000)

module.exports=socket