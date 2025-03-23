const socket = io();

// join
 socket.emit("join", username);

// Load messages
socket.on("messageHistory", (messages)=>{
    messages.forEach(msg => {
        addMessage(`${msg.message}`, `${msg.username}`);
    });
    
});

//Send meassage
function sendMessage(){
    const text = document.getElementById("message-input").value;
    if(text){
        socket.emit("sendMessage",{username, text});
        document.getElementById("message-input").value = '';
        
    }
}

// recieve message
socket.on("receiveMessage",(message)=>{
    
    addMessage(`${message.text}`, `${message.username}`);
});


// show messagess
function addMessage(text, msgUsername){
    const messagesContainer = document.getElementById('messages');
    const sendButton = document.getElementById('send-button');

    const newMessage = document.createElement('div');
       if(msgUsername === username){
         newMessage.className = 'message sent';
         newMessage.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                    <div class="message-meta">You</div>
                </div>
            `;
       }else{
        newMessage.className = 'message received';
            newMessage.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                    <div class="message-meta">${msgUsername}</div>
                </div>
            `;
       }
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.getElementById("message-input").addEventListener("keypress",(e)=>{
    if(e.key === "Enter") sendMessage();
})