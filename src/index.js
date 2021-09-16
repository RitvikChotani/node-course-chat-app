//Required Libraries
const express = require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const Filter = require('bad-words');
const {generate, generateLocation} = require('../src/utils/messages')

//App variables
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '../public')
const io = socket(server)

const {
    addUsers,
    removeUsers,
    getUser,
    getUsersInRoom
} = require('./utils/user')


app.use(express.static(publicPath))

io.on("connection", (socket) => {

    socket.on("SendMessage", (message, callback) => {
        const user = getUser(socket.id)
        const filters = new Filter()

        if(filters.isProfane(message)) {
            return callback("Profanity is not allowed")
        }
        io.to(user.room).emit("Message", generate(user.username, message))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUsers(socket.id)
        if(user) {
            io.to(user.room).emit("Message", generate("Admin", `${user.username} has disconnected`))
            io.to(user.room).emit("room-data", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on("geolocation", (geolocation,callback) => {
        callback()
        const user = getUser(socket.id)
        
        io.to(user.room).emit("locationMessage", generateLocation(user.username, `https://www.google.com/maps?q=${geolocation.lat},${geolocation.long}`))
    })

    socket.on("join", ({username, room}, callback) => {
        const {error, user} = addUsers({id: socket.id, username, room})
        if(error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("Message", generate("Admin", "Welcome!"))
        socket.broadcast.to(user.room).emit("Message", generate("Admin" ,`${user.username} has joined`))

        io.to(user.room).emit("room-data", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
})

server.listen(port, () => {
    console.log("Listening on port " + port)
})