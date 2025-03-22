import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

app.get("/", (req, res) => {
    res.render("index.ejs");
})




server.listen(port, () =>{
    console.og(`Server is running on port ${port}`);
} )