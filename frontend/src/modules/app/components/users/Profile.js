import React from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const handleLogOut = () => {
        // Aquí iría la lógica para cerrar sesión, como limpiar tokens, etc.
        navigate("/"); // Redirige al inicio de sesión o página principal
    }

    return (
        <div className="profile">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-info">
                        <div className="profile-photo"> Foto de perfil </div>
                        <h2 className="profile-name"> Nombre Usuario </h2>
                    </div>
                
                    <div className="profile-actions">
                        <button className="return-init-button"> Volver al inicio </button>
                        <button className="edit-profile-button"> Editar perfil </button>
                        <button className="logout-button" onClick={handleLogOut}> Cerrar sesión </button>
                    </div>
                
                </div>

                <div className="profile-content">
                    <h3> Mi perfil </h3>
                    <div className="profile-data"> Datos personales </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;