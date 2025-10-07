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

    const handleMouseEnter = () => {
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        setIsDropdownOpen(false);
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
                    <Link to="/" className="logo-link">
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
                <div className="header-actions">
                    <div
                        className="profile-dropdown"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className="profile-button">
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