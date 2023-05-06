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
    const categorys = await getCategorys();
    const maxProductPrice = await getMaxProductPrice();
    var maxPrice = 1000;
    if (maxProductPrice) {
        maxPrice = maxProductPrice.price
    }
    const search = req.query.query || ''
    const storeInfo = await getStoreInfo();
    const category = req.query.category;
    res.render('shop.ejs', { categorys: categorys, maxPrice: maxPrice, search: search,storeInfo:storeInfo,category:category});
});



router.post('/data', async (req, res) => {
    const page = Number(req.body.page);
    const { sort } = req.body;
    const { column_sort } = req.body;
    const length = Number(req.body.length);
    const category = req.body['category[]'];
    const sPrice = Number(req.body.sPrice);
    const ePrice = Number(req.body.ePrice);
    const query = req.body.query || '';
    const sortOption = {}
    var searchOptions = [];
    if (/^[0-9a-fA-F]{24}$/.test(req.body.query)) {
        console.log("yes");
        searchOptions = [
            { name: { $regex: new RegExp(query, 'ig') } },
            { category: { $regex: new RegExp(query, 'ig') }},
            { _id: query}
        ]
    }else{
        searchOptions = [
            { name: { $regex: new RegExp(query, 'ig') } },
            { category: { $regex: new RegExp(query, 'ig') }}
        ]
    }
    try {
        if (page === 'Nan' || !sort || length === 'Nan' || !category || ePrice === 'Nan' || sPrice === 'Nan' || !column_sort) { throw 'All fields required!!!' }
        //Find Total Records
        const total_recoreds = await Product.count({
            $or: searchOptions, category: { $in: category }, price: { $gte: sPrice, $lte: ePrice }
        }).exec();
        //Number Of  Pages
        var total_pages = Math.ceil(total_recoreds / length);
        //start searching recored
        const start_seachring_number = (page * length - length) + 1;
        //sort option
        sortOption[column_sort] = sort;
        //total records after feltring
        const total_recoreds_with_filtering = await Product.count({
            $or: searchOptions, category: { $in: category }, price: { $gte: sPrice, $lte: ePrice }
        })
            .skip(start_seachring_number - 1)
            .limit(length)
            .sort({ column_sort: sort })
            .exec();
        const recoreds_with_filtering = await Product.find({
            $or: searchOptions, category: { $in: category }, price: { $gte: sPrice, $lte: ePrice }
        })
            .skip(start_seachring_number - 1)
            .sort(sortOption)
            .limit(length)
            .exec();
        res.send({ data: recoreds_with_filtering, total_pages: total_pages, total_recoreds_with_filtering: total_recoreds_with_filtering, total_recoreds, total_recoreds });
    } catch (err) {
        console.log(err);
        res.send([]);
    }
});
///////////////////////////////////////////////
async function getMaxProductPrice() {
    return await Product.findOne().sort({ price: -1 }).exec();
}

async function getNewestProducts(limit){
    return await Product.find().sort({createdDate : -1}).limit(limit || 100).exec();
}

export default router;
export {getNewestProducts}