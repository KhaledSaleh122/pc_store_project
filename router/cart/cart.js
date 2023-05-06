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
router.get('/', async (req, res) => {
    const search = req.query.query || ''
    const storeInfo = await getStoreInfo();
    const categorys = await getCategorys();
    res.render('cart.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo,items: JSON.parse(getCookie('cartItems',req)) || [],head:'',message:'' });
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

export default router