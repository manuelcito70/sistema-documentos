import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/auth';
import UserAutocomplete from './UserAutocomplete';
import { getEffectiveDocumentType } from '../utils/documentUtils';
import './Documentos.css';

function Documentos({ user, initialFilters }) {
  const [filters, setFilters] = useState({
    search: '',
    tipoMovimiento: 'todos',
    clasificacion: 'todos',
    estado: 'todos',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Aplicar filtros iniciales si existen
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));
    } else {
      setFilters({
        search: '',
        tipoMovimiento: 'todos',
        clasificacion: 'todos',
        estado: 'todos',
        fechaDesde: '',
        fechaHasta: ''
      });
    }
  }, [initialFilters]);

  const [documentos, setDocumentos] = useState([]);

  // Cargar documentos al iniciar
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetchWithAuth('/documentos');
      if (res.ok) {
        const data = await res.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  const [formData, setFormData] = useState({
    codigo: '',
    archivo: null,
    cargo: '',
    destinatarioId: null,
    tipoMovimiento: 'enviado',
    clasificacion: 'interno',
    estado: 'pendiente',
    fechaRegistro: new Date().toISOString().split('T')[0],
    fechaEnvio: '',
    remitente: '',
    destinatario: '',
    quienRecibe: '',
    detalle: '',
    observaciones: ''
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setFormData({
      ...formData,
      archivo: file
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          data.append(key, value);
        }
      });

      const res = await fetchWithAuth('/documentos', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detalle ? `${errorData.mensaje}: ${errorData.detalle}` : errorData.mensaje || 'Error al registrar el documento');
      }

      const dataRes = await res.json();
      console.log('Respuesta servidor:', dataRes);

      const docConNuevosCampos = {
        ...dataRes.documento
      };

      setDocumentos([docConNuevosCampos, ...documentos]);
      alert('¡Documento registrado exitosamente!');
      setIsModalOpen(false);
      
      setFormData({
        codigo: '',
        tipoMovimiento: 'enviado',
        clasificacion: 'interno',
        estado: 'pendiente',
        fechaRegistro: today,
        fechaEnvio: '',
        remitente: '',
        destinatario: '',
        destinatarioId: null,
        cargo: '',
        quienRecibe: '',
        detalle: '',
        observaciones: '',
        archivo: null
      });

    } catch (error) {
      console.error(error);
      alert(error.message || 'Ocurrió un error al registrar el documento');
    }
  };

  const handleDeleteRequest = (doc) => {
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      const res = await fetchWithAuth(`/documentos/${documentToDelete.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchDocuments();
        setIsDeleteModalOpen(false);
        setDocumentToDelete(null);
        alert('Documento eliminado exitosamente');
      } else {
        try {
          const errData = await res.json();
          alert(errData.mensaje || 'Error al eliminar el documento');
        } catch(e) {
          alert('Error al eliminar el documento');
        }
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error de conexión al eliminar');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== null && key !== 'id' && key !== 'archivo') {
          data.append(key, value);
        }
      });

      const res = await fetchWithAuth(`/documentos/${editFormData.id}`, {
        method: 'PUT',
        body: data,
      });

      if (!res.ok) {
        throw new Error('Error al actualizar el documento');
      }

      const dataRes = await res.json();
      console.log('Respuesta servidor:', dataRes);

      const updatedDocs = documentos.map(doc =>
        doc.id_documento === editFormData.id ? dataRes.documento : doc
      );
      setDocumentos(updatedDocs);

      alert('¡Documento actualizado exitosamente!');
      setIsDetailModalOpen(false);
      setEditFormData(null);
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al actualizar el documento');
    }
  };

  const handleEnviar = (e, doc) => {
    e.stopPropagation();
    if (confirm(`¿Confirmar envío del documento ${doc.codigo} a ${doc.destinatario}?`)) {
      alert(`✅ ¡Documento enviado exitosamente a ${doc.destinatario}!`);
    }
  };

  const filteredDocuments = documentos.filter((doc) => {
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch =
      (doc.codigo && doc.codigo.toLowerCase().includes(searchTerm)) ||
      (doc.detalle && doc.detalle.toLowerCase().includes(searchTerm)) ||
      (doc.remitente && doc.remitente.toLowerCase().includes(searchTerm)) ||
      (doc.destinatario && doc.destinatario.toLowerCase().includes(searchTerm));

    if (!matchesSearch) return false;

    if (filters.tipoMovimiento !== 'todos') {
      // Lógica de tipo efectivo: Si soy el dueño, es lo que dice. Si nó, es 'recibido'.
      const effectiveType = getEffectiveDocumentType(doc, user);

      if (effectiveType !== filters.tipoMovimiento) return false;
    }

    if (filters.clasificacion !== 'todos') {
      if (doc.clasificacion !== filters.clasificacion) return false;
    }

    if (filters.estado !== 'todos') {
      if ((doc.estado?.nombre || doc.estado)?.nombre !== filters.estado) return false;
    }

    if (filters.fechaDesde) {
      if (doc.fecha_registro < filters.fechaDesde) return false;
    }
    if (filters.fechaHasta) {
      if (doc.fecha_registro > filters.fechaHasta) return false;
    }

    return true;
  });

  return (
    <div className="documentos-container">
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Documentos</h1>
        </div>
        <div className="page-actions">
          <div className="user-info-small">
            <div className="user-avatar-small">
              <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="user-details-small">
              <p className="user-email-small">{user?.nombre || user?.username || 'Usuario'}</p>
              <p className="user-type-small">{user?.rol || 'Usuario'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="documentos-inner">
      {/* INFO PRINCIPAL */}
      <div className="gestion-info-simple">
        <div className="gestion-text">
          <h2 className="gestion-title">Gestión de Documentos</h2>
          <p className="gestion-subtitle">
            {user?.rol === 'externo'
              ? 'Consulta los documentos disponibles'
              : 'Administra todos tus documentos en un solo lugar'}
          </p>
        </div>
        {/* Todos los usuarios pueden crear documentos */}
        <button className="btn-registrar" onClick={() => setIsModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          + Enviar Documento
        </button>
      </div>

      {/* FILTROS */}
      <div className="filters-section">
        <h3 className="filters-title">Filtros y Búsqueda</h3>

        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            name="search"
            placeholder="Buscar por código, asunto, remitente o destinatario..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Tipo de Movimiento</label>
            <select
              name="tipoMovimiento"
              value={filters.tipoMovimiento}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="enviado">Enviado</option>
              <option value="recibido">Recibido</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Clasificación</label>
            <select
              name="clasificacion"
              value={filters.clasificacion}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="interno">Interno</option>
              <option value="externo">Externo</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="proceso">En Proceso</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Fecha Desde</label>
            <input
              type="date"
              name="fechaDesde"
              value={filters.fechaDesde}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Fecha Hasta</label>
            <input
              type="date"
              name="fechaHasta"
              value={filters.fechaHasta}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="table-section">
        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th></th>
                <th>FECHA</th>
                <th>N°</th>
                <th>DETALLE</th>
                <th>REMITENTE</th>
                <th>CARGO</th>
                <th>QUIEN RECIBE</th>
                <th>DESTINATARIO</th>
                <th>OBSERVACIONES</th>
                <th>ARCHIVO</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-table">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <p>No hay documentos encontrados</p>
                    <small>Intenta ajustar tus filtros de búsqueda</small>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const effectiveType = getEffectiveDocumentType(doc, user);

                  // Determine status class
                  let statusClass = '';
                  if (effectiveType === 'recibido') {
                    statusClass = 'row-recibido';
                  } else {
                    statusClass = (doc.estado?.nombre || doc.estado)?.nombre === 'pendiente' ? 'row-pendiente' :
                      (doc.estado?.nombre || doc.estado)?.nombre === 'proceso' ? 'row-proceso' :
                        (doc.estado?.nombre || doc.estado)?.nombre === 'finalizado' ? 'row-finalizado' : '';
                  }

                  return (
                    <tr key={doc.id_documento} className={statusClass}>
                      <td>
                        <div className="doc-type-icon">
                          {effectiveType === 'recibido' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-recibido">
                              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-enviado">
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          )}
                        </div>
                      </td>
                      <td>{doc.fecha_registro}</td>
                      <td>{doc.codigo}</td>
                      <td>{doc.detalle}</td>
                      <td>{doc.remitente}</td>
                      <td>{doc.cargo}</td>
                      <td>{doc.quien_recibe}</td>
                      <td>{doc.destinatario}</td>
                      <td>{doc.observaciones || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className="btn-action"
                            onClick={() => {
                              setSelectedDocument(doc);
                              // Usuarios externos NUNCA pueden editar (solo ver)
                              // Usuarios internos/admin pueden editar si no está finalizado
                              const isRecibido = getEffectiveDocumentType(doc, user) === 'recibido';
                              if (user?.rol === 'externo' || (doc.estado?.nombre || doc.estado)?.nombre === 'finalizado' || isRecibido) {
                                setEditFormData(null); // Solo lectura
                              } else {
                                setEditFormData({ ...doc }); // Permitir edición
                              }
                              setIsDetailModalOpen(true);
                            }}
                            title="Ver detalles"
                          >
                            Ver
                          </button>

                          {/* Botón Eliminar - Todos pueden eliminar */}
                          <button
                            className="btn-action btn-delete"
                            style={{
                              padding: '6px 8px',
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onClick={() => handleDeleteRequest(doc)}
                            title="Eliminar documento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>

                          {/* Botón Enviar - Solo para el creador del documento (si es interno/admin) */}
                          {user?.rol !== 'externo' && (doc.estado?.nombre || doc.estado)?.nombre === 'finalizado' && doc.userId === user?.id_usuario && (
                            <button
                              className="btn-status-enviado"
                              title="Confirmar Envío"
                              style={{ marginLeft: '8px', cursor: 'pointer' }}
                              onClick={(e) => handleEnviar(e, doc)}
                            >
                              Enviar
                            </button>
                          )}

                          {/* Descargar archivo - Todos pueden descargar */}
                          {doc.archivo && (
                            <a
                              href={`http://localhost:3000/uploads/${doc.archivo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-download"
                              title="Descargar documento"
                              style={{ marginLeft: '8px' }}
                            >
                              📄 Ver
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Nuevo Documento</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* FILA 1: CÓDIGO + TIPO MOVIMIENTO */}
              <div className="form-row">
                <div className="form-group">
                  <label>Código de Documento <span className="required">*</span></label>
                  <input
                    type="text"
                    name="codigo"
                    placeholder="DOC-2025-0001"
                    value={formData.codigo}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Movimiento <span className="required">*</span></label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="tipoMovimiento"
                        value="enviado"
                        checked={formData.tipoMovimiento === 'enviado'}
                        onChange={handleFormChange}
                      />
                      Enviado
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="tipoMovimiento"
                        value="recibido"
                        checked={formData.tipoMovimiento === 'recibido'}
                        onChange={handleFormChange}
                      />
                      Recibido
                    </label>
                  </div>
                </div>
              </div>

              {/* FILA 2: CLASIFICACIÓN + ESTADO */}
              <div className="form-row">
                <div className="form-group">
                  <label>Clasificación <span className="required">*</span></label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="clasificacion"
                        value="interno"
                        checked={formData.clasificacion === 'interno'}
                        onChange={handleFormChange}
                      />
                      Interno
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="clasificacion"
                        value="externo"
                        checked={formData.clasificacion === 'externo'}
                        onChange={handleFormChange}
                      />
                      Externo
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Estado <span className="required">*</span></label>
                  {user?.rol === 'externo' ? (
                    <div className="info-message" style={{
                      padding: '12px',
                      background: '#f3f4f6',
                      borderRadius: '6px',
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      📋 Los documentos se crean automáticamente en estado <strong>Para enviar</strong>
                    </div>
                  ) : (
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="estado"
                          value="pendiente"
                          checked={formData.estado === 'pendiente'}
                          onChange={handleFormChange}
                        />
                        Pendiente
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="estado"
                          value="proceso"
                          checked={formData.estado === 'proceso'}
                          onChange={handleFormChange}
                        />
                        En Proceso
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="estado"
                          value="finalizado"
                          checked={formData.estado === 'finalizado'}
                          onChange={handleFormChange}
                        />
                        Finalizado
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* FILA 3: ARCHIVO */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Archivo (Word, PDF, Excel, PPT) <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    name="archivo"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileChange}
                    required
                  />
                  {formData.archivo && (
                    <small className="file-hint">
                      Archivo seleccionado: {formData.archivo.name}
                    </small>
                  )}
                </div>
              </div>


              {/* FILA 4: REMITENTE + DESTINATARIO */}
              <div className="form-row">
                <div className="form-group">
                  <label>Remitente <span className="required">*</span></label>
                  <input
                    type="text"
                    name="remitente"
                    placeholder="Escribe el nombre del remitente"
                    value={formData.remitente}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Destinatario <span className="required">*</span></label>
                  <UserAutocomplete
                    name="destinatario"
                    placeholder="Buscar por nombre o cargo..."
                    value={formData.destinatario}
                    onChange={handleFormChange}
                    onUserSelect={(user) => {
                      setFormData(prev => ({
                        ...prev,
                        destinatario: user.nombre || user.username,
                        destinatarioId: user.id_usuario,
                        quienRecibe: user.cargo || ''
                      }));
                    }}
                    required
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    💡 Escribe al menos 2 caracteres para buscar usuarios
                  </small>
                </div>
              </div>

              {/* FILA 5: CARGO + QUIÉN RECIBE */}
              <div className="form-row">
                <div className="form-group">
                  <label>Cargo <span className="required">*</span></label>
                  <input
                    type="text"
                    name="cargo"
                    placeholder="Ej: Secretaria, Docente..."
                    value={formData.cargo}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quién recibe <span className="required">*</span></label>
                  <UserAutocomplete
                    name="quienRecibe"
                    placeholder="Buscar por nombre o cargo..."
                    value={formData.quienRecibe}
                    onChange={handleFormChange}
                    required
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    💡 Busca usuarios registrados
                  </small>
                </div>
              </div>

              {/* FILA 6: FECHAS */}
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Registro <span className="required">*</span></label>
                  <input
                    type="date"
                    name="fechaRegistro"
                    value={formData.fechaRegistro}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Envío/Recepción</label>
                  <input
                    type="date"
                    name="fechaEnvio"
                    value={formData.fechaEnvio}
                    onChange={handleFormChange}
                  />
                </div>
              </div>


              {/* DETALLE */}
              <div className="form-group">
                <label>Detalle <span className="required">*</span></label>
                <textarea
                  name="detalle"
                  placeholder="Detalle del documento"
                  value={formData.detalle}
                  onChange={handleFormChange}
                  rows="2"
                  required
                ></textarea>
              </div>

              {/* OBSERVACIONES */}
              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  name="observaciones"
                  placeholder="Notas adicionales sobre el documento (máximo 500 caracteres)"
                  value={formData.observaciones}
                  onChange={handleFormChange}
                  rows="4"
                  maxLength="500"
                ></textarea>
                <small className="char-count">
                  {formData.observaciones.length}/500 caracteres
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Registrar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE */}
      {
        isDetailModalOpen && selectedDocument && (
          <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalles del Documento</h2>
                <button className="modal-close" onClick={() => setIsDetailModalOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="modal-form">
                {editFormData ? (
                  /* --- MODO EDICIÓN --- */
                  <form onSubmit={handleUpdate}>
                    {/* FILA 1: CÓDIGO + TIPO MOVIMIENTO */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Código de Documento</label>
                        <input
                          type="text"
                          name="codigo"
                          value={editFormData?.codigo || ''}
                          onChange={handleEditChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Tipo de Movimiento</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="tipoMovimiento"
                              value="enviado"
                              checked={editFormData?.tipoMovimiento === 'enviado'}
                              onChange={handleEditChange}
                            />
                            Enviado
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="tipoMovimiento"
                              value="recibido"
                              checked={editFormData?.tipoMovimiento === 'recibido'}
                              onChange={handleEditChange}
                            />
                            Recibido
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* FILA 2: CLASIFICACIÓN + ESTADO */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Clasificación</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="clasificacion"
                              value="interno"
                              checked={editFormData?.clasificacion === 'interno'}
                              onChange={handleEditChange}
                            />
                            Interno
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="clasificacion"
                              value="externo"
                              checked={editFormData?.clasificacion === 'externo'}
                              onChange={handleEditChange}
                            />
                            Externo
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Estado</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="estado"
                              value="pendiente"
                              checked={editFormData?.estado === 'pendiente'}
                              onChange={handleEditChange}
                            />
                            Pendiente
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="estado"
                              value="proceso"
                              checked={editFormData?.estado === 'proceso'}
                              onChange={handleEditChange}
                            />
                            En Proceso
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="estado"
                              value="finalizado"
                              checked={editFormData?.estado === 'finalizado'}
                              onChange={handleEditChange}
                            />
                            Finalizado
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* FILA 3: DESTINATARIO + REMITENTE */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Destinatario</label>
                        <UserAutocomplete
                          name="destinatario"
                          placeholder="Buscar por nombre o cargo..."
                          value={editFormData?.destinatario || ''}
                          onChange={handleEditChange}
                          onUserSelect={(user) => {
                            setEditFormData(prev => ({
                              ...prev,
                              quienRecibe: user.cargo || ''
                            }));
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label>Remitente</label>
                        <input
                          type="text"
                          name="remitente"
                          value={editFormData?.remitente || ''}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>

                    {/* FILA 4: FECHAS */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Fecha de Registro</label>
                        <input
                          type="date"
                          name="fechaRegistro"
                          value={editFormData?.fechaRegistro || ''}
                          onChange={handleEditChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Fecha de Envío/Recepción</label>
                        <input
                          type="date"
                          name="fechaEnvio"
                          value={editFormData?.fechaEnvio || ''}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>

                    {/* FILA 5: CARGO + QUIÉN RECIBE */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Cargo</label>
                        <input
                          type="text"
                          name="cargo"
                          value={editFormData?.cargo || ''}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Quién recibe</label>
                        <UserAutocomplete
                          name="quienRecibe"
                          placeholder="Buscar por nombre o cargo..."
                          value={editFormData?.quienRecibe || ''}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>

                    {/* DETALLE */}
                    <div className="form-group">
                      <label>Detalle</label>
                      <textarea
                        name="detalle"
                        value={editFormData?.detalle || ''}
                        rows="2"
                        onChange={handleEditChange}
                      ></textarea>
                    </div>

                    {/* OBSERVACIONES */}
                    <div className="form-group">
                      <label>Observaciones</label>
                      <textarea
                        name="observaciones"
                        value={editFormData?.observaciones || ''}
                        rows="4"
                        onChange={handleEditChange}
                        maxLength="500"
                      ></textarea>
                      <small className="char-count">
                        {(editFormData?.observaciones || '').length}/500 caracteres
                      </small>
                    </div>

                    {/* ARCHIVO */}
                    {selectedDocument.archivo && (
                      <div className="form-group">
                        <label>Archivo Adjunto</label>
                        <div>
                          <a
                            href={`http://localhost:3000/uploads/${selectedDocument.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-download"
                            style={{ display: 'inline-block', padding: '10px 20px', textDecoration: 'none' }}
                          >
                            📄 Descargar Documento
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          setEditFormData(null);
                        }}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn-confirm">
                        {getEffectiveDocumentType(selectedDocument, user) === 'recibido' 
                          ? 'Guardar Cambios' 
                          : 'Actualizar Documento'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* --- MODO LECTURA (SOLO VER) --- */
                  <div>
                    {/* FILA 1: CÓDIGO + TIPO MOVIMIENTO */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Código de Documento</label>
                        <input type="text" value={selectedDocument.codigo} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Tipo de Movimiento</label>
                        <input type="text" value={selectedDocument.tipoMovimiento === 'recibido' ? 'Recibido' : 'Enviado'} readOnly />
                      </div>
                    </div>

                    {/* FILA 2: CLASIFICACIÓN + ESTADO */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Clasificación</label>
                        <input type="text" value={selectedDocument.clasificacion === 'interno' ? 'Interno' : 'Externo'} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Estado</label>
                        <input
                          type="text"
                          value={
                            selectedDocument.estado === 'pendiente' ? 'Pendiente' :
                              selectedDocument.estado === 'proceso' ? 'En Proceso' :
                                'Finalizado'
                          }
                          readOnly
                          style={{ fontWeight: 'bold', color: '#10b981' }}
                        />
                      </div>
                    </div>

                    {/* FILA 3: DESTINATARIO + REMITENTE */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Destinatario</label>
                        <input type="text" value={selectedDocument.destinatario} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Remitente</label>
                        <input type="text" value={selectedDocument.remitente} readOnly />
                      </div>
                    </div>

                    {/* FILA 4: FECHAS */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Fecha de Registro</label>
                        <input type="text" value={selectedDocument.fechaRegistro} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Fecha de Envío/Recepción</label>
                        <input type="text" value={selectedDocument.fechaEnvio || '-'} readOnly />
                      </div>
                    </div>

                    {/* FILA 5: CARGO + QUIÉN RECIBE */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Cargo</label>
                        <input type="text" value={selectedDocument.cargo} readOnly />
                      </div>
                      <div className="form-group">
                        <label>Quién recibe</label>
                        <input type="text" value={selectedDocument.quienRecibe} readOnly />
                      </div>
                    </div>

                    {/* DETALLE */}
                    <div className="form-group">
                      <label>Detalle</label>
                      <textarea value={selectedDocument.detalle} rows="2" readOnly></textarea>
                    </div>

                    {/* OBSERVACIONES */}
                    <div className="form-group">
                      <label>Observaciones</label>
                      <textarea value={selectedDocument.observaciones || 'Sin observaciones'} rows="4" readOnly></textarea>
                    </div>

                    {/* ARCHIVO */}
                    {selectedDocument.archivo && (
                      <div className="form-group">
                        <label>Archivo Adjunto</label>
                        <div>
                          <a
                            href={`http://localhost:3000/uploads/${selectedDocument.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-download"
                            style={{ display: 'inline-block', padding: '10px 20px', textDecoration: 'none' }}
                          >
                            📄 Descargar Documento
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="modal-actions">
                      <button
                        type="button"
                        className={getEffectiveDocumentType(selectedDocument, user) === 'recibido' ? "btn-confirm" : "btn-cancel"}
                        onClick={() => setIsDetailModalOpen(false)}
                      >
                        {getEffectiveDocumentType(selectedDocument, user) === 'recibido' ? 'Guardar Documento' : 'Cerrar ( Solo Lectura )'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: '20px', color: '#ef4444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>¿Eliminar documento?</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este documento permanentemente?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>{/* end documentos-inner */}
    </div >
  );
}

export default Documentos;
