/**
 * Utility functions for document handling
 */

/**
 * Determines the effective document type (sent/received) relative to the current user.
 * 
 * @param {Object} doc - The document object
 * @param {Object} user - The current user object
 * @returns {string} - 'enviado' or 'recibido'
 */
export const getEffectiveDocumentType = (doc, user) => {
    if (!user || !doc) return doc?.tipoMovimiento || 'enviado';

    // Si yo lo creé (userId coincide con mi id), mantenemos el tipo original
    if (doc.userId === user.id) {
        return doc.tipoMovimiento || 'enviado';
    }

    // Si NO lo creé yo, es algo que recibí
    return 'recibido';
};

/**
 * Returns color and label information for a given document status.
 * 
 * @param {string} status - The document status ('pendiente', 'proceso', 'finalizado')
 * @returns {Object} - Style information including hex codes and class names
 */
export const getStatusInfo = (status) => {
    switch (status) {
        case 'finalizado':
            return {
                label: 'Finalizado',
                colorClass: 'finalizado',
                hex: '#10b981',
                bgHex: '#d1fae5',
                textHex: '#065f46',
                borderHex: '#10b981'
            };
        case 'proceso':
            return {
                label: 'En Proceso',
                colorClass: 'proceso',
                hex: '#3b82f6',
                bgHex: '#dbeafe',
                textHex: '#1e40af',
                borderHex: '#3b82f6'
            };
        case 'pendiente':
        default:
            return {
                label: 'Pendiente',
                colorClass: 'pendiente',
                hex: '#fbbf24',
                bgHex: '#fef3c7',
                textHex: '#92400e',
                borderHex: '#fbbf24'
            };
    }
};

/**
 * Returns style information for a document type (enviado/recibido).
 * 
 * @param {string} effectiveType - The effective type needed ('enviado' or 'recibido')
 * @returns {Object} - Style information
 */
export const getDocumentTypeStyles = (effectiveType) => {
    if (effectiveType === 'recibido') {
        return {
            label: 'Recibido',
            hex: '#f97316', // Orange main color
            bgHex: '#ffedd5', // Light orange background
            textHex: '#9a3412', // Dark orange text
            rowClass: 'row-recibido',
            iconClass: 'icon-recibido'
        };
    }
    return {
        label: 'Enviado',
        hex: '#3b82f6', // Blue main color
        bgHex: '#dbeafe', // Light blue background
        textHex: '#1e40af', // Dark blue text
        rowClass: '', // Default row style usually doesn't have a specific class for sent
        iconClass: 'icon-enviado'
    };
};
