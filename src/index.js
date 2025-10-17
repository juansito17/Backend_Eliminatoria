require('dotenv').config(); // Cargar variables de entorno
const http = require('http'); // Importar mรณdulo http
const app = require('./app');
const pool = require('./config/database'); // Se usarรก mรกs adelante para verificar la conexiรณn
const socket = require('./socket'); // Importar el mรณdulo de socket
const alertasController = require('./controllers/alertas.controller'); // Importar el controlador de alertas

const PORT = process.env.PORT || 3000;

// Crear servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.io
const io = socket.init(server);

// Verificar conexiรณn a la base de datos
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        // No detener la aplicaciรณn si la DB no estรก disponible, pero loguear el error
        // En producciรณn, podrรญas querer manejar esto de forma mรกs robusta
    } else {
        console.log('Conexiรณn a la base de datos exitosa!');
        connection.release(); // Liberar la conexiรณn
    }
});

server.listen(PORT, () => {
    console.log(`Servidor HTTP y WebSocket corriendo en el puerto ${PORT}`);

    // Programar la verificación de alertas cada 5 minutos (300000 ms)
    setInterval(alertasController.checkAndGenerateAlerts, 300000);
    console.log('Verificación de alertas programada para ejecutarse cada 5 minutos.');
});
