import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, tryLoginFromServiceToken } from '../../../../backend/userService';
import { followTrainer, unfollowTrainer, getFollowedTrainers } from '../../../../backend/userFollowService';
import ProfilePhoto from '../common/profilePhoto';
import styles from './UserSearch.module.css';

const UserSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [followedTrainers, setFollowedTrainers] = useState([]);
    const navigate = useNavigate();

    const performSearch = useCallback((searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        searchUsers(searchQuery, (users) => {
            setResults(users);
            console.log(users);
            setLoading(false);
        }, (error) => {
            console.error('Error searching users:', error);
            setResults([]);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                getFollowedTrainers(authenticatedUser.user.id, (followed) => {
                    setFollowedTrainers(followed);
                }, (error) => {
                    console.error('Error fetching followed trainers:', error);
                });
            },
            () => {
            }
        );
    }, []);

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
        navigate(`/users/${userId}/profile`);
        onClose();
    };

    const handleFollow = (userId) => {
        const isFollowing = followedTrainers.some(trainer => trainer.id === userId);

        if (isFollowing) {
            unfollowTrainer(userId, () => {
                setFollowedTrainers(prev => prev.filter(trainer => trainer.id !== userId));
            }, (error) => {
                console.error('Error unfollowing trainer:', error);
            });
        } else {
            followTrainer(userId, () => {
                getFollowedTrainers(currentUser.id, (followed) => {
                    setFollowedTrainers(followed);
                }, (error) => {
                    console.error('Error fetching followed trainers after follow:', error);
                });
            }, (error) => {
                console.error('Error following trainer:', error);
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.container} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
                                    <button
                                        className={styles.followBtn}
                                        onClick={() => handleFollow(user.id)}
                                    >
                                        {followedTrainers.some(trainer => trainer.id === user.id) ? 'Siguiendo' : 'Seguir'}
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