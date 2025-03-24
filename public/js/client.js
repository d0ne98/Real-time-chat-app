const socket = io();

// join
 socket.emit("join", username);

// Load messages
socket.on("messageHistory", (messages)=>{
    messages.forEach(msg => {
        addMessage(`${msg.message}`, `${msg.username}`, `${msg.id}`);
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
    
    addMessage(`${message.text}`, `${message.username}`, `${message.id}`);
});


// show messagess
function addMessage(text, msgUsername , msgId){
    const messagesContainer = document.getElementById('messages');
    const sendButton = document.getElementById('send-button');

    const newMessage = document.createElement('div');
       newMessage.setAttribute("id",`${msgId}`);
       if(msgUsername === username){
         newMessage.className = 'message sent';
         newMessage.innerHTML = `
                <div class="message-options" onclick="toggleMenu(this)">
                   <i class="fas fa-ellipsis-v"></i>
                    <div class="options-menu">
                        <div class="option-item" onclick="deleteMessage(this)">
                            <i class="fas fa-trash danger"></i> Delete
                        </div>
                        <div class="option-item success" onclick="editMessage(this)">
                            <i class="fas fa-edit"></i> Edit
                        </div>
                    </div>
                </div>
                <div class="message-content">
                    <p>${text}</p>
                    <div class="message-meta">You</div>
                </div>
            `;
       }else{
        newMessage.className = 'message received';
            newMessage.innerHTML = `
            <div class="message-options" onclick="toggleMenu(this)">
                    <i class="fas fa-ellipsis-v"></i>
                    <div class="options-menu">
                        <div class="option-item" onclick="deleteMessage(this)">
                            <i class="fas fa-trash danger"></i> Delete
                        </div>
                    </div>
                </div>
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


// three-dot menu 

let activeMenu = null;

function toggleMenu(element) {
    const menu = element.querySelector('.options-menu');
    if (activeMenu && activeMenu !== menu) activeMenu.classList.remove('show'); //If there's an existing open menu (activeMenu exists) and it's not the same as the current menu, close it
    menu.classList.toggle('show');
    activeMenu = menu.classList.contains('show') ? menu : null;
}


function deleteMessage(element) {
    const message = element.closest('.message');
    message.remove();
    socket.emit("deleteMessage", message.id);
}


function editMessage(element) {
    const message = element.closest('.message');

    /*
    // Restrict editing to sent messages only
    if (!message.classList.contains('sent')) {
        alert('You can only edit your own messages!');
        return;
    }
        */
    const content = message.querySelector('.message-content p');
            const originalText = content.textContent;
            const id = message.id;
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'edit-input';
            editInput.value = originalText;
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.className = 'option-item success';
            saveButton.style.marginTop = '0.5rem';
            saveButton.onclick = () => {
                const newValue = editInput.value;
                // send edited message to server
                socket.emit("editMessage",{id , newValue})

                content.textContent = newValue;
                message.querySelector('.message-content').removeChild(editInput);
                message.querySelector('.message-content').removeChild(saveButton);
            };

            message.querySelector('.message-content').appendChild(editInput);
            message.querySelector('.message-content').appendChild(saveButton);
            editInput.focus();
        }

        // close menu if users click somewhere else
        document.addEventListener('click', (e) => {
            if (activeMenu && !activeMenu.contains(e.target) && !e.target.closest('.message-options')) {
                activeMenu.classList.remove('show');
                activeMenu = null;
            }
        });