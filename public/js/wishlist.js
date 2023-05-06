$(document).ready(function(){
    var wishlist;
    if(Array.isArray(JSON.parse(getCookie('wishlist')))){
        wishlist = JSON.parse(getCookie('wishlist'));
    }else{
        wishlist = [];
    }

    $('.ec-com-remove.ec-remove-wish').click(function(){
        const id = $(this).attr('data-id');
        const index = getIndex(id);
        if(index >= 0){
            deletCookie(index);
        }
    });

    function getIndex(id) {
        return wishlist.findIndex((element=> element.id === id));
    }

    function deletCookie(index) {
        wishlist.splice(index, 1);
        setCookie('wishlist',JSON.stringify(wishlist),365);
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