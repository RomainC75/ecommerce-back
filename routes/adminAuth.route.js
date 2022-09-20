const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin.model')
const PossibleAdminEmails= require('../models/possibleAdminEmails.model')
const {sendEmail} = require('../tools/sendEmails')

const possibleCredentials = require('../middlewares/possibleCredentials.mid')

router.post("/signup", possibleCredentials, async (req, res, next) => {
    console.log('request : ',req.body)
    try {
      const { email, password } = req.body;
      const recordedUser = await Admin.findOne({ email });
      const foundPossibleAdminEmail = await PossibleAdminEmails.findOne({email:email})
      console.log("recordedUser", recordedUser);
      console.log("foundPossibleAdminEmail : ",foundPossibleAdminEmail)
      if (recordedUser !== null) {
        res
          .status(400)
          .json({ message: "admin already exists ! try another one!" });
        return;
      }else if(!foundPossibleAdminEmail){
        res.status(400).json({message:"email not authorized !"})
        return
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
        { email: email, emailValidationCode, isAdmin:true },
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