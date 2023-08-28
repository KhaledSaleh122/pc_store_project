
var cartItems;
if(Array.isArray(JSON.parse(getCookie('cartItems')))){
    cartItems = JSON.parse(getCookie('cartItems'));
}else{
    cartItems = [];
}

var wishlist;
if(Array.isArray(JSON.parse(getCookie('wishlist')))){
    wishlist = JSON.parse(getCookie('wishlist'));
}else{
    wishlist = [];
}

$(document).ready(() => {

    $.ajax({
        url: '/shop/data',
        method: 'POST',
        data: {
            page: 1, sort: getSortOption(), column_sort: getSortColName(),
            length: 12, category: getCategorys(), sPrice: getLowPrice(), ePrice: getMaxPrice(),
            query : getSearchQuery()
        },
        beforeSend : function(){
            $('#items .pro-gl-content').remove();
            $('#loading').addClass('show_loading');
            $('#items').addClass('blur_back');
        },
        success: function (res) {
            dataHandel(res);
        },
        complete: function(){
            $('#loading').removeClass('show_loading');
            $('#items').removeClass('blur_back');
        }
    })
})

function dataHandel(response,isfilter) {
    $('#result').remove();
    $('.pro-gl-content').remove();
    console.log("x");
    if (response && response.data && response.data.length > 0) {
        response.data.forEach((v) => {
            console.log(v);
            var outOfstock = '';
            if(v.quantity === 0){
                outOfstock = 
                `
                    <span class="percentage">out of stock</span>
                `
            }
            $('#items').append(
                `
                <div class="col-lg-3 col-md-6 col-sm-6 col-xs-6 mb-6 pro-gl-content">
                                <div class="ec-product-inner">
                                    <div class="ec-pro-image-outer">
                                        <div class="ec-pro-image">
                                            <a href="product-left-sidebar.html" class="image">
                                                <img class="main-image" src="upload/product/${v._id}.${v.mimetype}"     width="435px" height="250px"
                                                    alt="Product" />
                                                <img class="hover-image" src="upload/product/${v._id}.${v.mimetype}" width="435px" height="250px"
                                                    alt="Product" />
                                            </a>
                                            ${outOfstock}
                                            <style>
                                            .compare,.add-to-cart,.wishlist{
                                                color: #000 !important;
                                            }
                                            .compare:hover,.add-to-cart:hover,.wishlist:hover{
                                                color: #ff764b !important;
                                            }
                                            </style>
                                            <div class="ec-pro-actions" data-id='${v._id}' data-name='${v.name}' 
                                            data-mimetype='${v.mimetype}'  data-price='${v.price}' data-category='${v.category}' data-quantity="${v.quantity}">
                                                <a  class="ec-btn-group compare"
                                                data-link-action="quickview" title="Quick view"
                                                data-bs-toggle="modal"
                                                data-bs-target="#ec_quickview_modal" style=""><i class="fa-solid fa-eye" ></i></a>
                                                <a title="Add To Cart" class="ec-btn-group add-to-cart"><i class="fa-solid fa-cart-shopping" ></i></a>
                                                <a class="ec-btn-group wishlist" title="Wishlist"><i class="fa-regular fa-heart fs-5" ></i></a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="ec-pro-content">
                                    
                                        <h5 class="ec-pro-title"><a onclick="$($( $(this).parents('.ec-pro-content')).siblings()).find('.compare').trigger('click')"
                                        data-link-action="quickview" title="Quick view"
                                        data-bs-toggle="modal"
                                        data-bs-target="#ec_quickview_modal"
                                        >${v.name}</a></h5>
                                        <div class="ec-pro-option">
                                            <div>
                                                <span class="ec-price">
                                                    <span class="new-price">$${v.price}</span>
                                                </span>
                                            </div>
                                            <div>
                                            <span class="ec-price">
                                                <span class="category">${v.category}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                `
            )
        });


        setTimeout(()=>{
            $('.compare').click(function(e){
                const data = $(this).parent();
                if(data){
                    const id = getId(data);
                    const category = getCategory(data);
                    const name = getName(data);
                    const price = getPrice(data);
                    const mimetype = getMimeType(data);
                    const qunatity = getQuantity(data);
                    $('#quickview-addToCart').attr('data-id',id);
                    $('#quickview-addToCart').attr('data-price',price);
                    $('#quickview-addToCart').attr('data-mimetype',mimetype);
                    $('#quickview-addToCart').attr('data-name',name);
                    $('#quickview-addToCart').attr('data-category',category);
                    $('#quantity').text(qunatity);
                    $('#price').text('$'+price);
                    $('#name').text(name);
                    $('#quickview-img').attr('src',`./upload/product/${id}.${mimetype}`);
                    $('#addToCart-count').val(1);
                }
            });
        },500);

        $('#quickview-addToCart').click(function(e){
            const data = $(this);
            const id = getId(data);
            const category = getCategory(data);
            const name = getName(data);
            const price = getPrice(data);
            const mimetype = getMimeType(data);
            const count = Number($('#addToCart-count').val());
            if(count > 0){
                const item = {
                    id : id,
                    category:category,
                    name:name,
                    price:price,
                    mimetype:mimetype,
                    count:count,
                }
                const findElementIndex = isItemExist(cartItems,item)
                if(findElementIndex !== -1){
                    cartItems[findElementIndex].count = cartItems[findElementIndex].count + count;
                }else{
                    cartItems.push(item);
                }
                showToast('Success','You Added '+count+' of '+name+ ' To Cart');
                setCookie('cartItems', JSON.stringify(cartItems), 365); //store for 365 days
            }
            $('#quickview-close').trigger('click');
        })
        //To retrieve items from cart
        var items = JSON.parse(getCookie('cartItems'));
        $('.add-to-cart').click(function(e){
            const data = $(this).parent();
            if(data){
                const id = getId(data);
                const category = getCategory(data);
                const name = getName(data);
                const price = getPrice(data);
                const mimetype = getMimeType(data);
                const item = {
                    id : id,
                    category:category,
                    name:name,
                    price:price,
                    mimetype:mimetype,
                    count:1,
                }
                const findElementIndex = isItemExist(cartItems,item)
                if(findElementIndex !== -1){
                    cartItems[findElementIndex].count = cartItems[findElementIndex].count + 1;
                }else{
                    cartItems.push(item);
                }
                showToast('Success','You Added '+name+ ' To Cart');
                setCookie('cartItems', JSON.stringify(cartItems), 365); //store for 365 days
            }
            var items = JSON.parse(getCookie('cartItems'));
            console.log(items);
        });
        $('.ec-btn-group.wishlist').click(function(e){
            const data = $(this).parent();
            if(data){
                const id = getId(data);
                const category = getCategory(data);
                const name = getName(data);
                const price = getPrice(data);
                const mimetype = getMimeType(data);
                const item = {
                    id : id,
                    category:category,
                    name:name,
                    price:price,
                    mimetype:mimetype,
                }
                const findElementIndex = isItemExist(wishlist,item)
                if(findElementIndex === -1){
                    wishlist.push(item);
                }
                showToast('Success','You Added '+name+ ' To Wishlist');
                setCookie('wishlist', JSON.stringify(wishlist), 365); //store for 365 days
            }
            var items = JSON.parse(getCookie('wishlist'));
            console.log(items);
        });
        console.log(response.total_pages);
        if(isfilter){
            $('#pagination').remove();
            $('.shop-pro-content').append('<ul id="pagination" class="pagination-md mt-3 justify-content-xsm-center"></ul>');
        }
        $('#pagination').twbsPagination({
            totalPages: response.total_pages,
            visiblePages: 4,
            hideOnlyOnePage: true,
            initiateStartPageClick: false,
            onPageClick: function (event, page) {
                $.ajax({
                    url: '/shop/data',
                    method: 'POST',
                    data: {
                        page: page, sort: getSortOption(), column_sort: getSortColName(),
                        length: 12, category: getCategorys(), sPrice: getLowPrice(), ePrice: getMaxPrice(),
                        query : getSearchQuery()
                    },
                    beforeSend : function(){
                        $('#items .pro-gl-content').remove();
                        $('#loading').addClass('show_loading');
                        $('#items').addClass('blur_back');
                    },
                    success: function (res) {
                        dataHandel(res);
                        console.log('x123123123123');
                    },
                    complete: function(){
                        $('#loading').removeClass('show_loading');
                        $('#items').removeClass('blur_back');
                    }
                })
            }
        });
        $('#info span').remove();
        $('#info').append(`<span>Showing 1-${response.total_recoreds_with_filtering} of ${response.total_recoreds} item(s)</span>`)
    } else {
        $('#items').append('<h6 id="result" class="mt-3 mb-3">No data yet</h6>');
    }
}

