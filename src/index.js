require('dotenv').config(); // Cargar variables de entorno
const http = require('http'); // Importar módulo http
const app = require('./app');
const pool = require('./config/database'); // Se usará más adelante para verificar la conexión
const socket = require('./socket'); // Importar el módulo de socket

const PORT = process.env.PORT || 3000;

// Crear servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.io
const io = socket.init(server);

// Verificar conexión a la base de datos
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        // No detener la aplicación si la DB no está disponible, pero loguear el error
        // En producción, podrías querer manejar esto de forma más robusta
    } else {
        console.log('Conexión a la base de datos exitosa!');
        connection.release(); // Liberar la conexión
    }
});

server.listen(PORT, () => {
    console.log(`Servidor HTTP y WebSocket corriendo en el puerto ${PORT}`);
});
