import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express, { Router } from 'express';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { getCategorys, getMainSlides, getAboutInfo, Product } from '../dashboard/dashboard.js';
import {getStoreInfo} from '../home/home.js'
import { Order,Sale } from '../order/order.js';
dotenv.config();
////////Mongoose Requires//////////////
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_LINK).catch((err) => { console.log(err) });
//////////////////////
const router = express.Router();
/////////////////////////.env
/////////schema and model//

//////////////////////////

router.get('/order_history',async (req,res)=>{
    try{
        const id = req.user.id;
        const user_orders = await getUserOrderHistory(id);
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('user.ejs', {  page:'history',categorys:categorys,search: search,storeInfo:storeInfo,orders:user_orders,head:'',message:'' });
    }catch(err){
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('user.ejs', {  page:'history',categorys:categorys,search: search,storeInfo:storeInfo,orders:user_orders,head:'Error',message:err });
    }
});


router.post('/order_history',async(req,res)=>{
    try{
        const id = req.body.id;
        const sales = await getUserOrderSales(id);
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('user.ejs', {  page:'view',categorys:categorys,search: search,storeInfo:storeInfo,sales:sales,head:'',message:'' }); 
    }catch(err){
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('user.ejs', {  page:'history',categorys:categorys,search: search,storeInfo:storeInfo,orders:user_orders,head:'Error',message:err });
    }
});

////////functions

async function getUserOrderHistory(id){
    return await Order.find({customer_id:id}).exec();
}

async function getUserOrderSales(id){
    return await Sale.find({order_id:id}).populate('product_id').exec();
}
export default router;