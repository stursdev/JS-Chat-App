const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const {addRoom, removeRoom, getAllRooms} = require('./utils/rooms')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket)=>{
    console.log('New Web-Socket connection')
    // Join a chat room room
    socket.on('join', ({ username, room }, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        // Validate the user or room
        if(error){
            return callback(error)
        }

        addRoom(user.room)

        socket.join(user.room)
        
        // Send a welcome message to a new  connection
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        
        // Broadcast that a new user has joined
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined the chat!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
             
        callback()
    })

    // Show rooms
    socket.on('roomsListQ', ()=>{
        socket.emit('roomsList', getAllRooms())
    })

    // Listen for Msgs from client
    socket.on('sendMsg', (message, callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity not allowed!')
        }

        // Send recieved msgs to all connections
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('Success.')
    })

    // Listen to sendLocation
    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat room!`))

            removeRoom(user.room)

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

})


server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

