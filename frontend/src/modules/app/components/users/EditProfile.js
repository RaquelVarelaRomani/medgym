import React, { useState, useEffect } from "react";
import styles from "./EditProfile.module.css";
import { useNavigate } from "react-router-dom";
import { changePassword, updateProfile, tryLoginFromServiceToken } from "../../../../backend/userService";
import Popup from "../common/popup/Popup";
import FileUploadButton from "../common/FileUploadButton";
import CropModal from "../common/CropModal";

const EditProfile = ({ isPasswordMode = false }) => {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setProfile(authenticatedUser.user);
                setName(authenticatedUser.user.name);
                setSurname(authenticatedUser.user.surname);
                setEmail(authenticatedUser.user.email);
                setPhoneNumber(authenticatedUser.user.phoneNumber);
                setProfilePicture(authenticatedUser.user.profilePicture);
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);


    const handleSave = (e) => {
        e.preventDefault();
        const updatedUser = { id: profile.id, name, surname, email, phoneNumber, profilePicture };

        const updateProfileData = () => {
            updateProfile(
                updatedUser,
                () => {
                    const newUser = { ...profile, name, surname, email, phoneNumber, profilePicture };
                    setProfile(newUser);
                    if (isPasswordMode) {
                        setPopupMessage("Contraseña actualizada con éxito");
                    } else {
                        setPopupMessage("Perfil actualizado con éxito");
                    }
                    setError("");
                    setShowPopup(true);
                },
                (errorResponse) => {
                    console.error("Error al actualizar el perfil:", errorResponse);

                    const backendMessage = errorResponse?.response?.data?.globalError || "No se pudo actualizar el perfil";
                    setError(backendMessage);
                }
            );
        };

        if (isPasswordMode) {
            setError("");
            setPasswordError("");
            if (newPassword !== confirmPassword) {
                setPasswordError("Las contraseñas nuevas no coinciden. Inténtelo de nuevo.");
                return;
            }

            if (oldPassword === newPassword) {
                setPasswordError("La nueva contraseña no puede ser igual a la actual.");
                return;
            }

            changePassword(
                profile.id,
                oldPassword,
                newPassword,
                () => {

                    console.log("Contraseña cambiada con éxito");
                    updateProfileData();
                },
                (err) => {
                    setError("La contraseña actual no es correcta")
                    console.error("Error al cambiar la contraseña:", err);
                }
            );
        } else {
            updateProfileData();
        }
    };

    const handleCancel = () => {
        navigate("/users/profile");
    };

    return (
        <div className={styles.contenedor}>
            <div className={styles['caja-edit']}>
                {!isPasswordMode && <h2 className={styles.titulo}>Editar perfil</h2>}

                {!isPasswordMode && (
                    <>
                        <div className={styles['edit-profile-photo']}>
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
                        <FileUploadButton onFileSelect={(file) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setShowCropper(true);
                                setImageToCrop(reader.result);
                            };
                            reader.readAsDataURL(file);
                        }} />
                        {showCropper && (
                            <CropModal
                                imageSrc={imageToCrop}
                                onCancel={() => setShowCropper(false)}
                                onSave={(croppedImage) => {
                                    const base64String = croppedImage.split(",")[1];
                                    setProfile({ ...profile, profilePicture: base64String });
                                    setProfilePicture(base64String);
                                    setShowCropper(false);
                                }}
                            />
                        )}

                        {error && <p className={styles["mensaje-error"]}>{error}</p>}

                        <form className={styles["form"]} onSubmit={handleSave}>
                            <label htmlFor="name">Nombre</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                placeholder="Escribe tu nombre..."
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <label htmlFor="surname">Apellidos</label>
                            <input
                                type="text"
                                id="surname"
                                value={surname}
                                placeholder="Escribe tus apellidos..."
                                onChange={(e) => setSurname(e.target.value)}
                                required
                            />

                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                placeholder="Escribe tu correo..."
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <label htmlFor="phoneNumber">Teléfono</label>
                            <input
                                type="text"
                                id="phoneNumber"
                                value={phoneNumber}
                                placeholder="Escribe tu teléfono..."
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />

                            <div className={styles['form-actions']}>
                                <button type="submit" className={styles['save-btn']}>Guardar</button>
                                <button type="button" className={styles['cancel-btn']} onClick={handleCancel}>Cancelar</button>
                            </div>
                        </form>
                    </> 
                )}

                {isPasswordMode && <h2 className={styles.titulo}>Cambiar contraseña</h2>}
                {isPasswordMode && error && <p className={styles['mensaje-error']}>{error}</p>}
                
                {isPasswordMode && (
                    <form className={styles.form} onSubmit={handleSave}>
                        <label htmlFor="oldPassword">Contraseña actual</label>

                        <div className={styles['contenedor-password']}>
                            <input
                                type={showOldPassword ? "text" : "password"}
                                id="oldPassword"
                                value={oldPassword}
                                placeholder="Escribe tu contraseña actual..."
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <span
                                className={styles['ver-password']}
                                onClick={() => setShowOldPassword(!showOldPassword)}
                            > &#128065; </span>
                        </div>
                        {isPasswordMode && passwordError && (
                            <p className={styles['mensaje-error']} style={{ alignSelf: "flex-start" }}>
                                {passwordError}
                            </p>
                            )}

                        <label htmlFor="newPassword">Nueva contraseña</label>
                        <div className={styles['contenedor-password']}>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                value={newPassword}
                                placeholder="Escribe tu nueva contraseña..."
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <span
                                className={styles['ver-password']}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            > &#128065; </span>
                        </div>
                        <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                        <div className={styles['contenedor-password']}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            placeholder="Vuelva a escribir su nueva contraseña..."
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                            className={styles['ver-password']}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            &#128065;
                        </span>
                        </div>


                        <div className={styles['form-actions']}>
                            <button type="submit" className={styles['save-btn']}>Guardar</button>
                            <button type="button" className={styles['cancel-btn']} onClick={handleCancel}>Cancelar</button>
                        </div>
                    </form>
                )}
            </div>

            <Popup text={popupMessage} show={showPopup} onOk={() => {
                setShowPopup(false);
                navigate("/users/profile");
            }} />
        </div>
    );
};

export default EditProfile;
