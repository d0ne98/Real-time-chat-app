import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import bodyParser from 'body-parser';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

let username = "";

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



io.on("connection", (socket)=>{
    console.log(`${username} connected.`);
    socket.on("disconnect", ()=> {
        console.log(`${username} disconnected.`);
    })
    // send message
    socket.on("sendMessage", ({text, username}) => {
        const message = {text, username};
        io.emit("receiveMessage", message);
    })
})


server.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
} )