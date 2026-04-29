import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/auth';
import './Usuarios.css';

function Usuarios() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar usuarios');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Cargando usuarios...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="usuarios-container">
            <div className="header-actions">
                <h2>Administración de Usuarios</h2>
                <span className="user-count-badge">{users.length} Usuarios Registrados</span>
            </div>

            <div className="table-responsive">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Cargo</th>
                            <th>Departamento</th>
                            <th>Estado</th>
                            <th>Último Acceso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="font-medium">{user.username}</td>
                                <td>{user.nombre || '-'}</td>
                                <td>{user.email || '-'}</td>
                                <td>
                                    <span className={`role-badge ${user.rol}`}>
                                        {user.rol}
                                    </span>
                                </td>
                                <td>{user.cargo || '-'}</td>
                                <td>{user.departamento || '-'}</td>
                                <td>
                                    <span className={`status-dot ${user.activo ? 'active' : 'inactive'}`}></span>
                                    {user.activo ? 'Activo' : 'Inactivo'}
                                </td>
                                <td className="text-muted">
                                    {user.ultimoAcceso
                                        ? new Date(user.ultimoAcceso).toLocaleString()
                                        : 'Nunca'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Usuarios;
