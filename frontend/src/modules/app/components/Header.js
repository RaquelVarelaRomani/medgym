import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import styles from './Header.module.css';
import {logout, tryLoginFromServiceToken} from "../../../backend/userService";
import { getUserNotifications } from "../../../backend/notificationService";
import ProfilePhoto from "./common/profilePhoto";
import NotificationIcon from "./common/NotificationIcon";
import NotificationPopup from "./common/NotificationPopup";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownComponent = useRef(null);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                console.log("User data in header:", authenticatedUser.user);
                setProfile(authenticatedUser.user);
            },
            (error) => {
                console.error("Failed to get user data in header:", error);
            }
        );
    }, [navigate]);

    //close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownComponent.current && !dropdownComponent.current.contains(event.target)) {
                setIsDropdownOpen(false);
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

    const handleProfileClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleViewProfile = () => {
        navigate("/users/profile");
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/users/login");
    }


    return (
        <header className={styles['app-header']}>
            <div className={styles['header-glow']}></div>
            <div className={styles['header-content']}>

                {/* left section - branding */}
                <div className={styles['header-left']}>
                    <Link to="/routines" className={styles['logo-link']}>
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
                    <Link
                        to="/routines"
                        className={location.pathname.includes('/routines') ? `${styles['nav-link']} ${styles['active']}` : styles['nav-link']}
                    >
                        Entrenamientos
                    </Link>
                    <Link
                        to="/exercises"
                        className={location.pathname.includes('/exercises') ? `${styles['nav-link']} ${styles['active']}` : styles['nav-link']}
                    >
                        Ejercicios
                    </Link>
                </nav>

                {/* right section - profile */}
                <div className={styles['header-actions']} ref={dropdownComponent}>
                    <div className={styles['notification-wrapper']}>
                        <NotificationIcon onClick={() => setShowNotifications(prev => !prev)} />
                        {showNotifications && (
                            <NotificationPopup
                                notifications={notifications}
                                onClose={() => setShowNotifications(false)}
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
            </div>
        </header>
    );
};

export default Header;
