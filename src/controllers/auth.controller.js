const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

// Endpoint para el login de usuarios
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar el usuario por email
        const user = await authModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // 2. Comparar la contraseña ingresada con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // 3. Generar un JWT
        const payload = {
            user: {
                id: user.id_usuario,
                rol: user.id_rol,
                email: user.email
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey', // Usar una variable de entorno para la clave secreta
            { expiresIn: '1h' }, // Token expira en 1 hora
            (err, token) => {
                if (err) throw err;
                res.json({ token, message: 'Inicio de sesión exitoso' });
            }
        );

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};
