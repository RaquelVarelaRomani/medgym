import React, { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../../backend/userService";
import {getServiceToken} from "../../../../backend/appFetch";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);

    //cargar datos de usuario
    useEffect(() => {
        const token = getServiceToken();
        if (!token) {
            navigate("/");
            return;
        }

        const storedUser = sessionStorage.getItem('authenticatedUser');
        if (storedUser) {
            setProfile(JSON.parse(storedUser));
        } else {
            console.error("No hay usuario guardado");
            alert("No se pudo cargar el perfil");
        }

    }, [navigate]);

    const handleReturnInit = () => {
        navigate("/routines"); // Redirige a la página principal
    }

    const handleLogOut = () => {
        logout();
        sessionStorage.removeItem("authenticatedUser");
        navigate("/"); // Redirige al inicio de sesión
    }

    const handleEditProfile = () => {
        navigate("/users/profile/edit-profile"); // Redirige a la página de editar perfil
    }

    return (
        <div className="profile">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-info">
                        <div className="profile-photo"> Foto de perfil </div>
                        <h2 className="profile-name">
                            {profile ? `${profile.name} ${profile.surname}` : "Cargando..."}
                        </h2>
                    </div>
                
                    <div className="profile-actions">
                        <button className="return-init-button" onClick={handleReturnInit}> Volver al inicio </button>
                        <button className="edit-profile-button" onClick={handleEditProfile}> Editar perfil </button>
                        <button className="logout-button" onClick={handleLogOut}> Cerrar sesión </button>
                    </div>
                </div>

                <div className="profile-data">
                    {profile ? (
                        <>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Teléfono:</strong> {profile.phoneNumber}</p>
                            <p><strong>Rol:</strong> {profile.role}</p>
                        </>
                    ) : (
                        <p>Cargando datos...</p>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default Profile;