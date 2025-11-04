import React, { useState } from "react";
import { login } from "../../../../backend/userService";
import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import Slogan from "../common/Slogan";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (!email.trim() || !password) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return;

        login(
            email.trim(),
            password,
            (data) => {
                console.log("Login correcto:", data);
                navigate("/routines");
            },
            (error) => {
                if (error.body.globalError === 'project.exceptions.BlockedUserException') {
                    setError('Tu cuenta está bloqueada.');
                } else {
                    setError('Usuario o contraseña incorrectos.');
                }
            }
        )
    };

    return (
        <div className={styles.contenedor}>

            <Slogan />

            <div className={styles['caja-login']}>
                <img
                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                    alt="Logo medgym"
                    className={styles.logo}
                />

                <h2 className={styles.titulo}>Inicia sesión</h2>

                {error && <p className={styles['mensaje-error']}>{error}</p>}

                <form className={styles.form} onSubmit={(e) => {
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
                    <div className={styles['contenedor-password']}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Escriba aquí su contraseña..."
                        />

                        <span
                            className={styles['ver-password']}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            &#128065;
                        </span>
                    </div>

                    <p className={styles['ir-a-registrarse']}>
                        <Link to="/users/register" className={styles['link-registrarse']}>
                            Regístrate si todavía no tienes una cuenta.
                        </Link>
                    </p>

                    <button type="submit" className={styles['boton-entrar']}>
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
