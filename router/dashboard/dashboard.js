
////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
import * as fs from 'fs/promises'
import {updateStoreInfo,getStoreInfo} from '../home/home.js'
import { Order,Sale } from '../order/order.js';
import { User } from '../account/account.js';
//////////////Special for this file/////////////////////////
////////Mongoose Requires//////////////
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_LINK).catch((err)=>{console.log(err)});
//////////////////////
const router = express.Router();
////schema and models/////
const categorySchema = new mongoose.Schema({
    name : String,
    createdDate:{type: Date,default: Date.now},
    modifiedDate : {type: Date,default: Date.now},
    mimetype: String
});

const Category = new mongoose.model('category',categorySchema);

const mainSlideSchema = new mongoose.Schema({
    index:Number,
    subhead:String,
    head:String,
    description:String,
    mimetype:String,
    modifiedDate:{type: Date,default :Date.now}
});
const Main_slide = new mongoose.model('main_slide',mainSlideSchema);

const aboutSlideSchema = new mongoose.Schema({
    head:String,
    description:String,
    mimetype:String,
    modifiedDate:{type: Date,default :Date.now}
})

const About = new mongoose.model('about',aboutSlideSchema);

const productSchema = mongoose.Schema({
    name:String,
    category : String,
    price : Number,
    quantity:Number,
    mimetype:String,
    createdDate:{type: Date,default: Date.now},
    modifiedDate:{type: Date,default :Date.now}
});

const Product = new mongoose.model('product',productSchema);
/////////////////////////
router.get('/', async(req, res) => {
    const dailySignup = Math.ceil(await getCountSignsUpInLastWeek()/7);
    const dailyOrders = Math.ceil(await getCountOrderInLastWeek()/7);
    const dailyRevenue =  Math.ceil(await getRevenueInLastWeek()/7);
    const daily = {
        signup : dailySignup,
        orders : dailyOrders,
        revenue : dailyRevenue
    }
    res.render('dashboard.ejs',{daily:daily,page:"dashboard",head:'',message:'',storeInfo:await getStoreInfo(),orders : await getOrdersInLastWeek() });
});

router.get('/control',async(req,res)=>{
    res.render('dashboard.ejs',{page:"control",head:'',message:'',storeInfo:await getStoreInfo() });
})

router.get('/orders',async(req,res)=>{
    res.render('dashboard.ejs',{page:"orders",head:'',message:'',storeInfo:await getStoreInfo() ,orders: await getOrders()});
})

router.post('/view_order',async(req,res)=>{
    const {id} = req.body;
    if(id){
        res.render('dashboard.ejs',{page:"view_order",head:'',message:'',storeInfo:await getStoreInfo(),order: await getOrder(id),items : await getItemsForOrder(id)});
    }else{
        res.render('dashboard.ejs',{page:"orders",head:'Error',message:'Id order is required.',storeInfo:await getStoreInfo() ,orders: await getOrders()});
    }
})

router.post('/change_status',async(req,res)=>{
    try{
        const {action} = req.body;
        const {id} = req.body;
        if(!action || !id){throw 'all info is required.'}
        if(action === 'complete'){
            await updateOrderStatus(id,'Completed');
        }else if(action === 'cancel'){
            await updateOrderStatus(id,'Canceled');
        }else{
            throw 'There is Error, Try Again.';
        }
        res.render('dashboard.ejs',{page:"orders",head:'Success',message:'Order status changed successfully.',storeInfo:await getStoreInfo() ,orders: await getOrders()});
    }catch(err){
        res.render('dashboard.ejs',{page:"orders",head:'Error',message:err,storeInfo:await getStoreInfo() ,orders: await getOrders()});
    }
})

router.post('/control',(req,res)=>{
    const {action} = req.body;
    const {type} = req.body;
    if(type === 'logo'){
        uploadNewLogo(req,res);
    }else if(type === "siteInfo"){
        newSiteInfo(req,res);
    }else if(type === 'slide'){
        if(action === "update"){
            updateASlide(req,res);
        }else if(action === "delete"){
            deleteASlide(req,res);
        }else{
            res.redirect('/dashboard/main_category');
        }
    }else if(type === 'about'){
        updateAAboutSlide(req,res);
    }else{
        res.redirect('/dashboard/main_category');
    }
});

