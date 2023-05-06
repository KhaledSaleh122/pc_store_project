
$(document).ready(()=>{
    var cartItems;
    if(Array.isArray(JSON.parse(getCookie('cartItems')))){
        cartItems = JSON.parse(getCookie('cartItems'));
    }else{
        cartItems = [];
    }
    updateTotalAmount();
    $('.ec_cart_qtybtn').click(function(){
        //console.log($(this));
        valueChanged(this);
    })

    $(".cart-plus-minus").on("keyup", function() {
        //console.log("Input value changed!");
        valueChanged(this);
    });


function valueChanged(input){
    var parent = $(input).parent();
    if(parent){
        var input = $(parent).children('input');
        parent = $(parent).parent();
        if(parent){
            const parentOfParent = $(parent).parent();
            if(parentOfParent){
                const price = Number($(parentOfParent).attr('data-price'));
                const id = $(parentOfParent).attr('data-id');
                const index = getIndex(id);
                const targetSibling = $(parent).siblings('.ec-cart-pro-subtotal');
                if(price){
                    if(input){
                        const count = Number($(input).val());
                        if(count){
                            if(index >= 0){
                                updateCount(index,count);
                            }
                            $(targetSibling).text('$'+count * price);
                        }
                    }
                }
            }
        }
    }
}
function getIndex(id) {
    return cartItems.findIndex((element=> element.id === id));
}

function updateCount(index,newCount){
    cartItems[index].count = newCount;
    setCookie('cartItems',JSON.stringify(cartItems),365);
    updateTotalAmount();
}

$('.eci-trash-o').click(function(){
    var parent = $(this).parent();
    parent = $(parent).parent();
    parent = $(parent).parent();
    const id = $(parent).attr('data-id');
    const index = getIndex(id);
    if(index >=0){
        deletCookie(index,parent);
    }
});

function deletCookie(index,parent) {
    cartItems.splice(index, 1);
    $(parent).remove();
    console.log(cartItems);
    setCookie('cartItems',JSON.stringify(cartItems),365);
    updateTotalAmount();
}

function updateTotalAmount(){
    var totalAmount = 0;
    cartItems.forEach((v)=>{
        totalAmount += (v.price*v.count);
    });
    $('#total').text('$'+totalAmount);
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