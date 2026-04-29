import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../services/auth';
import './UserAutocomplete.css';

function UserAutocomplete({ value, onChange, name, placeholder, required, onUserSelect }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Buscar usuarios cuando el usuario escribe
    useEffect(() => {
        const searchUsers = async () => {
            if (value && value.length >= 2) {
                setLoading(true);
                try {
                    const response = await fetchWithAuth(`/users/search?query=${encodeURIComponent(value)}`);
                    if (response.ok) {
                        const users = await response.json();
                        setSuggestions(users);
                        setShowSuggestions(true); // Mostrar siempre para ver si no hay resultados
                    }
                } catch (error) {
                    console.error('Error buscando usuarios:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [value]);

    const handleInputChange = (e) => {
        onChange(e);
    };

    const handleSelectUser = (user) => {
        // Crear un evento sintético para mantener compatibilidad
        const syntheticEvent = {
            target: {
                name: name,
                value: user.nombre || user.username // Prefer nombre over username
            }
        };
        onChange(syntheticEvent);

        // Call onUserSelect if provided
        if (onUserSelect) {
            onUserSelect(user);
        }

        setShowSuggestions(false);
    };

    return (
        <div className="autocomplete-wrapper" ref={wrapperRef}>
            <input
                type="text"
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                required={required}
                autoComplete="off"
            />

            {loading && (
                <div className="autocomplete-loading">
                    Buscando...
                </div>
            )}

            {showSuggestions && (
                <div className="autocomplete-suggestions">
                    {suggestions.length > 0 ? (
                        suggestions.map((user) => (
                            <div
                                key={user.id}
                                className="autocomplete-item"
                                onClick={() => handleSelectUser(user)}
                            >
                                <div className="autocomplete-item-main">
                                    <span className="autocomplete-name">{user.nombre || user.username}</span>
                                    <span className="autocomplete-role">{user.rol}</span>
                                </div>
                                <div className="autocomplete-item-details">
                                    <span className="autocomplete-cargo">{user.cargo || 'Sin cargo'}</span>
                                    {user.departamento && (
                                        <span className="autocomplete-dept"> • {user.departamento}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="autocomplete-no-results">
                            No se encontraron usuarios
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UserAutocomplete;