router.get('/main_category',async(req,res)=>{
    try{
        //get All Categorys
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:"main_category",categorys:categorys,head:'',message:'',storeInfo:await getStoreInfo() });
    }catch(err){
        //get All Categorys
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:"main_category",head:'Error',message:err,categorys:categorys,storeInfo:await getStoreInfo() });
    }
})

router.post('/main_category',async(req,res)=>{
    const {type} = req.body;
    if(!type){
        createANewCategory(req,res);
    }else if(type === "delete"){
        await deleteACategory(req,res);
    }else{
        res.redirect('/dashboard/main_category');
    }
})



router.get('/add_product',async(req,res)=>{
    const categorys = await getCategorys();
    res.render('dashboard.ejs',{page:"add_product",head:'',message:'',categorys:categorys,storeInfo:await getStoreInfo() });
})


router.post('/add_product',async(req,res)=>{
    try{
        const {name} = req.body;
        const {category} = req.body;
        var {price} = req.body;
        price = Number(price);
        var {quantity} = req.body;
        quantity = Number(quantity);
        if(!name || !category || !price || price < 0 || !quantity || quantity < 0){throw "All info is required and it's must be valid!!!"}
        if(!req.files){throw 'Image of product is required!!!'}
        const {image} = req.files;
        if(!image){throw 'Image of product is required!!!'}
        const imagePngOrJpgRegex = /^image\/(png|jpg|jpeg)$/;
        if(!imagePngOrJpgRegex.test(image.mimetype)){throw 'Image must be jpg only'}
        const extension = image.mimetype.match(/(jpg|jpeg|png)$/i)[1];
        if(!extension){throw 'Image Must be jpg or jpeg only'}
        //upload info to database
        const createdProduct = await createProduct(name,category,price,quantity,extension);
        //Now Move Image To The upload File
        image.mv(`${__dirname}../../public/upload/product/${createdProduct._id}.${extension}`);
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:"add_product",head:'Success',message:'Product Created Successfully!!',categorys:categorys,storeInfo:await getStoreInfo() });
    }catch(err){
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:"add_product",head:'Error',message:err,categorys:categorys,storeInfo:await getStoreInfo() });
    }
})

router.get('/edit_product',async(req,res)=>{
    const {id} = req.query;
    const categorys = await getCategorys();
    res.render('dashboard.ejs',{page:"edit_product",head:'',message:'',product: await getProduct(id),categorys:categorys,storeInfo:await getStoreInfo() });
})

router.post('/edit_product',async(req,res)=>{
    const {id} = req.body;
    try{
        const {name} = req.body;
        const {category} = req.body;
        var {price} = req.body;
        price = Number(price);
        var {quantity} = req.body;
        quantity = Number(quantity);
        if(!name || !category ||  price < 0 ||   quantity < 0 || !id){throw "All info is required and it's must be valid!!!"}
        var extension;
        if(req.files){
            const {image} = req.files;
            if(!image){throw 'Image of product is required!!!'}
            const imagePngOrJpgRegex = /^image\/(png|jpg|jpeg)$/;
            if(!imagePngOrJpgRegex.test(image.mimetype)){throw 'Image must be jpg only'}
            const extension = image.mimetype.match(/(jpg|jpeg|png)$/i)[1];
            if(!extension){throw 'Image Must be jpg or jpeg only'}
            //Now Move Image To The upload File
            image.mv(`${__dirname}../../public/upload/product/${id}.${extension}`);
        }
        //if(!req.files){throw 'Image of product is required!!!'}
        //upload info to database
        const updatedProduct = await updateProduct(id,name,category,price,quantity,extension);
        if(!updatedProduct){throw 'Could not update product!!'}
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:"edit_product",head:'Success',message:'Product Updated Successfully!!',categorys:categorys,product: await getProduct(id),storeInfo:await getStoreInfo() });
    }catch(err){
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:"edit_product",head:'Error',message:err,categorys:categorys,product: await getProduct(id),storeInfo:await getStoreInfo() });
    }
})


