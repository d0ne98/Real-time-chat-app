import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render("./chat.ejs");
})

io.on("connection", (socket)=>{
    console.log("A user connected.");
    socket.on("disconnect", ()=> {
        console.log('user disconnected');
    })
    // send message
    socket.on("sendMessage", ({text}) => {
        
        io.emit("receiveMessage", text);
    })
})


server.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
} )