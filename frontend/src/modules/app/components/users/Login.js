import React, { useState } from "react";
import { login } from "../../../../backend/userService";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = () => {
        login(
            email.trim(),
            password,
            (data) => {
                console.log("Login correcto:", data);
                navigate("/routines");
            },
            (error) => {
                setError("Usuario o contraseña incorrectos");
                console.error("Error en login:", error);
            }
        )
    };

    return (
        <div className="contenedor">
            <div className="caja-login">
                <img
                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                    alt="Logo medgym"
                    className="logo"
                />

                <h2 className="titulo">Inicia sesión</h2>

                {error && <p className="mensaje-error">{error}</p>}

                <form className="form" onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}>
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Escriba aquí su email..."
                    />

                    <label htmlFor="password">Contraseña</label>
                    <div className="contenedor-password">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Escriba aquí su contraseña..."
                        />

                        <span
                            className="ver-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            &#128065;
                        </span>
                    </div>

                    <p className="ir-a-registrarse">
                        <Link to="/users/register" className="link-registrarse">
                            Regístrate si todavía no tienes una cuenta.
                        </Link>
                    </p>

                    <button type="submit" className="boton-entrar">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