router.get('/list_product',async(req,res)=>{
    const products = await getProducts();
    res.render('dashboard.ejs',{page:"list_product",head:'',message:'',products:products,storeInfo:await getStoreInfo() });
})

router.post('/list_product',async(req,res)=>{
    try{
        const {id} = req.body;
        const {action} = req.body;
        if(!id || !action){throw 'ID and Action is require !!!'}
        if(action === "delete"){
            const deletedProduct = await deleteProduct(id);
            if(!deletedProduct){throw 'Could Not Delete Product!!!'}
            const products = await getProducts();
            res.render('dashboard.ejs',{page:"list_product",head:'Success',message:'The Product Deleted Successfully',products:products,storeInfo:await getStoreInfo() }); 
        }else if(action === 'edit'){
            res.redirect(`/dashboard/edit_product?id=${id}`)
        }else{
            res.redirect('/dashboard/list_product');
        }
    }catch(err){
        const products = await getProducts();
        res.render('dashboard.ejs',{page:"list_product",head:'Error',message:err,products:products,storeInfo:await getStoreInfo() }); 
    }
})

//////////////functions
async function updateProduct(id,name,category,price,quantity,mimetype){
    var options = {}
    if(mimetype){
        options = {name:name,category:category,price:price,quantity:quantity,mimetype:mimetype,modifiedDate:Date.now()}
    }else{
        options = {name:name,category:category,price:price,quantity:quantity,modifiedDate:Date.now()}
    }
    return await Product.findOneAndUpdate({_id:id},options).exec();
}

async function getProduct(id){
    try{
        return await Product.findOne({_id:id}).exec();
    }catch(err){
        return '';
    }
}
async function deleteProduct(id){
    return await Product.findOneAndDelete({_id:id}).exec();
}
async function getProducts(limit){
    if(limit){
        return await Product.find({}).limit(limit).exec();
    }else{
        return await Product.find({}).exec();
    }
}
async function createProduct(name,category,price,quantity,mimetype){
    const product = await Product.create({name:name,category:category,price:price,quantity:quantity,mimetype:mimetype});
    return await product.save();
}
async function deleteSlide(index){
    return await Main_slide.findOneAndDelete({index:index}).exec();
}
async function deleteASlide(req,res){
    try{
        const {slide_number} = req.body;
        const index = Number(slide_number);
        if(!index || typeof index !== 'number' || index < 1 || index > 3){throw 'Slide Number is Required!!'}
        const deletedSlide = await deleteSlide(index);
        if(!deletedSlide){throw "Could Not Delete That Slide or it's Not Exisit"}
        res.render('dashboard.ejs',{page:"control",head:'Success',message:`Slide deleted Successfully`,storeInfo:await getStoreInfo()});
    }catch(err){
        res.render('dashboard.ejs',{page:"control",head:'Error',message: err,storeInfo:await getStoreInfo()});
    }
}
async function getAboutInfo(){
    return await About.findOne({});
}

async function updateAbout(head,description,extension){
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return await About.findOneAndUpdate({},{head:head,description:description,modifiedDate:Date.now(),mimetype:extension}, options).exec();
}

