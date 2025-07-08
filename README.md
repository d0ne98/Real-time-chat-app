# Real-time Chat App

A real-time chat application built with Node.js, Express, and Socket.io. Users can register, log in, and chat with others instantly in a modern web interface.

## Features
- User registration and login
- Real-time messaging with Socket.io
- Responsive UI with EJS templates and CSS
- Simple and clean project structure

## Technologies Used
- Node.js
- Express.js
- Socket.io
- EJS (Embedded JavaScript templates)
- CSS

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Real-time-chat-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   node index.js
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure
```
Real-time chat app/
├── index.js                # Main server file
├── package.json            # Project metadata and dependencies
├── public/
│   ├── js/
│   │   └── client.js       # Client-side JavaScript for chat
│   └── styles/
│       └── main.css        # Main stylesheet
├── queries.sql             # SQL queries (if using a database)
├── views/
│   ├── chat.ejs            # Chat room template
│   ├── home.ejs            # Home page template
│   ├── login.ejs           # Login page template
│   ├── register.ejs        # Registration page template
│   └── partials/
│       └── header.ejs      # Shared header partial
```

## Usage
- Register a new account or log in with existing credentials.
- Enter the chat room and start messaging in real time.

## License
This project is for educational purposes. 
