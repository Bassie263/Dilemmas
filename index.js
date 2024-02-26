const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = 3000
const clients = {};


app.use(express.static('public'))

http.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

io.on('connection', (socket) => {

    clients[socket.id] = { id: socket.id };
    console.log('Socket connected', socket.id);

    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
        delete clients[socket.id];
    }
    );

    //give the user a socket id
    socket.emit('socket-id', socket.id);
    

});