async function updateAAboutSlide(req,res){
    try{
        const {header} = req.body;
        const {about} = req.body;
        if(!header || !about){throw 'All info is required'}
        if(!req.files){throw 'About image is required!!'}
        const {about_img} = req.files;
        if(!about_img){throw 'About image is required!!'}
        const imagePngOrJpgRegex = /^image\/(png|jpg|jpeg)$/;
        if(!imagePngOrJpgRegex.test(about_img.mimetype)){throw 'Image must be jpg only'}
        const extension = about_img.mimetype.match(/(jpg|jpeg|png)$/i)[1];
        if(!extension){throw 'Image Must be jpg or jpeg only'}
        //Now Move Image To The upload File
        about_img.mv(`${__dirname}../../public/upload/about/about.${extension}`);
        const updatedSlide = await updateAbout(header,about,extension); 
        if(!updatedSlide){throw 'Could not update about '}
        res.render('dashboard.ejs',{page:"control",head:'Success',message:`About Updated Successfully`,storeInfo:await getStoreInfo()});
    }catch(err){
        console.log(err);
        res.render('dashboard.ejs',{page:"control",head:'Error',message: err,storeInfo:await getStoreInfo()});
    }
}


async function getMainSlides(){
    return await Main_slide.find({}).exec();
}

async function updateSlide(index,subhead,head,description,extension){
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return await Main_slide.findOneAndUpdate({index: index},{subhead:subhead,head:head,description:description,modifiedDate:Date.now(),mimetype:extension}, options).exec();
}
async function updateASlide(req,res){
    try{
        const {slide_number} = req.body;
        const {subheader} = req.body;
        const {header} = req.body;
        const {explain} = req.body;
        const index = Number(slide_number);
        if(!index || typeof index !== 'number'|| index < 1 || index > 3 || !subheader || !header || !explain){throw 'All info is required'}
        if(!req.files){throw 'Slide image is required!!'}
        const {slide} = req.files;
        if(!slide){throw 'Slide image is required!!'}
        const imagePngOrJpgRegex = /^image\/(png|jpg|jpeg)$/;
        if(!imagePngOrJpgRegex.test(slide.mimetype)){throw 'Image must be jpg only'}
        const extension = slide.mimetype.match(/(jpg|jpeg|png)$/i)[1];
        if(!extension){throw 'Image Must be jpg or jpeg only'}
        //Now Move Image To The upload File
        slide.mv(`${__dirname}../../public/upload/slide/slide${index}.${extension}`);
        const updatedSlide = await updateSlide(index,subheader,header,explain,extension); 
        if(!updatedSlide){throw 'Could not update slide '+index}
        res.render('dashboard.ejs',{page:"control",head:'Success',message:`Slide ${index} Updated Successfully`,storeInfo:await getStoreInfo()});
    }catch(err){
        console.log(err);
        res.render('dashboard.ejs',{page:"control",head:'Error',message: err,storeInfo:await getStoreInfo()});
    }
}
async function newSiteInfo(req,res){
    try{
        const {phone} = req.body;
        const {location} = req.body;
        const {name} = req.body;
        const {email} =  req.body;
        const updatedDoc = await updateStoreInfo(phone,location,name,email);
        if(updatedDoc.modifiedCount === 0){ throw 'Site Info Not Updated!!'}
        res.render('dashboard.ejs',{page:"control",head:'Success',message:'Site Info Updated Successfully',storeInfo:await getStoreInfo()});
    }catch(err){
        console.log(err);
        res.render('dashboard.ejs',{page:"control",head:'Error',message: err,storeInfo:await getStoreInfo()});
    }
}

async function uploadNewLogo(req,res){
    try{
        //Verify image is passed in the post request
        if(!req.files){ throw 'Logo image is required!!'}
        const {logo} = req.files;
        if(!logo){throw 'Logo image is required!!'}
        //Verify image mimetype only png or jpg
        const imagePngRegex = /^image\/(png)$/;
        if(!imagePngRegex.test(logo.mimetype)){throw 'Image must be png only'}
        //Now see the extention if it png or jpg
        const extension = 'png'
        //Now Move Image To The upload File
        logo.mv(`${__dirname}../../public/upload/logo/logo.${extension}`);
        //send successfully messege
        res.render('dashboard.ejs',{page:'control',head:'Success',message:'Logo image updated Successfully!!',storeInfo:await getStoreInfo()});
    }catch(err){
        console.log(err);
        res.render('dashboard.ejs',{page:'control',head:'Error',message:err,storeInfo:await getStoreInfo()});
    }
}


