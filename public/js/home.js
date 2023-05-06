$(document).ready(function(){
    console.log("x");
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
    setTimeout(()=>{
        $('.quickview').click(function(e){
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
    },1000);
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
});