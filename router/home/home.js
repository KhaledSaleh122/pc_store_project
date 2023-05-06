////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { getCategorys,getMainSlides,getAboutInfo } from '../dashboard/dashboard.js';
import { getNewestProducts} from '../shop/shop.js';
dotenv.config();
////////Mongoose Requires//////////////
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_LINK).catch((err)=>{console.log(err)});
//////////////////////
const router = express.Router();
/////////schema and model//
const storeInfoSchema = new mongoose.Schema ({
    phone_number : { type:String,default:'(+972)09 269696969'} ,
    location: { type:String,default:'Tulkrem, MidTown'},
    email: {type:String,default:'voxagolde2003@gmail.com'},
    name : {type:String,default:'BuildAPc'},
    modifiedDate : {type:Date,default: Date.now}
});
const StoreInfo = new mongoose.model('storeInfo',storeInfoSchema);
//////////////////
router.get('/',async (req,res)=>{
    const storeInfoData = await getStoreInfo();
    if(!storeInfoData){
        await buildStoreInfo();
    }
    const categorys = await getCategorys();
    const products = await getNewestProducts(18);
    var admin = false;
    if(req.isAuthenticated() && req.user.admin){
        admin = true;
    }
    res.render('index.ejs',{storeInfo:storeInfoData,categorys:categorys,main_slide:await getMainSlides(),
        about:await getAboutInfo(),products:products,admin : admin});
});
///////////////functions
async function getStoreInfo(){
    const storeInfoData = await StoreInfo.findOne().exec();
    return storeInfoData
}
async function updateStoreInfo(phone,location,name,email){
    await buildStoreInfo();
    const storeInfoData = await getStoreInfo();
    const s_phone = phone || storeInfoData.phone_number;
    const s_location = location || storeInfoData.location;
    const s_name = name || storeInfoData.name;
    const s_email = email || storeInfoData.email;
    return await StoreInfo.updateOne({_id:storeInfoData._id},{phone_number:s_phone,location:s_location,name:s_name,email:s_email,modifiedDate:Date.now()});
}
async function buildStoreInfo(){
    const isStoreInfoExist = await StoreInfo.exists({});
    if(!isStoreInfoExist){
        const createStoreInfoDoc = new StoreInfo();
        await createStoreInfoDoc.save();
    }
}
///add new info for store if it's not exist
buildStoreInfo();
export default router;
export {getStoreInfo,buildStoreInfo,updateStoreInfo}