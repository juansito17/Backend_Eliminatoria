const Lote = require('../models/lote.model');

// Obtener todos los lotes
exports.getLotes = async (req, res) => {
  try {
    const lotes = await Lote.findAll();
    const lotesFormateados = lotes.map(l => ({
      id: l.id_lote,
      nombre: l.nombre_lote,
      area: l.area_hectareas,
      id_cultivo: l.id_cultivo,
      cultivo_nombre: l.cultivo_nombre,
      ubicacion_gps_poligono: l.ubicacion_gps_poligono,
      id_supervisor: l.id_supervisor || null,
      supervisor_nombre: l.supervisor_nombre || null,
      fecha_creacion: l.fecha_creacion
    }));
    res.json({ lotes: lotesFormateados });
  } catch (error) {
    console.error('Error al obtener lotes:', error);
    res.status(500).json({ message: 'Error al obtener lotes', error: error.message });
  }
};

// Obtener un lote por ID
exports.getLoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const lote = await Lote.findById(id);
    if (!lote) return res.status(404).json({ message: 'Lote no encontrado' });

    const loteForm = {
      id: lote.id_lote,
      nombre: lote.nombre_lote,
      area: lote.area_hectareas,
      id_cultivo: lote.id_cultivo,
      cultivo_nombre: lote.cultivo_nombre,
      ubicacion_gps_poligono: lote.ubicacion_gps_poligono,
      id_supervisor: lote.id_supervisor || null,
      supervisor_nombre: lote.supervisor_nombre || null,
      fecha_creacion: lote.fecha_creacion
    };
    res.json(loteForm);
  } catch (error) {
    console.error('Error al obtener lote por id:', error);
    res.status(500).json({ message: 'Error al obtener lote', error: error.message });
  }
};

 // Crear un nuevo lote (ahora con id_supervisor opcional)
 exports.createLote = async (req, res) => {
   const { nombre_lote, area_hectareas, id_cultivo, ubicacion_gps_poligono, id_supervisor } = req.body;
   try {
     const id = await Lote.create(
       nombre_lote,
       area_hectareas || null,
       id_cultivo || null,
       ubicacion_gps_poligono || null,
       id_supervisor || null
     );
     res.status(201).json({ message: 'Lote creado exitosamente', id });
   } catch (error) {
     console.error('Error al crear lote:', error);
     res.status(500).json({ message: 'Error al crear lote', error: error.message });
   }
 };

 // Actualizar un lote existente (incluye id_supervisor)
 exports.updateLote = async (req, res) => {
   const { id } = req.params;
   const { nombre_lote, area_hectareas, id_cultivo, ubicacion_gps_poligono, id_supervisor } = req.body;
   try {
    // Si se intenta actualizar el supervisor desde este endpoint, solo Admin (rol 1)
    if (typeof id_supervisor !== 'undefined' && req.user && req.user.rol !== 1) {
      return res.status(403).json({ message: 'Solo el Administrador puede asignar o cambiar supervisores de lotes' });
    }
     const affectedRows = await Lote.update(
       id,
       nombre_lote,
       area_hectareas || null,
       id_cultivo || null,
       ubicacion_gps_poligono || null,
       typeof id_supervisor !== 'undefined' ? id_supervisor : null
     );
     if (affectedRows === 0) {
       return res.status(404).json({ message: 'Lote no encontrado para actualizar' });
     }
     res.json({ message: 'Lote actualizado exitosamente' });
   } catch (error) {
     console.error('Error al actualizar lote:', error);
     res.status(500).json({ message: 'Error al actualizar lote', error: error.message });
   }
 };

 // Eliminar un lote
 exports.deleteLote = async (req, res) => {
   const { id } = req.params;
   try {
     const affectedRows = await Lote.delete(id);
     if (affectedRows === 0) {
       return res.status(404).json({ message: 'Lote no encontrado para eliminar' });
     }
     res.json({ message: 'Lote eliminado exitosamente' });
   } catch (error) {
     console.error('Error al eliminar lote:', error);
     res.status(500).json({ message: 'Error al eliminar lote', error: error.message });
   }
 };
 
 // Asignar o actualizar supervisor de un lote
 exports.assignSupervisor = async (req, res) => {
   const { id } = req.params;
   const { id_supervisor } = req.body;
   try {
     const affectedRows = await Lote.update(
       id,
       null,
       null,
       null,
       null,
       typeof id_supervisor !== 'undefined' ? id_supervisor : null
     );
     if (affectedRows === 0) {
       return res.status(404).json({ message: 'Lote no encontrado para asignar supervisor' });
     }
     res.json({ message: 'Supervisor asignado al lote correctamente' });
   } catch (error) {
     console.error('Error al asignar supervisor al lote:', error);
     res.status(500).json({ message: 'Error al asignar supervisor', error: error.message });
   }
 };
