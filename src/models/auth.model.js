const pool = require('../config/database');

exports.findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT id_usuario, id_rol, nombre_usuario, email, password_hash, activo FROM usuarios WHERE email = ?', [email]);
    return rows[0];
};
