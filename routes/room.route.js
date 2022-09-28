const router = require("express").Router();
const authentication = require("../middlewares/authentication.mid");
const Room = require("../models/Room.model");

router.get("/", authentication, async (req, res, next) => {
  try {
    console.log('ROOM ROUTE ENTERED !')
    const foundRoom = await Room.findOne({ userId: req.user._id });
    console.log("==> found ROOM : ", foundRoom);
    if (foundRoom) {
      res.status(200).json({ room: foundRoom._id });
      return;
    }
    const ans = await Room.create({
      userId: req.user._id,
    });
    console.log("ans : ",ans)
    res.status(200).json({ room: ans._id });
  } catch (error) {
    console.log('room route ERROR')
    next(error);
  }
});

module.exports = router;
