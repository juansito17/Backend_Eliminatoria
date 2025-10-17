require('dotenv').config(); // Cargar variables de entorno
const app = require('./app');
const pool = require('./config/database'); // Se usará más adelante para verificar la conexión

const PORT = process.env.PORT || 3000;

// Verificar conexión a la base de datos (opcional, para depuración)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conexión a la base de datos exitosa!');
    connection.release(); // Liberar la conexión
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
