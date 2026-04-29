import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/auth';
import { getEffectiveDocumentType, getStatusInfo } from '../utils/documentUtils';
import './Calendario.css';

function Calendario({ user, onNavigate }) {
  const [currentDate, setCurrentDate] = useState(new Date()); // Fecha real
  const [selectedDate, setSelectedDate] = useState(null);
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetchWithAuth('/documentos'); // Usar fetch autenticado
      if (res.ok) {
        const data = await res.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Obtener días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  // Navegar meses
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Renderizar días
  const renderDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener último día del mes anterior
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

    // Días del mes anterior (grises)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          {dayNum}
        </div>
      );
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
        </div>
      );
    }

    // Días del mes siguiente (grises) - solo completar la semana actual
    const totalDays = days.length;
    const remainingInWeek = totalDays % 7;
    const daysToAdd = remainingInWeek === 0 ? 0 : 7 - remainingInWeek;

    for (let day = 1; day <= daysToAdd; day++) {
      days.push(
        <div key={`next-${day}`} className="calendar-day other-month">
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendario-container">
      {/* Header consistente */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Calendario</h1>
        </div>
        <div className="page-actions">
          <div className="user-info-small">
            <div className="user-avatar-small">
              <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="user-details-small">
              <p className="user-email-small">{user?.nombre || user?.username || 'Usuario'}</p>
              <p className="user-type-small">{user?.rol || 'Invitado'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="calendario-inner">
      <div className="calendario-content">
        {/* Calendario */}
        <div className="calendar-section">
          <div className="calendar-header">
            <button className="nav-btn" onClick={prevMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h2 className="calendar-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="nav-btn today-btn">Hoy</button>
            <button className="nav-btn" onClick={nextMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div className="calendar-grid">
            {daysOfWeek.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
            {renderDays()}
          </div>

          {/* Leyenda */}
          <div className="calendar-legend">
            <h4>Leyenda de Estados</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color pendiente"></span>
                <span>Pendiente</span>
              </div>
              <div className="legend-item">
                <span className="legend-color proceso"></span>
                <span>En Proceso</span>
              </div>
              <div className="legend-item">
                <span className="legend-color finalizado"></span>
                <span>Finalizado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de información */}
        <div className="info-panel">
          <h3>
            {selectedDate
              ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : 'Selecciona un día'}
          </h3>

          {!selectedDate ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <p>Haz clic en un día del calendario para ver sus documentos</p>
            </div>
          ) : (
            <div className="documents-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '380px' }}>
              {documentos.filter(doc => {
                const selYear = selectedDate.getFullYear();
                const selMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const selDay = String(selectedDate.getDate()).padStart(2, '0');
                const selDateStr = `${selYear}-${selMonth}-${selDay}`;
                return doc.fechaRegistro === selDateStr;
              }).length > 0 ? (
                documentos
                  .filter(doc => {
                    const selYear = selectedDate.getFullYear();
                    const selMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const selDay = String(selectedDate.getDate()).padStart(2, '0');
                    const selDateStr = `${selYear}-${selMonth}-${selDay}`;
                    return doc.fechaRegistro === selDateStr;
                  })
                  .map(doc => {
                    const effectiveType = getEffectiveDocumentType(doc, user);
                    const isReceived = effectiveType === 'recibido';
                    const statusInfo = getStatusInfo(doc.estado);
                    const borderColor = isReceived ? '#f97316' : statusInfo.hex;

                    return (
                      <div
                        key={doc.id}
                        style={{ 
                          background: 'rgba(255,255,255,0.06)', 
                          padding: '14px', 
                          borderRadius: '12px', 
                          borderLeft: `3px solid ${borderColor}`, 
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          border: `1px solid rgba(255,255,255,0.08)`,
                          borderLeftWidth: '3px',
                          borderLeftColor: borderColor
                        }}
                        onClick={() => onNavigate('documentos')}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '700', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>{doc.codigo}</span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                            {doc.estado}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: '0 0 6px 0' }}>{doc.detalle}</p>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>De: {doc.remitente}</span>
                          <span>Para: {doc.destinatario}</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
                  <p>No hay documentos para este día</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>{/* end calendario-inner */}
    </div>
  );
}

export default Calendario;