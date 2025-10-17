const pool = require('../config/database');

exports.findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT id_usuario, id_rol, nombre_usuario, email, password_hash, activo FROM usuarios WHERE email = ?', [email]);
    return rows[0];
};

exports.createUser = async (username, email, passwordHash, nombre, apellido) => {
    const [result] = await pool.query(
        'INSERT INTO usuarios (nombre_usuario, email, password_hash, id_rol, nombre, apellido, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, passwordHash, 2, nombre, apellido, 1] // id_rol 2 para usuario regular, activo 1
    );
    return result.insertId;
};
