const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateURL } = require('./utils/messages')
const {  addUser, removeUser,
    getUser,
    getUsersInRoom } = require('./utils/users')
// Create the Express application
const app = express()
// Create the HTTP server using the Express app
const server = http.createServer(app)
// Connect socket.io to the HTTP server
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))
// Listen for new connections to Socket.io
let count = 0
io.on('connection', (socket) => {
 console.log('New WebSocket connection')

 socket.on('join', (options, callback) => {
    // Validate/track user
    const { error, user } = addUser({ id: socket.id, ...options })
    // If error, send message back to client
    if (error) {
    return callback(error)
    }
    
   // Else, join the room
 socket.join(user.room)
 socket.emit('message', generateMessage('admin',' Welcome!'))
 socket.broadcast.to(user.room).emit('message',
generateMessage('Admin',`${user.username} has joined!`))
// After a user joins or leaves
io.to(user.room).emit('roomData', {
    room: user.room,
    users: getUsersInRoom(user.room)
   })
// callback()
   })

//  socket.emit('message', {
//      text : "Welcome",
//      createdAt : new Date().getTime()
//     })
//  socket.broadcast.emit('message', generateMessage('New user has joined')) // will not see to the joined user, all others will see
 
 socket.on('sendMessage', (message,callback) => {
    const user = getUser(socket.id)
     //check for profanity
     const filter = new Filter()
     if(filter.isProfane(message)){
         return callback('profanity is not allowed')
     }
     io.to(user.room).emit('message', generateMessage(user.username, message))
     callback()
 })

 socket.on('sendLocation', (coords, callback) => {
    // Get the username and room for the user
    const user = getUser(socket.id)
    // Emit the message to just that room
    io.to(user.room).emit('locationMessage',generateURL(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    // Send an acknowledgement to the client
    callback()
   })


// remove user
 socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
    io.to(user.room).emit('message', generateMessage('Admin',`${user.username}
   has left!`))
   io.to(user.room).emit('roomData', {
    room: user.room,
    users: getUsersInRoom(user.room)
   })
    }
})




//  socket.on('increment', () => {
//     count++
//     //socket.emit('countUpdated', count)
//     io.emit('countUpdated', count) // to update change in every browser
//     })
})
server.listen(port, () => {
 console.log(`Server is up on port ${port}!`)
})