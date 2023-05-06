////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////////////////
import express from 'express';
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config();
import fileUpload from 'express-fileupload'
import fetch from 'node-fetch';
///////Required express Files/////////
import dashboard from './router/dashboard/dashboard.js'
import home from './router/home/home.js'
import shop from './router/shop/shop.js'
import cart from './router/cart/cart.js'
import wishlist from './router/wishlist/wishlist.js'
//import preview from './router/preview/preview.js'
import pages from './router/pages/pages.js'
import account,{userSchema} from './router/account/account.js'
import order from './router/order/order.js'
import user from './router/user/user.js'
///////////////
import mongoose from 'mongoose'
import session from 'express-session'
import passport from 'passport'
///////////////
const app = express();
app.set('view-engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());
/////////////////
const port = 3000;

////////////////
app.listen(port, () => {
    console.log("server start at port " + port);
});

function ifItAuthPreventNext(req,res,next){
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('/');
    }
}

function isAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/login');
    }
}

function isAuthenticatedAndAdmin(req,res,next){
    if(req.isAuthenticated()){
        if(req.user.admin){
            next();
        }else{
            res.render('page_404.ejs');
        }
    }else{
        res.redirect('/login');
    }
}

//CLIENT ID : AQXOtIznN7_lck5L-BAwWfIH6Ay5mEZheOAZDYTl_y8KiZ5FCqipLNqnGuYRhLvgoFgOCKYrs-mCdNNT
//SECRET : EAavboUbnADrAlL6QjQLcBxSIUgpvmugRb2Egcqhw49vPN0DR1ptTk6dWaP1cbeR8aygIoLfiUU12KPx

app.use('/register',ifItAuthPreventNext);
app.use('/login',ifItAuthPreventNext);
app.use('/checkout',isAuthenticated);
app.use('/logout',isAuthenticated);
app.use('/dashboard',isAuthenticatedAndAdmin);
app.use('/user',isAuthenticated);
app.use('/dashboard',dashboard);
app.use('/shop',shop);
app.use('/cart',cart);
app.use('/wishlist',wishlist);
//app.use('/preview',preview);
app.use('/',pages);
app.use('/',account);
app.use('/',order);
app.use('/',home);
app.use('/user',user);

app.use(function(req, res, next) {
    res.status(404).render('page_404.ejs');
});




