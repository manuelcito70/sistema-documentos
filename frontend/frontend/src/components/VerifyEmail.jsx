import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Ajusta según tu config

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verificando tu cuenta...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token no proporcionado.');
            return;
        }

        const verify = async () => {
            try {
                const response = await axios.get(`${API_URL}/verify-email/${token}`);
                setStatus('success');
                setMessage(response.data.mensaje);

                // Redirigir al login después de unos segundos
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.mensaje || 'Error al verificar la cuenta.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f8f9fa',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{
                padding: '40px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center',
                maxWidth: '400px'
            }}>
                <h2 style={{ color: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#3b82f6' }}>
                    {status === 'verifying' ? 'Verificando...' : status === 'success' ? '¡Verificación Exitosa!' : 'Error'}
                </h2>
                <p style={{ color: '#666', marginTop: '10px' }}>{message}</p>

                {status === 'success' && (
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Ir al Inicio de Sesión
                    </button>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
