// Este módulo contendrá la lógica principal de Socket.io
let io;

exports.init = (httpServer) => {
    io = require('socket.io')(httpServer, {
        cors: {
            origin: "*", // Permitir todas las conexiones CORS para desarrollo
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado:', socket.id);

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });

        // Puedes añadir más lógica aquí para manejar eventos específicos
        // Por ejemplo, unirse a salas, enviar mensajes, etc.
        // socket.on('joinRoom', (room) => {
        //     socket.join(room);
        //     console.log(`Cliente ${socket.id} se unió a la sala ${room}`);
        // });
    });

    return io;
};

exports.getIo = () => {
    if (!io) {
        throw new Error('Socket.io no inicializado!');
    }
    return io;
};