async function getCategorys(){
    const categorys = await Category.find({}).exec();
    return categorys;
}
async function deleteCategory(id){
    const document = await Category.findOneAndDelete({_id:id}).exec();
    return document;
}

async function deleteACategory(req,res){
    try{
        const {id} = req.body
        if(!id){throw 'The id is require!!!'}
        const deletedCategory = await deleteCategory({_id:id});
        if(!deletedCategory){throw 'No category with that id'}
        //Now lets delete category img
        await fs.rm(`${__dirname}../../public/upload/category/${deletedCategory.name}.${deletedCategory.mimetype}`);
        //get All Categorys
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:'main_category',head:'Success',message:'Category deleted Successfully!!',categorys:categorys,storeInfo:await getStoreInfo() });
    }catch(err){
        console.log(err);
        //get All Categorys
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:'main_category',head:'Error',message:err,categorys:categorys,storeInfo:await getStoreInfo() });
    }
}
async function createANewCategory(req,res){
    try{
        //Verify name and image is passed in the post request
        var {name} = req.body;
        if(!req.files){ throw 'Category image is required!!'}
        const {category_img} = req.files;
        if(!name || !category_img){throw 'Category image and name is required!!'}
        name = name.toLowerCase();
        //Verify name is only letters
        const onlyLettersRegex = /^[a-zA-Z]+$/;
        //if(!onlyLettersRegex.test(name)){throw 'Name must only be letters!!'}
        //Verify image mimetype only png or jpg
        const imagePngOrJpgRegex = /^image\/(png|jpg|jpeg)$/;
        if(!imagePngOrJpgRegex.test(category_img.mimetype)){throw 'Image must be png or jpg only'}
        //Now see the extention if it png or jpg
        const extension = category_img.mimetype.match(/(png|jpg|jpeg)$/i)[1];
        if(!extension){throw 'Image Must be png or jpg only'}
        //Now Move Image To The upload File
        category_img.mv(`${__dirname}../../public/upload/category/${name}.${extension}`);
        //Now Upload category name to database
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        await Category.findOneAndUpdate({name: name},{modifiedDate:Date.now(),mimetype:extension}, options).exec();
        //Now get All Categorys
        const categorys = await getCategorys();
        //send successfully messege
        res.render('dashboard.ejs',{page:'main_category',head:'Success',message:'Category Created Successfully!!',categorys:categorys,storeInfo:await getStoreInfo() });
    }catch(err){
        console.log(err);
        //get All Categorys
        const categorys = await getCategorys();
        res.render('dashboard.ejs',{page:'main_category',head:'Error',message:err,categorys:categorys,storeInfo:await getStoreInfo() });
    }
}

async function getOrders(limit){
    return await Order.find({}).limit(limit || 0).exec();
}

async  function getOrdersInLastWeek(){
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    return await Order.find({createdDate : {$gte : startOfWeek,$lte: new Date()}}).exec();
}

async function getCountSignsUpInLastWeek(){
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    return User.count({createdDate : {$gte : startOfWeek,$lte: new Date()}}).exec();
}

async function getCountOrderInLastWeek(){
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    return Order.count({createdDate : {$gte : startOfWeek,$lte: new Date()}}).exec();
}

async function getRevenueInLastWeek(){
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const OrdersInLastWeek = await Order.find({createdDate : {$gte : startOfWeek,$lte: new Date()}}).exec();
    var count = 0;
    OrdersInLastWeek.forEach((v)=>{
        count += v.total_cost;
    });
    return count;
}

async function getOrder(id){
    return await Order.findOne({_id: id}).exec();
}

async function updateOrderStatus(id,status){
    return await Order.findOneAndUpdate({_id:id},{status:status,updateDate: Date.now()}).exec();
}

async function getItemsForOrder(id){
    return await Sale.find({order_id:id}).exec();
}

export default  router;
export {getCategorys,deleteCategory,getMainSlides,getAboutInfo,Product}