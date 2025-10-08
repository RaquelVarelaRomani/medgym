import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import './Header.css';
import {logout, tryLoginFromServiceToken} from "../../../backend/userService";
import ProfilePhoto from "./common/profilePhoto";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

    const handleLogoClick = (e) => {
        if (location.pathname === '/routines') {
            e.preventDefault(); //avoid reloading routines if already on that page
        }
    };

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
        <header className="app-header">
            <div className="header-glow"></div>
            <div className="header-content">

                {/* left section - branding */}
                <div className="header-left">
                    <Link to="/" className="logo-link" onClick={handleLogoClick}>
                        <img
                            src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                            alt="Logo medgym"
                            className="logo-image"
                        />
                        <span className="brand-name-small">MEDGYM</span>
                    </Link>
                </div>

                {/* center section - nav buttons */}
                <nav className="nav-links">
                    <Link
                        to="/routines"
                        className={location.pathname.includes('/routines') ? 'nav-link active' : 'nav-link'}
                    >
                        Entrenamientos
                    </Link>
                    <Link
                        to="/exercises"
                        className={location.pathname.includes('/exercises') ? 'nav-link active' : 'nav-link'}
                    >
                        Ejercicios
                    </Link>
                </nav>

                {/* right section - profile */}
                <div className="header-actions" ref={dropdownComponent}>
                    <div className="profile-dropdown">
                        <button
                            className="profile-button"
                            onClick={handleProfileClick}
                        >
                            <div className="header-profile-photo">
                                <ProfilePhoto
                                    profilePicture={profile?.profilePicture}
                                    alt="Foto de perfil"
                                />
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <button
                                    className="dropdown-item"
                                    onClick={handleViewProfile}
                                >
                                    Ver Perfil
                                </button>
                                <button
                                    className="dropdown-item"
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