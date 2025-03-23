import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import bodyParser from 'body-parser';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

let username = "";
let roomNumber;
let messages = [];
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

// Routes
app.get("/", (req, res) => {
    res.render("home.ejs");
})

app.post("/enter", (req,res)=>{
    username = req.body.username;
    res.render("chat.ejs", {username: username});
})


// Socket.io Events
io.on("connection", (socket)=>{
    socket.on("disconnect", ()=> {
    })
    // send message history
    socket.on("join",()=>{
        socket.emit("messageHistory", messages);
    })
    // send message
    socket.on("sendMessage", ({username, text}) => {

        const message = {username, text};
        messages.push(message);
        io.emit("receiveMessage", message);
    
          
    })
})


server.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
} )