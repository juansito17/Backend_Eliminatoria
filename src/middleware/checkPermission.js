const pool = require('../config/database');

/**
 * Middleware de permisos por acción para labores agrícolas.
 *
 * Uso:
 *   const checkPermission = require('../middleware/checkPermission');
 *   router.post('/', auth, checkPermission('createLabor'), controller.createLaborAgricola);
 *   router.put('/:id', auth, checkPermission('updateLabor'), controller.updateLaborAgricola);
 *   router.get('/:id', auth, checkPermission('getLabor'), controller.getLaborAgricolaById);
 *   router.delete('/:id', auth, checkPermission('deleteLabor'), controller.deleteLaborAgricola);
 *
 * Reglas principales implementadas:
 * - Admin (rol 1): acceso total.
 * - Supervisor (rol 2): puede operar sobre labores de trabajadores asignados en supervisor_trabajador.
 * - Operario (rol 3): solo puede crear/editar/ver sus propias labores (según reglas). No puede eliminar.
 *
 * Nota: Las rutas de listado `GET /` deben seguir filtrando en el controlador según el rol:
 * - Operario: solo sus labores.
 * - Supervisor: labores de su equipo.
 * - Admin: todas.
 */

module.exports = (action) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !(req.user.id_usuario || req.user.id) || !req.user.rol) {
                return res.status(401).json({ message: 'No autenticado o información de usuario incompleta' });
            }

            // Aceptar tanto req.user.id_usuario (nombres usados en DB) como req.user.id (payload del JWT)
            const userId = req.user.id_usuario || req.user.id;
            const userRol = Number(req.user.rol);

            // Admin: acceso total
            if (userRol === 1) {
                return next();
            }

            // Helper: obtener id_trabajador asociado al usuario (si existe)
            const getTrabajadorIdByUsuario = async (usuarioId) => {
                const [rows] = await pool.query('SELECT id_trabajador FROM trabajadores WHERE id_usuario = ? AND activo = 1 LIMIT 1', [usuarioId]);
                return rows.length ? rows[0].id_trabajador : null;
            };

            // Helper: obtener info de una labor
            const getLaborById = async (idLabor) => {
                const [rows] = await pool.query('SELECT id_labor, id_trabajador, id_usuario_registro, hora_limite_edicion FROM labores_agricolas WHERE id_labor = ? LIMIT 1', [idLabor]);
                return rows.length ? rows[0] : null;
            };

            // Helper: verificar asignación supervisor -> trabajador
            const isTrabajadorAsignadoASupervisor = async (supervisorUsuarioId, idTrabajador) => {
                const [rows] = await pool.query('SELECT 1 FROM supervisor_trabajador WHERE id_supervisor = ? AND id_trabajador = ? AND activo = 1 LIMIT 1', [supervisorUsuarioId, idTrabajador]);
                return rows.length > 0;
            };

            // Reglas por acción
            switch (action) {
                case 'createLabor': {
                    // Admin ya manejado.
                    // Supervisor: puede crear para su equipo (id_trabajador en body debe pertenecer a su equipo).
                    // Operario: solo crear para sí mismo; requiere que exista trabajador vinculado al usuario.
                    const { id_trabajador } = req.body;

                    if (userRol === 3) { // Operario
                        const myTrabajadorId = await getTrabajadorIdByUsuario(userId);
                        if (!myTrabajadorId) {
                            return res.status(403).json({ message: 'Operario no vinculado a trabajador. Contacte al administrador.' });
                        }
                        if (!id_trabajador || Number(id_trabajador) !== Number(myTrabajadorId)) {
                            return res.status(403).json({ message: 'Operario solo puede crear labores para sí mismo.' });
                        }
                        return next();
                    }

                    if (userRol === 2) { // Supervisor
                        if (!id_trabajador) {
                            return res.status(400).json({ message: 'id_trabajador es requerido para crear una labor.' });
                        }
                        const permitido = await isTrabajadorAsignadoASupervisor(userId, id_trabajador);
                        if (!permitido) {
                            return res.status(403).json({ message: 'Supervisor solo puede crear labores para trabajadores a su cargo.' });
                        }
                        return next();
                    }

                    return res.status(403).json({ message: 'Acción no permitida' });
                }

                case 'updateLabor': {
                    // Admin ya manejado.
                    // Obtener labor
                    const laborId = req.params.id;
                    const labor = await getLaborById(laborId);
                    if (!labor) {
                        return res.status(404).json({ message: 'Labor no encontrada' });
                    }

                    const laborTrabajadorId = labor.id_trabajador;

                    if (userRol === 3) { // Operario
                        const myTrabajadorId = await getTrabajadorIdByUsuario(userId);
                        if (!myTrabajadorId) {
                            return res.status(403).json({ message: 'Operario no vinculado a trabajador. Contacte al administrador.' });
                        }
                        if (Number(laborTrabajadorId) !== Number(myTrabajadorId)) {
                            return res.status(403).json({ message: 'Operario solo puede modificar sus propias labores.' });
                        }
                        // Verificar ventana de edición
                        if (labor.hora_limite_edicion) {
                            const ahora = new Date();
                            const limite = new Date(labor.hora_limite_edicion);
                            if (ahora > limite) {
                                return res.status(403).json({ message: 'Periodo de edición expirado para esta labor.' });
                            }
                        } else {
                            // Si no existe hora_limite_edicion, bloquear edición por operario para seguridad (puede ajustarse)
                            return res.status(403).json({ message: 'Edición por operario no permitida en esta labor (sin ventana definida).' });
                        }
                        return next();
                    }

                    if (userRol === 2) { // Supervisor
                        const asignado = await isTrabajadorAsignadoASupervisor(userId, laborTrabajadorId);
                        if (!asignado) {
                            return res.status(403).json({ message: 'Supervisor no tiene permisos sobre la labor especificada.' });
                        }
                        return next(); // Supervisor puede corregir
                    }

                    return res.status(403).json({ message: 'Acción no permitida' });
                }

                case 'getLabor': {
                    // Admin ya manejado.
                    const laborId = req.params.id;
                    const labor = await getLaborById(laborId);
                    if (!labor) {
                        return res.status(404).json({ message: 'Labor no encontrada' });
                    }
                    const laborTrabajadorId = labor.id_trabajador;

                    if (userRol === 3) { // Operario
                        const myTrabajadorId = await getTrabajadorIdByUsuario(userId);
                        if (!myTrabajadorId) {
                            return res.status(403).json({ message: 'Operario no vinculado a trabajador.' });
                        }
                        if (Number(myTrabajadorId) !== Number(laborTrabajadorId)) {
                            return res.status(403).json({ message: 'Operario no puede ver labores de otros.' });
                        }
                        return next();
                    }

                    if (userRol === 2) { // Supervisor
                        const asignado = await isTrabajadorAsignadoASupervisor(userId, laborTrabajadorId);
                        if (!asignado) {
                            return res.status(403).json({ message: 'Supervisor no puede ver labores fuera de su equipo.' });
                        }
                        return next();
                    }

                    return res.status(403).json({ message: 'Acción no permitida' });
                }

                case 'deleteLabor': {
                    // Solo Admin (rol 1) puede eliminar. Los demás denegados explícitamente.
                    return res.status(403).json({ message: 'Eliminar labores está restringido a Administradores.' });
                }

                default:
                    return res.status(400).json({ message: 'Acción desconocida en checkPermission' });
            }
        } catch (error) {
            console.error('checkPermission error:', error);
            return res.status(500).json({ message: 'Error interno de autorización' });
        }
    };
};
