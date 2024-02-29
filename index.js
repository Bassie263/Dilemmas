const express = require('express');
const { start } = require('repl');
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = 100
const clients = {};
let clientCount = 0;
let startCount = 0;

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

    //log the client count
    console.log(`Client count: ${clientCount}`);
    

    socket.on('disconnect', () => {
        delete clients[socket.id];
        clientCount--;
        // broadcast
        io.emit('client-count', clientCount); 
    });

    //give the user a socket id
    socket.emit('socket-id', socket.id);

    //send the list of clients to the new client in an array that can be read by the client
    socket.emit('clients', Object.values(clients));
    Object.values(clients).forEach(client => {
        if (client.id !== socket.id) {
            socket.emit('new-client', client);
        }
    });

    socket.on('submit-dilemma', (data) => {
        const options =[]

        const { option1, option2 } = data;
        options.push(option1);
        options.push(option2);

        dilemmas.push(options);

        // count the number of dilemmas
        const dilemmaCount = dilemmas.length;
        socket.emit('dilemma-count', dilemmaCount);


        io.emit('options-updated', dilemmas);
    });

    socket.on('start-dilemma', () => {

        startCount++;
        console.log(`Start button clicked ${startCount} times.`);

        //if start button is clicked as many times as there are clients, then start the game
        if (startCount === clientCount-1) {
            io.emit('start-dilemma', dilemmas);
            console.log('Game started');
            startCount = 0;
        }
    });



    

});