$('#btn_filter').click((e) => {
    const maxPrice = getMaxPrice();
    const lowPrice = getLowPrice();
    const sort = getSortOption();
    const col = getSortColName();
    const categorys = getCategorys();
    if($('#pagination').children().length > 0){
        $('#pagination').twbsPagination('show', 1);
    }
    $.ajax({
        url: '/shop/data',
        method: 'POST',
        data: { page: 1, sort: sort || 'asc', column_sort: col || 'default', length: 12,
         category: categorys, sPrice: lowPrice, ePrice: maxPrice,query : getSearchQuery() },
         beforeSend : function(){
            $('#items .pro-gl-content').remove();
            $('#loading').addClass('show_loading');
            $('#items').addClass('blur_back');
        },
        success: function (res) {
            dataHandel(res,true);
        },
        complete: function(){
            $('#loading').removeClass('show_loading');
            $('#items').removeClass('blur_back');
        }
    })
})

function getQuantity(data) {
    return $(data).attr('data-quantity');
}
function isItemExist(items,item){
    return items.findIndex(element => element.id === item.id);
}

function getId(data){
    return $(data).attr('data-id');
}

function getPrice(data){
    return $(data).attr('data-price');
}

function getCategory(data){
    return $(data).attr('data-category');
}

function getName(data){
    return $(data).attr('data-name');
}

