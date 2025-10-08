import React from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import './Header.css';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate("/users/profile");
    };

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
                    <button className="profile-button">
                        <img
                            src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                            alt="Foto de perfil"
                            className="foto-perfil"
                            onClick={() => handleProfileClick()}
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;