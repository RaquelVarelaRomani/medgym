import { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { logout, tryLoginFromServiceToken } from "../../../../backend/userService";
import Popup from "../common/Popup";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                console.log("Respuesta loginFromServiceToken:", authenticatedUser.user);
                setProfile(authenticatedUser.user); // ya tienes name, surname, email, profilePicture, etc.
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);

    const handleReturnInit = () => {
        navigate("/routines"); // Redirige a la página principal
    }

    const handleLogOut = () => {
        logout();
        setShowPopup(true);
    }

    const handleEditProfile = () => {
        navigate("/users/profile/edit-profile"); // Redirige a la página de editar perfil
    }

    const handleChangePassword = () => {
        navigate("/users/profile/change-password");
    }

    const roleString = () => {
        if (profile.role === "CLIENT") return "Cliente";
        if (profile.role === "TRAINER") return "Entrenador";
        if (profile.role === "ADMIN") return "Administrador";
        return "Indefinido";
    }

    return (
        <div className="profile">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-info">
                        <div className="profile-photo">
                            {profile?.profilePicture ? (
                                <img
                                    src={`data:image/jpeg;base64,${profile.profilePicture}`}
                                    alt="Foto de perfil"
                                    className="profile-image"
                                />
                            ) : (
                                <img
                                    src="./assets/default-profile.jpg"
                                    alt="Foto por defecto"
                                    className="profile-image"
                                />
                            )}
                        </div> 
                        <h2 className="profile-name">
                            {profile ? `${profile.name} ${profile.surname}` : "Cargando..."}
                        </h2>
                    </div>
                
                    <div className="profile-actions">
                        <button className="return-init-button" onClick={handleReturnInit}> Volver al inicio </button>
                        <button className="edit-profile-button" onClick={handleEditProfile}> Editar perfil </button>
                        <button className="edit-profile-button" onClick={handleChangePassword}> Cambiar contraseña </button>
                        <button className="logout-button" onClick={handleLogOut}> Cerrar sesión </button>
                    </div>
                </div>

                <div className="profile-data">
                    {profile ? (
                        <>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Teléfono:</strong> {profile.phoneNumber}</p>
                            <p><strong>Rol:</strong> {roleString()}</p>
                        </>
                    ) : (
                        <p>Cargando datos...</p>
                    )}
                </div>
                
            </div>

            <Popup text={"Sesión cerrada. ¡Vuelva pronto!"} show={showPopup} onOk={() => {
                setShowPopup(false);
                navigate("/users/login");
            }} />
        </div>
    );
};

export default Profile;