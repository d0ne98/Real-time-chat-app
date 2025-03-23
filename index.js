import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import bodyParser from 'body-parser';
import env from "dotenv";
import pg from "pg";


const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;
env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

// Routes
app.get("/", (req, res) => {
    res.render("home.ejs");
})

app.post("/enter", async(req,res)=>{
    const username = req.body.username;
    try{
    const result = await db.query("SELECT * FROM users WHERE username= $1", [username]);
    if(result.rows.length > 0){
        res.render("chat.ejs", {username: username});
    } else{
      await db.query("INSERT INTO users (username) VALUES ($1)",[username])
      res.render("chat.ejs", {username: username});
    }
}catch(err){
    console.log(err);
}
})


// Socket.io Events
io.on("connection", (socket)=>{
    socket.on("disconnect", ()=> {
    })
    // send message history
    socket.on("join",async (username)=>{
        const messagesDb = await db.query("SELECT * FROM messages");
        const usernamesDb = await db.query("SELECT * FROM users");
        // For every message in database, find its username using user_id
        // and put all the messages with the username of the sender in messages array
        const messages = [];
        messagesDb.rows.forEach(msg =>{
           const username =  usernamesDb.rows.find(user => user.id === msg.user_id).username;
           const message = msg.message;
           messages.push({username, message});
        })
        socket.emit("messageHistory", messages);
        
    })
    // send message
    socket.on("sendMessage", async({username, text}) => {
        const user = await db.query("SELECT id FROM users WHERE username = $1",[username]);
        await db.query("INSERT INTO messages (message, user_id) VALUES ($1, $2)",[text, user.rows[0].id]);
        const message = {username, text};
        io.emit("receiveMessage", message);
          
    })
})

server.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
} )