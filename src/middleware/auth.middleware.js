const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Obtener el token del header de autorización
    const authHeader = req.header('Authorization');

    // Verificar si no hay encabezado de autorización o no tiene el formato esperado
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

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
