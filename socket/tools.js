const Room = require('../models/Room.model')

const getOrCreateRoom = (userId)=>{
    console.log('+++++++++++++++++++++++++++++++++++++++++++')
    return new Promise (async (resolve, reject)=>{
        try {
            const foundRoom = await Room.findOne({userId})
            console.log('==> found ROOM : ', foundRoom)
            if(foundRoom){
                resolve(foundRoom._id)
            }else{
                console.log('create ROOM : ',userId)
                const ans = await Room.create({
                    userId
                })
                resolve(ans._id)
            }
        } catch (error) {
            reject(false)
        }
    })
}

module.exports={
    getOrCreateRoom
}