// const socket = require("socket.io-client")("https://example.com", {
//   rejectUnauthorized: false // WARN: please do not do this in production
// });


const http = require('http')
const { Server } = require('socket.io')
// const server = http.createServer(app)
const io = new Server(process.env.SOCKET_PORT,{ 
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
  }
})
console.log('===========================')

const socket = () =>{
    io.on('connection',(socket)=>{
        console.log("==============================================")
        console.log('===========>client connected: ',socket.id)
        
        socket.on("join_room", (data)=>{
          console.log("============>room : ",data)
          socket.join(data)
        })
      
        socket.on("send_message",(data)=>{
          console.log("room : send_message :")
          console.log('==> ',data)
          socket.to(data.room).emit("receive_message",data)
        })
      
        socket.join('clock-room')
        
        socket.on('disconnect',(reason)=>{
          console.log(reason)
        })
      })
}

//   setInterval(()=>{
//     io.to('clock-room').emit('time', new Date())
// },1000)

module.exports=socket