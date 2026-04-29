const fs = require("fs");
const path = require("path");
const { Document, User, DocumentHistory, DocumentRecipient, DocumentAttachment, DocumentStatus, DocumentType, MovementType, DocumentPriority } = require("../models");
const { Op } = require("sequelize");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Helper para mapear el documento al formato antiguo que espera el frontend
// Esto evita que el frontend se rompa tras cambiar a UUIDs y tablas relacionadas.
const mapDocumentToFrontendFormat = (doc) => {
    return {
        id: doc.id_documento, // El frontend espera 'id'
        codigo: doc.codigo,
        tipoMovimiento: doc.tipoMovimiento ? doc.tipoMovimiento.nombre : 'enviado',
        clasificacion: doc.clasificacion,
        estado: doc.estado ? doc.estado.nombre : 'pendiente',
        fechaRegistro: doc.fecha_registro,
        fechaEnvio: doc.fecha_envio,
        fecha_vencimiento: doc.fecha_vencimiento,
        remitente: doc.remitente,
        destinatario: doc.destinatario,
        cargo: doc.cargo,
        quienRecibe: doc.quien_recibe,
        detalle: doc.detalle,
        observaciones: doc.observaciones,
        userId: doc.created_by, // El frontend compara userId === user.id
        archivo: (doc.adjuntos && doc.adjuntos.length > 0) ? doc.adjuntos[0].nombre_archivo : null
    };
};

const getAllDocuments = async (req, res) => {
    try {
        let whereClause = {};

        // Si no es admin, solo ve sus documentos (creados por él o asignados a él como destinatario)
        if (req.user.rol !== "admin") {
            const documentosRecibidos = await DocumentRecipient.findAll({
                where: { id_usuario: req.user.id },
                attributes: ['id_documento']
            });
            const docsRecibidosIds = documentosRecibidos.map(dr => dr.id_documento);

            whereClause = {
                [Op.or]: [
                    { created_by: req.user.id },
                    { id_documento: { [Op.in]: docsRecibidosIds } },
                    { destinatario: req.user.nombre },
                    { destinatario: req.user.username }
                ]
            };
        }

        const documentos = await Document.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'creador', attributes: ['id_usuario', 'username', 'nombre', 'cargo'] },
                { model: DocumentStatus, as: 'estado', attributes: ['id_estado_documento', 'nombre', 'color'] },
                { model: DocumentType, as: 'tipoDocumento', attributes: ['id_tipo_documento', 'nombre'] },
                { model: MovementType, as: 'tipoMovimiento', attributes: ['id_tipo_movimiento', 'nombre'] },
                { model: DocumentPriority, as: 'prioridad', attributes: ['id_prioridad', 'nombre', 'orden'] },
                { model: DocumentRecipient, as: 'destinatarios', include: [{ model: User, as: 'usuario', attributes: ['id_usuario', 'username', 'nombre'] }] },
                { model: DocumentAttachment, as: 'adjuntos' }
            ],
            order: [['created_at', 'DESC']]
        });

        // Mapear al formato frontend
        const documentosMapeados = documentos.map(mapDocumentToFrontendFormat);

        return res.json(documentosMapeados);
    } catch (error) {
        console.error("Error al obtener documentos:", error);
        return res.status(500).json({ mensaje: "Error al obtener documentos" });
    }
};

