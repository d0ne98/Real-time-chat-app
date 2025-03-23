const socket = io();

// join
 socket.emit("join",username);

// Load messages
socket.on("messageHistory", (messages)=>{
    messages.forEach(msg => {
        addMessage(`${msg.username}: ${msg.text}`) 
    });
    
});

//Send meassage
function sendMessage(){
    const text = document.getElementById("message_input").value;
    if(text){
        socket.emit("sendMessage",{username, text});
        document.getElementById("message_input").value = '';
    }
}

// recieve message
socket.on("receiveMessage",(message)=>{
    
    addMessage(`${message.username}: ${message.text}`);
});


// show messagess
function addMessage(text){
    const messageBox = document.getElementById("message_box");
    const messageDiv = document.createElement("div");
    messageDiv.textContent = text;
    messageBox.appendChild(messageDiv);
}