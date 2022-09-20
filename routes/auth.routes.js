const router = require("express").Router();
const nodemailer = require("nodemailer");
const User = require("../models/User.model");
const Admin = require("../models/Admin.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const possibleCredentials = require("../middlewares/possibleCredentials.mid");
const authentication = require("../middlewares/authentication.mid");
const {resetPasswordHTML} = require('../pages/passwordReset')

require("dotenv").config();
console.log("inside : ", process.env.EMAILEE, process.env.EMAILEE_PASS);

const sendEmail = (email, subject, text, html) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAILGMAIL,
      pass: process.env.EMAILGMAIL_PASS,
    },
  });

  transporter
    .sendMail({
      from: process.env.EMAILGMAIL,
      to: email,
      subject: text,
      text: subject,
      html: html,
    })
    .then((info) => console.log("-->email sent :-) !!", info))
    .catch((error) => console.log("-->nodemailer error : ", error));
};

//========================

router.get("/verify", authentication, async (req, res, next) => {

  console.log("HEADERS : ",req.headers)
  try {
    console.log("VERIFY : --->", req.user);
    res.status(200).json(req.user);
  } catch (e) {
    next(e);
  }
});


//create a Cart
router.post("/signup/", possibleCredentials, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const recordedUser = await User.findOne({ email });
    console.log("recordedUser", recordedUser);
    if (recordedUser !== null) {
      res
        .status(400)
        .json({ message: "user already exists ! try another one!" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const emailValidationCode = Math.random() * 1000;
    const ans = await User.create({
      email,
      password: hash,
      emailValidationCode,
      address: { country: "", number: "", street: "", zipcode: "", city: "" },
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
      `<h1>User mail validation</h1><b>Awesome Message</b> <a href="${process.env.BACKENDADDRESS}/emailconfirmation/${emailToken}">Click on the link below :</a>`
    );
  } catch (e) {
    next(e);
  }
});

router.post("/signin", possibleCredentials, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("==>login headers", req.headers)
    let Account = null
    if('isadmin' in req.headers && req.headers.isadmin==='true'){
      Account=Admin
    }else{
      Account=User
    }
    const recordedUser = await Account.findOne({ email });
    if (recordedUser === null) {
      res.status(404).json({ message: "user not found !" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      recordedUser.password
    );
    if (!isPasswordValid) {
      res.status(404).json({ message: "wrong email/password" });
      return;
    }
    if (!recordedUser.isMailValidated) {
      res
        .status(404)
        .json({ message: "email not validated, please check you email box" });
      return;
    }
    console.log("recordedUser._id", recordedUser._id);
    res.status(200).json({
      userId: recordedUser._id,
      token: jwt.sign({ userId: recordedUser._id }, process.env.TOKEN_SECRET, {
        expiresIn: "10h",
      }),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/getresettoken", async (req, res, next) => {
  try {
    console.log("reset request", req.body.email);
    const foundUser = await User.findOne({ email: req.body.email });
    if (!foundUser) {
      res.status(400).json({ message: "email not found !" });
      return;
    }
    console.log("found", foundUser);
    const emailToken = jwt.sign(
      { email: req.body.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    sendEmail(
      req.body.email,
      "email reset",
      "email reset",
      resetPasswordHTML(process.env.ORIGIN,emailToken)
    );

    console.log("emailToken", emailToken);
    res.status(202).json({message:"got the request, check your emails !"})
    
  } catch (error) {
    next(error);
  }
});

router.post('/resetpasswordwithtoken', async (req,res,next)=>{
  try {
    const data = jwt.verify(req.body.token,process.env.TOKEN_SECRET)

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    const user= await User.findOneAndUpdate({email:data.email},{password:hash},{new:true})
    if(!user){
      res.status(400).json({message:"oups, something went wrong while updating the password !"})
      return
    }
    res.status(202).json({message:"updated"})
  } catch (error) {
    next(error)
  }
})

module.exports = router;
