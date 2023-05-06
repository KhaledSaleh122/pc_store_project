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
/////////////////////////.env
const environment = process.env.ENVIRONMENT || 'sandbox';
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const endpoint_url = environment === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
/////////schema and model//
const orderSchema = mongoose.Schema({
    customer_id:String,
    order_paypal:String,
    total_cost:Number,
    total_items:Number,
    status: {type:String,default:'hold'},
    createdDate:{type : Date , default: Date.now},
    updateDate :{type : Date , default: Date.now}
});

const Order = new mongoose.model('order',orderSchema);

const saleSchema = mongoose.Schema({
    order_id : {type : String,ref: 'order'},
    product_id :{type : String,ref: 'product'},
    price : Number,
    quantity:Number,
});

const Sale = new mongoose.model('sale',saleSchema);
//////////////////////////

router.get('/checkout', async (req, res) => {
    const search = req.query.query || ''
    const storeInfo = await getStoreInfo();
    const categorys = await getCategorys();
    const total = getTotalCost(JSON.parse(getCookie('cartItems',req)) || []);
    res.render('checkout.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo,total : total,items: JSON.parse(getCookie('cartItems',req)) || [],head:'',message:'' });
});

/*
router.post('/checkout',async(req,res)=>{
    const cart = JSON.parse(getCookie('cartItems',req)) || [];
    const totalCost = getTotalCost(cart);
    const totalProduct = getTotalQuantity(cart);
    try{
        if(!totalCost || !totalProduct){throw 'There is Nothing in your cart, try clear cookie'}
        const order = await createOrder(req.user._id,totalCost,totalProduct); 
        const itemsadded = await addOrderItemsToSale(order._id,cart);
        res.clearCookie('cartItems');
        const search = req.query.query || ''
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('order_complete.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo});
    }catch(err){
        console.log(err);
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.render('checkout.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo,total : totalCost,items: cart,head:'Error',message:err });
    }
})
*/

router.get('/thanks',async(req,res)=>{
    const search = req.query.query || '';
    const storeInfo = await getStoreInfo();
    const categorys = await getCategorys();
    res.render('order_complete.ejs', {  categorys:categorys,search: search,storeInfo:storeInfo});
})

router.post('/order_Completed',async(req,res)=>{
    const cart = JSON.parse(getCookie('cartItems',req)) || [];
    const totalCost = getTotalCost(cart);
    const totalProduct = getTotalQuantity(cart);
    const search = req.query.query || '';
    try{
        if(!totalCost || !totalProduct){throw 'There is Nothing in your cart, try clear cookie'}
        const order = await createOrder(req.user._id,totalCost,totalProduct,req.body.order_id); 
        const itemsadded = await addOrderItemsToSale(order._id,cart);
        res.clearCookie('cartItems');
        res.send({result:true});
    }catch(err){
        console.log(err);
        const storeInfo = await getStoreInfo();
        const categorys = await getCategorys();
        res.send({head:'Error',message:err });
    }
})
router.post('/create_order', (req, res) => {
    const total = getTotalCost(JSON.parse(getCookie('cartItems',req)) || []);
    
    get_access_token()
        .then(access_token => {
            //console.log(req.body);
            let order_data_json = {
                'intent': req.body.intent.toUpperCase(),
                'purchase_units': [{
                    'amount': {
                        'currency_code': 'USD',
                        'value': total
                    }
                }]
            };
            const data = JSON.stringify(order_data_json)
            //console.log(data);
            fetch(endpoint_url + '/v2/checkout/orders', { //https://developer.paypal.com/docs/api/orders/v2/#orders_create
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    },
                    body: data
                })
                .then(res => res.json())
                .then(json => {
                    res.send(json);
                }) //Send minimal data to client
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err)
        })
    
});


router.post('/complete_order', (req, res) => {
    get_access_token()
        .then(access_token => {
            fetch(endpoint_url + '/v2/checkout/orders/' + req.body.order_id + '/' + req.body.intent, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                .then(res => res.json())
                .then(json => {
                    //console.log(json);
                    res.send(json);
                }) //Send minimal data to client
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err)
        })
});

//////////////functions
function get_access_token() {
    const auth = `${client_id}:${client_secret}`
    const data = 'grant_type=client_credentials'
    return fetch(endpoint_url + '/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(auth).toString('base64')}`
            },
            body: data
        })
        .then(res => res.json())
        .then(json => {
            return json.access_token;
        })
}

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


function getTotalCost(cart){
    var total = 0;
    cart.forEach((v)=>{
        if((Number(v.price) * Number(v.count)) > 0 ){
            total += (Number(v.price) * Number(v.count));
        }
    })
    return total;
}

function getTotalQuantity(cart){
    var total = 0;
    cart.forEach((v)=>{
        if((Number(v.count)) > 0 ){
            total += Number(v.count);
        }
    })
    return total;
}

async function createOrder(customer_id,total_cost,total_items,order){
    return await Order.create({customer_id:customer_id,total_cost:total_cost,total_items:total_items,order_paypal:order});
}

async function addOrderItemsToSale(order_id,cart){
    const sales = [];
    cart.forEach((v)=>{
        if((Number(v.price) * Number(v.count)) > 0 ){
            //product_id :String,
            //price : Number,
            //quantity:Number,
            const doc = {
                order_id:order_id,
                product_id : v.id,
                price:v.price,
                quantity:v.count
            }
            sales.push(doc);
        }
    });
    return await Sale.insertMany(sales);
}
export default router
export {Order,Sale}