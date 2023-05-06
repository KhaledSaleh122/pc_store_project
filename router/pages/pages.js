////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
import mongoose from 'mongoose'
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
//////////////////////////
router.get(/^\/(aboutus|faq|contactus|privacyandpolicy|termsandconditions)$/, async (req, res) => {
    const search = req.query.query || ''
    const storeInfo = await getStoreInfo();
    const categorys = await getCategorys();
    const page = req.params[0];
    var pageEJS = '';
    if(page && page.toLowerCase() === 'aboutus'){
        pageEJS = 'about_us.ejs';
    }else if(page && page.toLowerCase() === 'faq'){
        pageEJS = 'faq.ejs';
    }else if(page && page.toLowerCase() === 'contactus'){
        pageEJS = 'contact_us.ejs';
    }else if(page && page.toLowerCase() === 'privacyandpolicy'){
        pageEJS = 'privacyandpolicy.ejs';
    }else if(page && page.toLowerCase() === 'termsandconditions'){
        pageEJS = 'termsandconditions.ejs';
    }
    if(pageEJS){
        res.render(pageEJS, {  categorys:categorys,search: search,storeInfo:storeInfo});
    }
});



export default router