const createDocument = async (req, res) => {
    try {
        const body = req.body || {};
        console.log("req.body is:", req.body);
        
        let id_estado_documento = body.id_estado_documento;
        if (!id_estado_documento && body.estado) {
             const estado = await DocumentStatus.findOne({ where: { nombre: body.estado } });
             if (estado) id_estado_documento = estado.id_estado_documento;
        }

        let id_tipo_movimiento = body.id_tipo_movimiento;
        if (!id_tipo_movimiento && body.tipoMovimiento) {
             const tipo = await MovementType.findOne({ where: { nombre: body.tipoMovimiento } });
             if (tipo) id_tipo_movimiento = tipo.id_tipo_movimiento;
        }

        const nuevoDocumentoData = {
            codigo: body.codigo,
            id_tipo_movimiento: id_tipo_movimiento,
            id_tipo_documento: body.id_tipo_documento,
            id_estado_documento: id_estado_documento,
            id_prioridad: body.id_prioridad,
            clasificacion: body.clasificacion || 'interno',
            fecha_registro: body.fechaRegistro || body.fecha_registro || new Date(),
            fecha_envio: body.fechaEnvio || body.fecha_envio,
            fecha_vencimiento: body.fecha_vencimiento,
            remitente: body.remitente,
            destinatario: body.destinatario,
            cargo: body.cargo,
            quien_recibe: body.quienRecibe || body.quien_recibe,
            detalle: body.detalle,
            observaciones: body.observaciones,
            created_by: req.user.id
        };

        const doc = await Document.create(nuevoDocumentoData);

        let destinatarioId = req.body.destinatarioId || req.body.id_usuario_destinatario;
        if (!destinatarioId && req.body.destinatario) {
            const destUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: req.body.destinatario },
                        { nombre: req.body.destinatario }
                    ]
                }
            });
            if (destUser) {
                destinatarioId = destUser.id_usuario;
            }
        }

        if (destinatarioId) {
            await DocumentRecipient.create({
                id_documento: doc.id_documento,
                id_usuario: destinatarioId,
                es_principal: true
            });
        }

        if (req.file) {
            await DocumentAttachment.create({
                id_documento: doc.id_documento,
                nombre_archivo: req.file.filename,
                archivo_path: req.file.path,
                archivo_original: req.file.originalname,
                archivo_tamano: req.file.size,
                archivo_tipo: req.file.mimetype
            });
        }

        await DocumentHistory.create({
            id_documento: doc.id_documento,
            id_usuario: req.user.id,
            accion: 'creado',
            descripcion: `Documento creado con código ${doc.codigo}`,
            valores_nuevos: doc.toJSON()
        });

        const docCreado = await Document.findByPk(doc.id_documento, {
            include: [
                { model: User, as: 'creador', attributes: ['id_usuario', 'username', 'nombre'] },
                { model: DocumentStatus, as: 'estado' },
                { model: MovementType, as: 'tipoMovimiento' },
                { model: DocumentAttachment, as: 'adjuntos' }
            ]
        });

        return res.status(201).json({
            mensaje: "Documento registrado exitosamente",
            documento: mapDocumentToFrontendFormat(docCreado),
        });
    } catch (error) {
        console.error("Error al registrar:", error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errores = error.errors.map(e => e.message);
            return res.status(400).json({ mensaje: errores.join(', ') });
        }
        return res.status(500).json({ mensaje: "Error interno", detalle: error.stack });
    }
};

