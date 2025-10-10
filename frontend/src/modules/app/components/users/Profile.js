import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
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
        <div className={styles.profile}>
            <div className={styles['profile-container']}>
                <div className={styles['profile-header']}>
                    <div className={styles['profile-info']}>
                        <div className={styles['profile-photo']}>
                            {profile?.profilePicture ? (
                                <img
                                    src={`data:image/jpeg;base64,${profile.profilePicture}`}
                                    alt="Foto de perfil"
                                    className={styles['profile-image']}
                                />
                            ) : (
                                <img
                                    src="./assets/default-profile.jpg"
                                    alt="Foto por defecto"
                                    className={styles['profile-image']}
                                />
                            )}
                        </div> 
                        <h2 className={styles['profile-name']}>
                            {profile ? `${profile.name} ${profile.surname}` : "Cargando..."}
                        </h2>
                    </div>
                
                    <div className={styles['profile-actions']}>
                        <button className={styles['edit-profile-button']} onClick={handleEditProfile}> Editar perfil </button>
                        <button className={styles['edit-profile-button']} onClick={handleChangePassword}> Cambiar contraseña </button>
                    </div>
                </div>

                <div className={styles['profile-data']}>
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
