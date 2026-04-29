const { Role, Department, DocumentType, DocumentStatus, DocumentPriority, MovementType } = require('../models');

const getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener roles', error });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({ where: { activo: true } });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener departamentos', error });
    }
};

const getDocumentTypes = async (req, res) => {
    try {
        const types = await DocumentType.findAll();
        res.json(types);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener tipos de documento', error });
    }
};

const getDocumentStatuses = async (req, res) => {
    try {
        const statuses = await DocumentStatus.findAll();
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener estados de documento', error });
    }
};

const getDocumentPriorities = async (req, res) => {
    try {
        const priorities = await DocumentPriority.findAll({ order: [['orden', 'ASC']] });
        res.json(priorities);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener prioridades', error });
    }
};

const getMovementTypes = async (req, res) => {
    try {
        const types = await MovementType.findAll();
        res.json(types);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener tipos de movimiento', error });
    }
};

module.exports = {
    getRoles,
    getDepartments,
    getDocumentTypes,
    getDocumentStatuses,
    getDocumentPriorities,
    getMovementTypes
};
