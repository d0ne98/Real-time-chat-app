const socket = io();

//Send meassage
function sendMessage(){
    const text = document.getElementById("message_input").value;
    if(text){
        socket.emit("sendMessage",{text, username});
        document.getElementById("message_input").value = '';
    }
}

// recieve message
socket.on("receiveMessage",(message)=>{
    
    addMessage(`${message.username}: ${message.text}`);
})


// show messagess
function addMessage(text){
    const messageBox = document.getElementById("message_box");
    const messageDiv = document.createElement("div");
    messageDiv.textContent = text;
    messageBox.appendChild(messageDiv);
}