const updateDocument = async (req, res) => {
    try {
        const docId = req.params.id;
        const doc = await Document.findByPk(docId);

        if (!doc) {
            return res.status(404).json({ mensaje: "Documento no encontrado" });
        }

        const esAdmin = req.user.rol === "admin";
        const esDueno = doc.created_by === req.user.id;

        if (!esAdmin && !esDueno) {
            if (req.file) {
                try { fs.unlinkSync(req.file.path); } catch { }
            }
            return res.status(403).json({ mensaje: "No tienes permiso para editar este documento" });
        }

        console.log("req.body is:", req.body);
        let id_estado_documento = req.body?.id_estado_documento;
        if (!id_estado_documento && req.body?.estado) {
             const estado = await DocumentStatus.findOne({ where: { nombre: req.body.estado } });
             if (estado) id_estado_documento = estado.id_estado_documento;
        }

        let id_tipo_movimiento = req.body.id_tipo_movimiento;
        if (!id_tipo_movimiento && req.body.tipoMovimiento) {
             const tipo = await MovementType.findOne({ where: { nombre: req.body.tipoMovimiento } });
             if (tipo) id_tipo_movimiento = tipo.id_tipo_movimiento;
        }

        const updateData = {
            codigo: req.body.codigo !== undefined ? req.body.codigo : doc.codigo,
            id_tipo_movimiento: id_tipo_movimiento !== undefined ? id_tipo_movimiento : doc.id_tipo_movimiento,
            id_tipo_documento: req.body.id_tipo_documento !== undefined ? req.body.id_tipo_documento : doc.id_tipo_documento,
            id_estado_documento: id_estado_documento !== undefined ? id_estado_documento : doc.id_estado_documento,
            id_prioridad: req.body.id_prioridad !== undefined ? req.body.id_prioridad : doc.id_prioridad,
            clasificacion: req.body.clasificacion !== undefined ? req.body.clasificacion : doc.clasificacion,
            fecha_registro: req.body.fechaRegistro || req.body.fecha_registro || doc.fecha_registro,
            fecha_envio: req.body.fechaEnvio || req.body.fecha_envio || doc.fecha_envio,
            fecha_vencimiento: req.body.fecha_vencimiento !== undefined ? req.body.fecha_vencimiento : doc.fecha_vencimiento,
            remitente: req.body.remitente !== undefined ? req.body.remitente : doc.remitente,
            destinatario: req.body.destinatario !== undefined ? req.body.destinatario : doc.destinatario,
            cargo: req.body.cargo !== undefined ? req.body.cargo : doc.cargo,
            quien_recibe: req.body.quienRecibe || req.body.quien_recibe || doc.quien_recibe,
            detalle: req.body.detalle !== undefined ? req.body.detalle : doc.detalle,
            observaciones: req.body.observaciones !== undefined ? req.body.observaciones : doc.observaciones,
        };

        const valoresAnteriores = doc.toJSON();
        await doc.update(updateData);

        if (req.file) {
            const oldAttachments = await DocumentAttachment.findAll({ where: { id_documento: docId } });
            for (const att of oldAttachments) {
                if (fs.existsSync(att.archivo_path)) {
                    try { fs.unlinkSync(att.archivo_path); } catch (e) { console.log(e); }
                }
                await att.destroy();
            }

            await DocumentAttachment.create({
                id_documento: doc.id_documento,
                nombre_archivo: req.file.filename,
                archivo_path: req.file.path,
                archivo_original: req.file.originalname,
                archivo_tamano: req.file.size,
                archivo_tipo: req.file.mimetype
            });
        }

        const camposCambiados = Object.keys(req.body);
        if (req.file) camposCambiados.push('archivo');

        await DocumentHistory.create({
            id_documento: doc.id_documento,
            id_usuario: req.user.id,
            accion: 'editado',
            campos_modificados: camposCambiados,
            valores_anteriores: valoresAnteriores,
            valores_nuevos: doc.toJSON(),
            descripcion: 'Documento actualizado'
        });

        // Recargar con joins para mapear al frontend
        const docActualizado = await Document.findByPk(doc.id_documento, {
            include: [
                { model: User, as: 'creador', attributes: ['id_usuario', 'username', 'nombre'] },
                { model: DocumentStatus, as: 'estado' },
                { model: MovementType, as: 'tipoMovimiento' },
                { model: DocumentAttachment, as: 'adjuntos' }
            ]
        });

        return res.json({
            mensaje: "Documento actualizado exitosamente",
            documento: mapDocumentToFrontendFormat(docActualizado),
        });
    } catch (error) {
        console.error("Error al actualizar:", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ mensaje: error.errors.map(e => e.message).join(', ') });
        }
        return res.status(500).json({ mensaje: "Error al actualizar el documento" });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const docId = req.params.id; // UUID
        const doc = await Document.findByPk(docId, {
            include: [{ model: DocumentStatus, as: 'estado' }]
        });

        if (!doc) {
            return res.status(404).json({ mensaje: "Documento no encontrado" });
        }

        const esAdmin = req.user.rol === "admin";
        const esDueno = doc.created_by === req.user.id;

        if (!esAdmin && !esDueno) {
            return res.status(403).json({ mensaje: "No tienes permiso para eliminar este documento" });
        }

        const estadoNombre = doc.estado ? doc.estado.nombre : null;
        if (!esAdmin && (estadoNombre === 'proceso' || estadoNombre === 'finalizado')) {
            return res.status(403).json({ mensaje: "No puedes eliminar un documento que ya está en proceso o ha finalizado" });
        }

        await doc.destroy(); 
        
        return res.json({ mensaje: "Documento eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        return res.status(500).json({ mensaje: "Error al eliminar el documento" });
    }
};

module.exports = {
    getAllDocuments,
    createDocument,
    updateDocument,
    deleteDocument
};
