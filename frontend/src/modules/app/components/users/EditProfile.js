import React, { useState, useEffect } from "react";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";
import { changePassword, updateProfile } from "../../../../backend/userService";
import { getServiceToken } from "../../../../backend/appFetch";

const EditProfile = ({ isPasswordMode = false }) => {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = getServiceToken();
        if (!token) {
            navigate("/users/login");
            return;
        }
        const storedUser = sessionStorage.getItem("authenticatedUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setProfile(user);
            setName(user.name);
            setSurname(user.surname);
            setEmail(user.email);
            setPhoneNumber(user.phoneNumber);
        } else {
            console.error("No hay usuario guardado");
            alert("No se pudo cargar el perfil");
        }
    }, [navigate]);

    const handleSave = (e) => {
        e.preventDefault();
        const updatedUser = { id: profile.id, name, surname, email, phoneNumber };

        const updateProfileData = () => {
            updateProfile(
                updatedUser,
                () => {
                    const newUser = { ...profile, name, surname, email, phoneNumber };
                    sessionStorage.setItem("authenticatedUser", JSON.stringify(newUser));
                    setProfile(newUser);
                    alert("Perfil actualizado con éxito");
                    navigate("/users/profile");
                },
                (error) => {
                    console.error("Error al actualizar el perfil:", error);
                    alert("No se pudo actualizar el perfil");
                }
            );
        };

        if (isPasswordMode) {
            changePassword(
                profile.id,
                oldPassword,
                newPassword,
                () => {
                    console.log("Contraseña cambiada con éxito");
                    updateProfileData();
                },
                (err) => {
                    console.error("Error al cambiar la contraseña:", err);
                    alert("No se pudo actualizar la contraseña");
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
        <div className="contenedor">
            <div className="caja-edit">
                {!isPasswordMode && <h2 className="titulo">Editar perfil</h2>}
                {isPasswordMode && <h2 className="titulo">Cambiar contraseña</h2>}

                {!isPasswordMode && (
                    <>
                        <div className="edit-profile-photo"> Foto de perfil </div>
                        <form className="form" onSubmit={handleSave}>
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

                            <div className="form-actions">
                                <button type="submit" className="save-btn">Guardar</button>
                                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancelar</button>
                            </div>
                        </form>
                    </>
                )}

                {isPasswordMode && (
                    <form className="form" onSubmit={handleSave}>
                        <label htmlFor="oldPassword">Contraseña actual</label>
                        <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            placeholder="Escribe tu contraseña actual..."
                            onChange={(e) => setOldPassword(e.target.value)}
                        />

                        <label htmlFor="newPassword">Nueva contraseña</label>
                        <div className="contenedor-password">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="newPassword"
                                value={newPassword}
                                placeholder="Escribe tu nueva contraseña..."
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <span
                                className="ver-password"
                                onClick={() => setShowPassword(!showPassword)}
                            > &#128065; </span>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">Guardar</button>
                            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancelar</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProfile;
