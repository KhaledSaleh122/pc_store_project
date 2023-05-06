var toastQueue = [];

function showToast(type, message) {
  var container = document.getElementById("toast-container");
  var toast = document.createElement("div");
  if(!type || !message){
    type = document.getElementById("error_message_head").innerHTML;
    message = document.getElementById("error_message").innerHTML;
  }
  if(type && message){
    toast.className = "toast";
    toast.classList.add("toast-" + type);
    var heading = document.createElement("h2");
    heading.innerHTML = type;
    toast.appendChild(heading);
    var content = document.createElement("p");
    content.innerHTML = message;
    toast.appendChild(content);
    container.appendChild(toast);
    toastQueue.push(toast);
    if (toastQueue.length === 1) {
      showNextToast();
    }
  }
}

function showNextToast() {
  if (toastQueue.length > 0) {
    var toast = toastQueue[0];
    toast.style.display = "block";
    setTimeout(function(){
      toast.style.display = "none";
      toastQueue.shift();
      toast.parentNode.removeChild(toast);
      showNextToast();
    }, 3000);
  }
}
showToast();