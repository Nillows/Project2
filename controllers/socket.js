module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on(`join room`, (roomId, lastConvo) => {
            if (lastConvo) {
                socket.leave(lastConvo);
                console.log(`socket left room ${roomId}`)
                console.log(lastConvo);
            }
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
            socket.emit(`join room`, roomId);
        })

        socket.on(`disconnect`, () => {
            console.log(`user disconnect`);
        })

        socket.on(`chat message`, (msg, roomId, socketSessionId, currentDayFormatted, senderUser) => {
            console.log(`received message in room ${roomId}: ${msg}`)
            io.to(roomId).emit(`chat message`, msg, socketSessionId, currentDayFormatted, senderUser);
        })

        
    });
};