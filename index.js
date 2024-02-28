const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = 100
const clients = {};
let clientCount = 0;

const dilemmas = [];


app.use(express.static('public'))

http.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

io.on('connection', (socket) => {
    clientCount++;
    // broadcast
    io.emit('client-count', clientCount); 

    clients[socket.id] = { id: socket.id };
    console.log('Socket connected', socket.id);
    

    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
        delete clients[socket.id];
        clientCount--;
        // broadcast
        io.emit('client-count', clientCount); 
        console.log('clientCount', clientCount);
    });

    //give the user a socket id
    socket.emit('socket-id', socket.id);

    //send the list of clients to the new client in an array that can be read by the client
    socket.emit('clients', Object.values(clients));
    Object.values(clients).forEach(client => {
        if (client.id !== socket.id) {
            socket.emit('new-client', client);
            console.log('new-client', client);
        }
    });
    console.log('clients', clients);
    console.log('clientCount', clientCount);

    socket.on('submit-dilemma', (data) => {
        const options =[]

        const { option1, option2 } = data;
        options.push(option1);
        options.push(option2);

        dilemmas.push(options);

        // count the number of dilemmas
        const dilemmaCount = dilemmas.length;
        socket.emit('dilemma-count', dilemmaCount);

        socket.emit('options-updated', dilemmas);
        console.log('options', dilemmas);
    });



    

});



