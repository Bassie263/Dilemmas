const { count } = require('console');
const express = require('express');
const { start } = require('repl');
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = 100
const clients = {};
let clientCount = 0;
let startCount = 0;
let count1 = 0;
let count2 = 0;
let voteCount = 0;
let winner;

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


        if (startCount >= clientCount-1) {
            io.emit('start-dilemma', dilemmas);
            console.log('Game started');
            startCount = 0;
        }
    });

    socket.on('choice-made', (choice)=>{
        console.log('choice:', choice);

        dilemmas.forEach(dilemma => {
            if (dilemma[0] === choice) {
                count1++;
            } else if (dilemma[1] === choice) {
                count2++;
            }
        });
        //send the count to the client
        io.emit('vote-count', {count1, count2});

        console.log('count1:', count1);
        console.log('count2:', count2);

        voteCount = count1 + count2;
        console.log('voteCount:', voteCount);

        if (voteCount >= clientCount-1) {
            io.emit('results', {count1, count2});
            console.log('Results emitted');
            if (count1 > count2){
                winner = choice;
                console.log('winner:', winner);
            } else if (count2 > count1){
                winner = choice;
                console.log('winner:', winner);
            } else if (count1 === count2){
                winner = 'It is a tie';
            }
            io.emit('winner', winner);
            count1 = 0;
            count2 = 0;

            setTimeout(() => {
                dilemmas.pop();
                //if the array is empty, send a message to the client
                if (dilemmas.length === 0) {

                    io.emit('no-dilemmas', 'There are no dilemmas left');
                    console.log('No dilemmas left');
                }
                io.emit('restart', dilemmas);

            }, 3000);

        }

    })
});



