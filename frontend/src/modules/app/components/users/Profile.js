import React, { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../../../../backend/userService";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem("userId");

        getProfile(
            userId,
            (data) => {
                setProfile(data);
            },
            (error) => {
                console.error("Error al cargar el perfil:", error);
                alert("No se pudo cargar el perfil");
            }
        );
    }, []);

    const handleReturnInit = () => {
        localStorage.removeItem("userId");
        navigate("/routines"); // Redirige a la página principal
    }

    const handleLogOut = () => {
        logout();
        localStorage.removeItem("userId");
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