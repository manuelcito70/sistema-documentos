import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { fetchWithAuth } from '../services/auth';
import { getEffectiveDocumentType } from '../utils/documentUtils';

function Dashboard({ user, onNavigate }) {
  const [documents, setDocuments] = useState([]);
  const [usersCount, setUsersCount] = useState(0); // Nuevo estado para usuarios
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fecha helper
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const today = todayStr;

  // Helper de fechas para la semana
  const getWeekRange = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1;
    const last = first + 6;
    const firstday = new Date(curr.setDate(first));
    const lastday = new Date(curr.setDate(last));
    return {
      start: firstday.toISOString().split('T')[0],
      end: lastday.toISOString().split('T')[0]
    };
  };

  const weekRange = getWeekRange();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth('/documentos');
        if (response.ok) {
          const data = await response.json();
          setDocuments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Obtener usuarios si es admin
    const fetchUsersCount = async () => {
      if (user && user.rol === 'admin') {
        try {
          const response = await fetchWithAuth('/users');
          if (response.ok) {
            const data = await response.json();
            setUsersCount(data.length);
          }
        } catch (err) {
          console.error("Error al contar usuarios", err);
        }
      }
    };

    if (user) {
      fetchDocuments();
      fetchUsersCount();
    }
  }, [user]);

  // --- CÁLCULO DE ESTADÍSTICAS ---
  // ... (código existente de filtros)
  const isToday = (dateStr) => dateStr && dateStr.startsWith(todayStr);
  const isThisWeek = (dateStr) => {
    if (!dateStr) return false;
    return dateStr >= weekRange.start && dateStr <= weekRange.end;
  };

  // Totales
  const enviadosHoy = documents.filter(d => getEffectiveDocumentType(d, user) === 'enviado' && isToday(d.fechaRegistro)).length;
  const recibidosHoy = documents.filter(d => getEffectiveDocumentType(d, user) === 'recibido' && isToday(d.fechaRegistro)).length;
  const enviadosSemana = documents.filter(d => getEffectiveDocumentType(d, user) === 'enviado').length;
  const recibidosSemana = documents.filter(d => getEffectiveDocumentType(d, user) === 'recibido').length;

  const internosCount = documents.filter(d => d.clasificacion === 'interno').length;
  const externosCount = documents.filter(d => d.clasificacion === 'externo').length;

  const pendientesCount = documents.filter(d => d.estado === 'pendiente').length;
  const procesoCount = documents.filter(d => d.estado === 'proceso').length;
  const finalizadosCount = documents.filter(d => d.estado === 'finalizado').length;

  const recentDocuments = [...documents].sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)).slice(0, 5);

  return (
    <div className="dashboard-container">
      {/* Header consistente */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Panel de Control</h1>
        </div>
        <div className="page-actions">
          {/* ... user info ... */}
          <div className="user-info-small">
            <div className="user-avatar-small"><span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span></div>
            <div className="user-details-small">
              <p className="user-email-small">{user?.nombre || user?.username || 'Usuario'}</p>
              <p className="user-type-small">{user?.rol || 'Invitado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas superiores */}
      <div className="stats-grid">

        {/* TARJETA DE USUARIOS (Solo Admin) */}
        {user && user.rol === 'admin' && (
          <div
            className="stat-card blue" // Usamos azul o un estilo distinto
            onClick={() => onNavigate('usuarios')}
            style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}
          >
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="stat-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>TOTAL</span>
            </div>
            <div className="stat-card-body">
              <h2 className="stat-number">{usersCount}</h2>
              <p className="stat-description" style={{ color: 'rgba(255,255,255,0.9)' }}>Usuarios Registrados</p>
            </div>
          </div>
        )}

        {/* DOCUMENTOS ENVIADOS */}
        {/* ... resto de tarjetas ... */}
        <div
          className="stat-card blue"
          onClick={() => onNavigate('documentos', { tipoMovimiento: 'enviado', fechaDesde: today, fechaHasta: today })}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-header">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </div>
            <span className="stat-badge">HOY</span>
          </div>
          <div className="stat-card-body">
            <h2 className="stat-number">{enviadosHoy}</h2>
            <p className="stat-description">Documentos Enviados</p>
          </div>
        </div>

        {/* DOCUMENTOS RECIBIDOS - Verde */}
        <div
          className="stat-card green"
          onClick={() => onNavigate('documentos', { tipoMovimiento: 'recibido', fechaDesde: today, fechaHasta: today })}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-header">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
            </div>
            <span className="stat-badge">HOY</span>
          </div>
          <div className="stat-card-body">
            <h2 className="stat-number">{recibidosHoy}</h2>
            <p className="stat-description">Documentos Recibidos</p>
          </div>
        </div>

        {/* ENVIADOS ESTA SEMANA - Morado */}
        <div
          className="stat-card purple"
          onClick={() => onNavigate('documentos', { tipoMovimiento: 'enviado', fechaDesde: weekRange.start, fechaHasta: weekRange.end })}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-header">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span className="stat-badge">SEMANA</span>
          </div>
          <div className="stat-card-body">
            <h2 className="stat-number">{enviadosSemana}</h2>
            <p className="stat-description">Enviados esta Semana</p>
          </div>
        </div>

        {/* RECIBIDOS ESTA SEMANA - Naranja */}
        <div
          className="stat-card orange"
          onClick={() => onNavigate('documentos', { tipoMovimiento: 'recibido', fechaDesde: weekRange.start, fechaHasta: weekRange.end })}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-header">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
            <span className="stat-badge">SEMANA</span>
          </div>
          <div className="stat-card-body">
            <h2 className="stat-number">{recibidosSemana}</h2>
            <p className="stat-description">Recibidos esta Semana</p>
          </div>
        </div>
      </div>

      {/* Contenido principal con dos columnas */}
      <div className="dashboard-content">
        {/* Clasificación de Documentos */}
        <div className="dashboard-section">
          <h3 className="section-title">Clasificación de Documentos</h3>
          <div className="classification-list">
            {/* INTERNOS - Morado */}
            <div
              className="classification-item"
              onClick={() => onNavigate('documentos', { clasificacion: 'interno' })}
              style={{ cursor: 'pointer' }}
            >
              <div className="classification-icon purple-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                </svg>
              </div>
              <span className="classification-label">Internos</span>
              <span className="classification-count">{internosCount}</span>
            </div>

            {/* EXTERNOS - Turquesa/Teal */}
            <div
              className="classification-item"
              onClick={() => onNavigate('documentos', { clasificacion: 'externo' })}
              style={{ cursor: 'pointer' }}
            >
              <div className="classification-icon teal-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <span className="classification-label">Externos</span>
              <span className="classification-count">{externosCount}</span>
            </div>
          </div>
        </div>

        {/* Estado de Documentos - Solo visible para internos y admin */}
        {user?.rol !== 'externo' && (
          <div className="dashboard-section">
            <h3 className="section-title">Estado de Documentos</h3>
            <div className="status-list">
              {/* PENDIENTES - Amarillo */}
              <div
                className="status-item yellow-bg"
                onClick={() => onNavigate('documentos', { estado: 'pendiente' })}
                style={{ cursor: 'pointer' }}
              >
                <div className="status-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <span className="status-label">Pendientes</span>
                <span className="status-count">{pendientesCount}</span>
              </div>

              {/* EN PROCESO - Azul */}
              <div
                className="status-item blue-bg"
                onClick={() => onNavigate('documentos', { estado: 'proceso' })}
                style={{ cursor: 'pointer' }}
              >
                <div className="status-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                </div>
                <span className="status-label">En Proceso</span>
                <span className="status-count">{procesoCount}</span>
              </div>

              {/* FINALIZADOS - Verde */}
              <div
                className="status-item green-bg"
                onClick={() => onNavigate('documentos', { estado: 'finalizado' })}
                style={{ cursor: 'pointer' }}
              >
                <div className="status-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span className="status-label">Finalizados</span>
                <span className="status-count">{finalizadosCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documentos Recientes */}
      <div className="recent-documents">
        <div className="recent-header">
          <h3 className="section-title">Documentos Recientes</h3>
          <button
            className="view-all"
            onClick={() => onNavigate('documentos')}
          >
            Ver todos →
          </button>
        </div>

        {/* Tabla */}
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
              {recentDocuments.length === 0 ? (
                <tr>
                  <td colSpan="10">
                    <div className="empty-state">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <p>No hay documentos registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentDocuments.map((doc) => {
                  // Determinar tipo efectivo
                  const effectiveType = getEffectiveDocumentType(doc, user);

                  // Determine status class (prioritize 'recibido' type for orange coloring)
                  let statusClass = '';
                  if (effectiveType === 'recibido') {
                    statusClass = 'row-recibido';
                  } else {
                    statusClass = doc.estado === 'pendiente' ? 'row-pendiente' :
                      doc.estado === 'proceso' ? 'row-proceso' :
                        doc.estado === 'finalizado' ? 'row-finalizado' : '';
                  }

                  return (
                    <tr key={doc.id || doc.codigo} className={statusClass}>
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
                      <td>{doc.fechaRegistro}</td>
                      <td>{doc.codigo}</td>
                      <td>{doc.detalle}</td>
                      <td>{doc.remitente}</td>
                      <td>{doc.cargo}</td>
                      <td>{doc.quienRecibe}</td>
                      <td>{doc.destinatario}</td>
                      <td>{doc.observaciones || '-'}</td>
                      <td>
                        <button
                          className="btn-action"
                          style={{
                            padding: '6px 12px',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            marginRight: '8px'
                          }}
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsDetailModalOpen(true);
                          }}
                          title="Ver detalles"
                        >
                          Ver
                        </button>
                        {doc.archivo && (
                          <a
                            href={`http://localhost:3000/uploads/${doc.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Descargar documento"
                            style={{ textDecoration: 'none' }}
                          >
                            📄
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      {isDetailModalOpen && selectedDocument && (
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
              {/* FILA 1: CÓDIGO + CLASIFICACIÓN */}
              <div className="form-row">
                <div className="form-group">
                  <label>Código de Documento</label>
                  <input type="text" value={selectedDocument.codigo} readOnly />
                </div>

                <div className="form-group">
                  <label>Clasificación</label>
                  <input type="text" value={selectedDocument.clasificacion === 'interno' ? 'Interno' : 'Externo'} readOnly />
                </div>
              </div>

              {/* FILA 2: DESTINATARIO + ESTADO */}
              <div className="form-row">
                <div className="form-group">
                  <label>Destinatario</label>
                  <input type="text" value={selectedDocument.destinatario} readOnly />
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
                  />
                </div>
              </div>

              {/* FILA 3: FECHAS */}
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Registro</label>
                  <input type="date" value={selectedDocument.fechaRegistro} readOnly />
                </div>

                <div className="form-group">
                  <label>Fecha de Envío/Recepción</label>
                  <input type="date" value={selectedDocument.fechaEnvio || ''} readOnly />
                </div>
              </div>

              {/* FILA 4: REMITENTE + CARGO */}
              <div className="form-row">
                <div className="form-group">
                  <label>Remitente</label>
                  <input type="text" value={selectedDocument.remitente} readOnly />
                </div>

                <div className="form-group">
                  <label>Cargo</label>
                  <input type="text" value={selectedDocument.cargo} readOnly />
                </div>
              </div>

              {/* FILA 5: QUIÉN RECIBE */}
              <div className="form-row">
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
                      style={{ display: 'inline-block', padding: '10px 20px', textDecoration: 'none', background: '#7c3aed', color: 'white', borderRadius: '8px' }}
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
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;