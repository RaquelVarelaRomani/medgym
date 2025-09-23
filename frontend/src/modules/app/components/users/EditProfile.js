import React, { useState } from "react";
import "./EditProfile.css";

import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSave = (e) => {
        e.preventDefault();
        navigate("/users/profile"); // Redirige de vuelta al perfil después de guardar
    };

    const handleCancel = () => {
        navigate("/users/profile"); // Redirige de vuelta al perfil sin guardar
    };

    return (
        <div className="edit-profile">
        <h2>Editar perfil</h2>

        <div className="edit-profile-photo"> Foto de perfil </div>

        <form onSubmit={handleSave} className="edit-profile-form">
            <label>
            Nombre de usuario
            <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            </label>

            <label>
            Correo electrónico
            <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </label>

            <label className="password-field">
            Contraseña
            <div className="password-input">
                <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                >
                {showPassword ? "🙈" : "👁️"}
                </button>
            </div>
            </label>

            <div className="form-actions">
            <button type="submit" className="save-btn">
                Guardar
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancelar
            </button>
            </div>
        </form>
        </div>
    );
};

export default EditProfile;
