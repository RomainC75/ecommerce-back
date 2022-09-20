const router = require('express').Router()
const Admin = require('../models/Admin.model')
const possibleCredentials = require('../middlewares/possibleCredentials.mid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post("/signup", possibleCredentials, async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const recordedUser = await Admin.findOne({ email });
      console.log("recordedUser", recordedUser);
      if (recordedUser !== null) {
        res
          .status(400)
          .json({ message: "admin already exists ! try another one!" });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const emailValidationCode = Math.random() * 1000;
      const ans = await Admin.create({
        email,
        password: hash,
        emailValidationCode
      });
      res.status(201).json(ans);
  
      const emailToken = jwt.sign(
        { email: email, emailValidationCode },
        process.env.TOKEN_SECRET,
        { expiresIn: "3d" }
      );
      //email
      sendEmail(
        email,
        "email verification",
        "email verification",
        `<h1>Admin mail Validation : </h1><b>Awesome Message</b> <a href="${process.env.BACKENDADDRESS}/emailconfirmation/${emailToken}">Click on the link below :</a>`
      );
    } catch (e) {
      next(e);
    }
  });

  module.exports= router