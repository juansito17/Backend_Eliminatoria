module.exports = (rolesPermitidos) => (req, res, next) => {
    // req.user.rol contiene el id_rol del usuario autenticado
    // rolesPermitidos es un array de roles (ej. [1, 2] para Administrador y Supervisor)

    if (!req.user || !req.user.rol) {
        return res.status(401).json({ message: 'No autenticado o rol no disponible' });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
        return res.status(403).json({ message: 'Acceso denegado: No tiene los permisos necesarios' });
    }

    next();
};
