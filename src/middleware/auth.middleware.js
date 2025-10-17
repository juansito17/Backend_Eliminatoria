const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Obtener el token del header
    const token = req.header('x-auth-token');

    // Verificar si no hay token
    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');

        // Adjuntar el usuario al objeto de solicitud
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};