function getMimeType(data){
    return $(data).attr('data-mimetype');
}

function getSortColName() {
    return $("#ec-select option:selected").attr('data-col');
}

function getSortOption() {
    return $("#ec-select option:selected").val();
}

function getLowPrice() {
    return Number($('#lprice').val());
}

function getMaxPrice() {
    return Number($('#hprice').val());
}
function getCategorys() {
    const categorys = [];
    $('.ec-sidebar-block-item').each((i, v) => {
        const name = $(v).children('a').text();
        const isChecked = $(v).children('input:checked').length
        if (isChecked) {
            categorys.push(name);
        }
    });
    return categorys;
}

function getSearchQuery(){
    var query = '';
    var searchA = $('#searchA').val();
    var searchB = $('#searchB').val();
    if(searchB){
        query = searchB;
    }else if(searchA){
        query = searchA;
    }
    return query;
}





function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}







/*

                    <div class="ec-pro-pagination">
                        <span>Showing 1-12 of 21 item(s)</span>
                        <ul class="ec-pro-pagination-inner">
                            <li><a class="active" href="#">1</a></li>
                            <li><a href="#">2</a></li>
                            <li><a href="#">3</a></li>
                            <li><a href="#">4</a></li>
                            <li><a href="#">5</a></li>
                            <li><a class="next" href="#">Next <i class="ecicon eci-angle-right"></i></a></li>
                        </ul>
                    </div>

*/