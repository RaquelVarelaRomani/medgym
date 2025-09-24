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
        navigate("/users/profile"); // Redirige al perfil tras guardar
    };

    const handleCancel = () => {
        navigate("/users/profile"); // Redirige al perfil sin guardar
    };

    return (
        <div className="contenedor">
        <div className="caja-edit">
            {/* TÍTULO */}
            <h2 className="titulo">Editar perfil</h2>

            {/* FOTO DE PERFIL */}
            <div className="edit-profile-photo"> Foto de perfil </div>

            {/* FORMULARIO */}
            <form className="form" onSubmit={handleSave}>
            <label htmlFor="username">Nombre de usuario</label>
            <input
                type="text"
                id="username"
                value={username}
                placeholder="Escribe tu nombre de usuario..."
                onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="email">Correo electrónico</label>
            <input
                type="email"
                id="email"
                value={email}
                placeholder="Escribe tu correo..."
                onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="password">Contraseña</label>
            <div className="contenedor-password">
                <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
                />
                <span
                className="ver-password"
                onClick={() => setShowPassword(!showPassword)}
                >
                {showPassword ? "🙈" : "👁️"}
                </span>
            </div>

            {/* BOTONES */}
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
        </div>
    );
};

export default EditProfile;
