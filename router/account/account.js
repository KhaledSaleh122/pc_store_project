////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
import mongoose from 'mongoose'
import passport from 'passport'
import passportLocalMongoose from 'passport-local-mongoose'
import dotenv from 'dotenv'
import { getCategorys, getMainSlides, getAboutInfo, Product } from '../dashboard/dashboard.js';
import {getStoreInfo} from '../home/home.js'
dotenv.config();
////////Mongoose Requires//////////////
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_LINK).catch((err) => { console.log(err) });
//////////////////////
const router = express.Router();
/////////schema and model//
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    admin: { type: Boolean,default: false},
    fname: String,
    lname: String,
    address : String,
    city : String,
    phone_number : String,
    createdDate : {type : Date,default:Date.now}
});
/////////////////////////
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("account", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//////////////////////////
router.get('/register', async (req, res) => {
    console.log('lsssss');
    const search = req.query.query || ''
    const storeInfo = await getStoreInfo();
    const categorys = await getCategorys();
    res.render('register.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo,head: '',message:''});
});

router.post('/register',async (req,res)=>{
    const {firstname} = req.body;
    const {lastname} = req.body;
    const {email} = req.body;
    const {phonenumber} = req.body;
    const {address} = req.body;
    const {city} = req.body;
    const {username} = req.body;
    const {password} = req.body;
    const {confirm_password} = req.body;
    try{
        if(!firstname || !lastname || !email || !phonenumber || !address || !city || !username || !password || !confirm_password){throw 'To complete your request, please ensure that all required fields have been entered.'}
        if(!isNameValid(firstname)){throw 'Please ensure that the first name field only contains letters.'}
        if(!isNameValid(lastname)){throw 'Please ensure that the last name field only contains letters.'}
        if(!isEmailValid(email)){throw 'Please enter a valid email address in the correct email format.'}
        if(!isUserNameValid(username)){throw 'Please ensure that the Username field only contains letters and numbers.'}
        if(!isPasswordLengthValid(password)){throw 'Please ensure that password length more than 5 characters.'}
        if(!isPasswordConfimared(password,confirm_password)){throw 'Please ensure that password and confirm password is same.'}
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        const data = {
            username:username,
            fname:firstname,
            lname:lastname,
            address: address,
            city: city,
            phone_number:phonenumber,
            email:email
        }
        await new Promise((resolve, reject) => {
            User.register(data, password, (err, user) => {
              if (err) {
                reject(err);
              } else {
                resolve(user);
              }
            })
        });
        res.render('login.ejs',{  categorys:categorys,search: '',storeInfo:storeInfo,head: 'Success',message:'You registerd successfully'});
    }catch(err){
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('register.ejs',{  categorys:categorys,search: '',storeInfo:storeInfo,head: 'Error',message:err});
    }
});
/////////////////functions//register
function isNameValid(name){
    return !(/[^A-Za-z]/g.test(name)) && name.length < 25;
}

function isEmailValid(email){
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function isUserNameValid(username){
    const hasNonAlphaNumericChars = /[^A-Za-z0-9]/g.test(username);
    return (!hasNonAlphaNumericChars) && username.length < 25;
}

function isPasswordLengthValid(password){
    return (password.length >= 6);
}

function isPasswordConfimared(password,cpassword){
    return password === cpassword;
}
/////////////////////login////////////////////////////
router.get('/login', async (req, res) => {
    const search = req.query.query || ''
    const storeInfo = await getStoreInfo();
    const categorys = await getCategorys();
    res.render('login.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo,head: '',message:''});
});

router.get('/logout', async (req, res) => {
    try{
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        new Promise((resolve,reject)=>{
            req.logOut(function (err) {
                if (err) { reject(err); }
                resolve('done');
            });
        })
        res.render('login.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo,head: 'Success',message:'You successfully loged out'});
    }catch(err){
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('login.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo,head: 'Error',message:'Error while logging out'});
    }
});

/////////////////functions//login
router.post('/login',async(req,res)=>{
    const {name} = req.body;
    const {password} = req.body;
    try{
        if(!name || !password){throw 'Please ensure that you enterd the username and the password'}
        const user = new User({ username: name,password: password});
        const authenticate = User.authenticate();
        await new Promise((resolve, reject) => {
            authenticate(name, password, function (err, result) {
                if(err){reject(err)}
                if(!result){reject('Username or password is worng.')}
                req.login(user, function (err) {
                    if (err) {reject(err)}
                    resolve(result);
                })
            });
        });
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('cart.ejs', {  categorys:categorys,search: search,
            storeInfo:storeInfo,items: JSON.parse(getCookie('cartItems',req)) || [],head:'Success',message:'You successfully loged in.' });
    }catch(err){
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('login.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo,head: 'Error',message:err});
        console.log(err);
    }
});


function getCookie(name,req) {
    var nameEQ = name + "=";
    var ca = req.headers.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
//console.log(isNameValid('khaled2'));

export default router
export {userSchema,User}