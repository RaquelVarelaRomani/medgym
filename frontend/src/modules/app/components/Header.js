import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import styles from './Header.module.css';
import {logout, tryLoginFromServiceToken} from "../../../backend/userService";
import * as workoutService from "../../../backend/workoutService";
import { getUserNotifications } from "../../../backend/notificationService";
import ProfilePhoto from "./common/profilePhoto";
import NotificationIcon from "./common/notifications/NotificationIcon";
import NotificationPopup from "./common/notifications/NotificationPopup";
import UserSearch from "./users/UserSearch";
import { getFollowers } from '../../../backend/userFollowService';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const dropdownComponent = useRef(null);
    const userSearchComponent = useRef(null);

    const handleToggleNotifications = () => {
        setShowNotifications(prev => !prev);
        setIsDropdownOpen(false);
        setShowUserSearch(false);
    };

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                console.log("User data in header:", authenticatedUser.user);
                setProfile(authenticatedUser.user);
                checkActiveWorkout();
            },
            (error) => {
                console.error("Failed to get user data in header:", error);
            }
        );
    }, [navigate]);

    const checkActiveWorkout = () => {
        workoutService.getWorkouts(
            (workouts) => {
                const active = workouts.find(workout => !workout.endTime);
                setActiveWorkout(active || null);
            },
            (error) => {
                console.error("Error checking active workout:", error);
                setActiveWorkout(null);
            }
        );
    };

    useEffect(() => {
    const handleWorkoutFinish = () => checkActiveWorkout();
    window.addEventListener("workoutFinished", handleWorkoutFinish);
    return () => {
      window.removeEventListener("workoutFinished", handleWorkoutFinish);
    };
  }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {

            if (dropdownComponent.current && !dropdownComponent.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!profile) return;

        getUserNotifications(
            (data) => setNotifications(data),
            (error) => console.error("Error loading notifications:", error)
        );
    }, [profile]);

    // Listen for routine deletion events to refresh notifications
    useEffect(() => {
        const handleRoutineDeleted = () => {
            refreshNotifications();
        };

        window.addEventListener('routineDeleted', handleRoutineDeleted);

        return () => {
            window.removeEventListener('routineDeleted', handleRoutineDeleted);
        };
    }, []);

    const refreshNotifications = () => {
        getUserNotifications(
            (data) => setNotifications(data),
            (error) => console.error("Error loading notifications:", error)
        );
    };

    const isAdmin = () => {
        return profile?.role === 'ADMIN';

    };

    const handleProfileClick = () => {
        setIsDropdownOpen(prev => !prev);
        setShowNotifications(false);
        setShowUserSearch(false);
    };

    const handleViewProfile = () => {
        navigate(`/users/profile/${profile.id}`);
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/users/login");
    }

    const handleActiveWorkoutClick = () => {
        if (activeWorkout) {
            navigate(`/workouts/session/${activeWorkout.id}`);
        }
    }

    return (
        <header className={styles['app-header']}>
            <div className={styles['header-glow']}></div>
            <div className={styles['header-content']}>

                {/* left section - branding */}
                <div className={styles['header-left']}>
                    <Link to="/workouts/feed" className={styles['logo-link']}>
                        <img
                            src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                            alt="Logo medgym"
                            className={styles['logo-image']}
                        />
                        <span className={styles['brand-name-small']}>MEDGYM</span>
                    </Link>
                </div>

                {/* center section - nav buttons */}
                <nav className={styles['nav-links']}>
                    {activeWorkout && (
                        <button
                            className={styles['active-workout-badge']}
                            onClick={handleActiveWorkoutClick}
                            title={`Entrenamiento activo: ${activeWorkout.routineName}`}
                        >
                            🏋️ Entrenamiento Activo
                        </button>
                    )}
                    <Link
                        to="/workouts/feed"
                        className={location.pathname.includes('/workouts/feed') ? `${styles['nav-link']} ${styles['active']}` : styles['nav-link']}
                    >
                        Feed
                    </Link>

                    <Link
                        to="/routines"
                        className={location.pathname.includes('/routines') ? `${styles['nav-link']} ${styles['active']}` : styles['nav-link']}
                    >
                        Rutinas
                    </Link>
                    <Link
                        to="/exercises"
                        className={location.pathname.includes('/exercises') ? `${styles['nav-link']} ${styles['active']}` : styles['nav-link']}
                    >
                        Ejercicios
                    </Link>
                    <Link
                        to="/workouts/history"
                        className={location.pathname.includes('/workouts/history') ? `${styles['nav-link']} ${styles['active']}` : styles['nav-link']}
                    >
                        Historial
                    </Link>
                    {isAdmin() && (
                        <Link
                            to="/users/moderation"
                            className={location.pathname === '/users/moderation'
                                ? `${styles['nav-link']} ${styles['admin-link']} ${styles['active']}`
                                : `${styles['nav-link']} ${styles['admin-link']}`}
                        >
                            Moderación
                        </Link>
                    )}
                </nav>

                {/* right section - profile */}
                <div className={styles['header-actions']} ref={dropdownComponent}>
                    <div className={styles['notification-wrapper']}>
                        <NotificationIcon onClick={handleToggleNotifications} refreshTrigger={notifications} />
                        {showNotifications && (
                            <NotificationPopup
                                notifications={notifications}
                                onClose={() => setShowNotifications(false)}
                                onNotificationRead={(id, action) => {
                                    if (action === "delete") {
                                        setNotifications(prev => prev.filter(n => n.id !== id));
                                    } else if (action === "read") {
                                        setNotifications(prev =>
                                            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                                        );
                                        refreshNotifications();
                                    }
                                }}
                            />
                        )}
                    </div>

                    <div className={styles['profile-dropdown']}>
                        <button
                            className={styles['profile-button']}
                            onClick={handleProfileClick}
                        >
                            <div className={styles['header-profile-photo']}>
                                <ProfilePhoto
                                    profilePicture={profile?.profilePicture}
                                    alt="Foto de perfil"
                                    size="small"
                                />
                            </div>
                        </button>
                        {isDropdownOpen && (
                            <div className={styles['dropdown-menu']}>
                                <button
                                    className={styles['dropdown-item']}
                                    onClick={handleViewProfile}
                                >
                                    Ver Perfil
                                </button>
                                <button
                                    className={styles['dropdown-item']}
                                    onClick={handleLogout}
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <UserSearch
                    ref={userSearchComponent}
                    isOpen={showUserSearch}
                    onClose={() => setShowUserSearch(false)}
                />
            </div>
        </header>
    );
};

export default Header;
