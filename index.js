import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import bodyParser from 'body-parser';
import env from "dotenv";
import pg from "pg";
import  bcrypt from "bcrypt";
import passport from 'passport';
import { Strategy } from 'passport-local';
import session from 'express-session';


const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;
const saltRounds = 10;
env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();

// middlewares
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 1000 * 60 * 60 * 6  // 6 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.get("/", (req, res) => {
    res.render("home.ejs");
})

app.get("/register",(req,res)=>{
    res.render("register.ejs");
})

app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.get("/chat",(req,res)=>{
    if(req.isAuthenticated()){
        const username = req.user.username;
        res.render("chat.ejs",{username});
    }else{
        res.redirect("/login");
    }
})

app.post("/login",passport.authenticate("local",{
    successRedirect:"/chat",
    failureRedirect:"/login"
}));


app.post("/register",async (req,res)=>{
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    try {
        const user = await db.query("SELECT * FROM users WHERE username = $1",[enteredUsername]);
        if(user.rows.length > 0){  // username already exists
            res.render("login.ejs",{msg:"Username already exists. Login."});
        }else{ // new username
            bcrypt.hash(enteredPassword,saltRounds, async(err,hash)=>{
                if(err){
                    console.log("Error hashing.", err)
                }else{
                    const result = await db.query(
                        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
                        [enteredUsername, hash]);
                
                const user = result.rows[0];
                req.login(user,(err)=>{
                 if(err) {
                    console.log(err)
                } else{
                    res.redirect("/chat");
                }
                })
                }
            })
        } 
    } catch (err) {
        console.log(err);
    }
});

passport.use("local",
    new Strategy(async function verify(username, password, cb) {
        try {
            const user = await db.query("SELECT * FROM users WHERE username = $1",[username]);
            if(user.rows.length > 0){
                bcrypt.compare(password, user.rows[0].password, (err, result)=>{
                    if(err){
                        // error with password check
                        console.log("Error comparing,", err);
                        return cb(err)
                    }else{
                        if(result){
                            //Passed password check
                            return cb(null, user.rows[0]);
                        }else{
                            //Did not pass password check
                            return cb(null, false);
                    } }
                })
               }else{
                return cb(null, false);
               }
        } catch (err) {
            console.log(err);
        }
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });

/* used passport instead
app.post("/login", async (req, res)=>{
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    try {
        const user = await db.query("SELECT * FROM users WHERE username = $1",[enteredUsername]);
        if(user.rows.length > 0){
            bcrypt.compare(enteredPassword, user.rows[0].password, (err, result)=>{
                if(err){
                    console.log("Error comparing,", err);
                }else{
                    if(result){
                        res.render("chat.ejs",{username:enteredUsername});
                    }else{
                        res.render("login.ejs", {msg:"Incorrect Password"})
                } }
            })
           }else{
            res.render("register.ejs",{msg:"Username doesn't exists. Register."});
           }
    } catch (err) {
        console.log(err);
    }
})

*/

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
           const id = msg.id;
           messages.push({username, message, id});
        })
        socket.emit("messageHistory", messages);
        
    })
    // send message
    socket.on("sendMessage", async({username, text}) => {
        const user = await db.query("SELECT id FROM users WHERE username = $1",[username]);
        const newMessage = await db.query("INSERT INTO messages (message, user_id) VALUES ($1, $2) RETURNING *",[text, user.rows[0].id]);
        const id = newMessage.rows[0].id;
        const message = {username, text, id};
        io.emit("receiveMessage", message);
          
    })

    //delete message
    socket.on("deleteMessage", async(messageId)=>{
        try {
            await db.query("DELETE FROM messages WHERE id= $1",[messageId]);
        } catch (err) {
            console.log(err);
        }
    })

    // edit message
    socket.on("editMessage", async (msg)=>{
        try {
            await db.query("UPDATE messages SET message = $1 WHERE id=$2",[msg.newValue, msg.id]);
        } catch (err) {
            console.log(err);
        }
        
    })
})

server.listen(port,'0.0.0.0', () =>{
    console.log(`Server is running on port ${port}`);
} )