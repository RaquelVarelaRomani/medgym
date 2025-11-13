import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, tryLoginFromServiceToken } from '../../../../backend/userService';
import ProfilePhoto from '../common/profilePhoto';
import styles from './UserSearch.module.css';

const UserSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const navigate = useNavigate();

    const performSearch = useCallback((searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        searchUsers(searchQuery, (users) => {
            setResults(users);
            setLoading(false);
        }, (error) => {
            console.error('Error searching users:', error);
            setResults([]);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        setDebounceTimer(timer);

        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleViewProfile = (userId) => {
        setQuery('');
        setResults([]);
        navigate(`/users/profile/${userId}`);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container}>
                <div className={styles.modal} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Buscar usuarios..."
                            value={query}
                            onChange={handleInputChange}
                            className={styles.searchInput}
                            autoFocus
                        />
                    </div>
                    <div className={styles.resultsContainer}>
                        {loading && <div className={styles.noResults}>Buscando...</div>}
                        {!loading && results.length === 0 && query.trim() && (
                            <div className={styles.noResults}>No se encontraron usuarios</div>
                        )}
                        {!loading && results.map((user) => (
                            <div key={user.id} className={styles.userItem}>
                                <ProfilePhoto
                                    profilePicture={user.profilePicture}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    size="small"
                                />
                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>
                                        {user.name} {user.surname}
                                    </div>
                                </div>
                                <div className={styles.userActions}>
                                    <button
                                        className={styles.viewProfileBtn}
                                        onClick={() => handleViewProfile(user.id)}
                                    >
                                        Ver Perfil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSearch;