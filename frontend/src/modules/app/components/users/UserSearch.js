import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, tryLoginFromServiceToken } from '../../../../backend/userService';
import { followTrainer, unfollowTrainer, getFollowedTrainers } from '../../../../backend/userFollowService';
import ProfilePhoto from '../common/profilePhoto';
import styles from './UserSearch.module.css';

const UserSearch = ({ isOpen }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [followedTrainers, setFollowedTrainers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingFollow, setLoadingFollow] = useState(new Set());
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
    };

    const handleFollow = (userId) => {
        if (!currentUser) return;

        const isFollowing = followedTrainers.some(trainer => trainer.id === userId);
        console.log(`Before action: isFollowing = ${isFollowing}, followedTrainers =`, followedTrainers);
        const newLoadingFollow = new Set(loadingFollow);
        newLoadingFollow.add(userId);
        setLoadingFollow(newLoadingFollow);
        setErrorMessage('');


        const onSuccess = () => {
            console.log(`Success callback for ${isFollowing ? 'unfollow' : 'follow'}`);
            const updatedLoadingFollow = new Set(loadingFollow);
            updatedLoadingFollow.delete(userId);
            setLoadingFollow(updatedLoadingFollow);
            if (isFollowing) {
                getFollowedTrainers(currentUser.id, (followed) => {
                    setFollowedTrainers(followed);
                }, (error) => {
                    console.error('Error fetching followed trainers after unfollow:', error);
                });
            }
            console.log(`After success: followedTrainers =`, followedTrainers);
        };

        const onError = (error) => {
            console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} trainer:`, error);
            setErrorMessage(`Error al ${isFollowing ? 'dejar de seguir' : 'seguir'} al usuario. Inténtalo de nuevo.`);
            if (isFollowing) {
                setFollowedTrainers(prev => [...prev, { id: userId }]);
            } else {
                setFollowedTrainers(prev => prev.filter(trainer => trainer.id !== userId));
            }
            const updatedLoadingFollow = new Set(loadingFollow);
            updatedLoadingFollow.delete(userId);
            setLoadingFollow(updatedLoadingFollow);
            console.log(`After error rollback: followedTrainers =`, followedTrainers);
        };

        if (isFollowing) {
            unfollowTrainer(userId, onSuccess, onError);
        } else {
            followTrainer(userId, onSuccess, onError);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
            <div className={styles.container} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <div className={styles.modal}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Buscar usuarios..."
                            value={query}
                            onChange={handleInputChange}
                            className={styles.searchInput}
                            autoFocus
                        />
                        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
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
                                    {currentUser && (
                                        <button
                                            className={styles.followBtn}
                                            onClick={() => handleFollow(user.id)}
                                            disabled={loadingFollow.has(user.id)}
                                        >
                                            {loadingFollow.has(user.id) ? 'Cargando...' : (followedTrainers.some(trainer => trainer.id === user.id) ? 'Siguiendo' : 'Seguir')}
                                        </button>
                                    )}
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