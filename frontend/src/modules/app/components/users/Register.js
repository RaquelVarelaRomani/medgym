import React, { useState} from "react";
import styles from "./Register.module.css";
import stylesLogin from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import {signUp} from "../../../../backend/userService";
import Slogan from "../common/Slogan";

const Register = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^\+?\d{9,15}$/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = () => {
        //limpiar errores que se hayan almacenado antes
        setError("");
        setPasswordError("");
        setPhoneError("");

        if (!name.trim() || !surname.trim() || !email.trim() || !phoneNumber.trim() || !password || !confirmPassword) {
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            return;
        }

        if (!validatePhoneNumber(phoneNumber.trim())) {
            setPhoneError("El número de teléfono no es válido. Debe contener entre 9 y 15 dígitos.");
            return;
        }

        if(password !== confirmPassword){
            setPasswordError("Las contraseñas no coinciden. Inténtelo de nuevo.");
            return;
        }


        const user = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            password,
            role: "CLIENT",
            status: "ACTIVE",
        };

        signUp(
            user,
            (data) => {
                console.log("Registro correcto:", data);
                navigate("/workouts/feed");
            },
            (errorResponse) => {
                console.log("Error en el registro:", errorResponse);
                let errorMessage = errorResponse.globalError || "Error en el registro";
                if (errorMessage.includes("DuplicateInstanceException")) {
                    errorMessage = "El email o teléfono ya existe";
                }
                setError(errorMessage);
            },
        );
    };

    return (
        <div className={styles.contenedor}>
            <Slogan className={styles['slogan-registro']} />

            <div className={styles['caja-login']}>
                <img
                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                    alt="Logo medgym"
                    className={styles.logo}
                />

                <h2 className={styles.titulo}>Regístrate</h2>

                {error && <p className={stylesLogin["mensaje-error"]}>{error}</p>}
                <form className={styles["form"]} onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}>
                    {phoneError && (
                        <p className={stylesLogin['mensaje-error']} style={{ alignSelf: "flex-start" }}>
                            {phoneError}
                        </p>
                    )}
                    {passwordError && (
                        <p className={stylesLogin['mensaje-error']} style={{ alignSelf: "flex-start" }}>
                            {passwordError}
                        </p>
                    )}
                    <label htmlFor="name">Nombre</label>
                    <input
                        type="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Escriba aquí su nombre..."
                    />

                    <label htmlFor="surname">Apellidos</label>
                    <input
                        type="surname"
                        id="surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                        placeholder="Escriba aquí sus apellidos..."
                    />

                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Escriba aquí su email..."
                    />

                    <label htmlFor="phoneNumber">Teléfono</label>
                    <input
                        type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        placeholder="Escriba aquí su número de teléfono..."
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
                        <button
                            type="button"
                            className={styles["ver-password"]}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Mostrar u ocultar contraseña"
                        >
                            &#128065;
                        </button>
                    </div>

                    <label htmlFor="confirmPassword">Confirmar contraseña</label>
                    <div className={styles['contenedor-password']}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Vuelva a escribir aquí su contraseña..."
                        />
                        <button
                            type="button"
                            className={styles["ver-password"]}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label="Mostrar u ocultar contraseña"
                        >
                            &#128065;
                        </button>
                    </div>
                    
                    <p className={styles['ir-a-login']}>
                        <Link to="/users/login" className={styles['link-login']}>
                            Inicia sesión si ya tienes una cuenta.
                        </Link>
                    </p>

                    <button type="submit" className={styles['boton-guardar']}>
                        Guardar
                    </button>
                </form>
            </div>

            
        </div>
    );
};

export default Register;
