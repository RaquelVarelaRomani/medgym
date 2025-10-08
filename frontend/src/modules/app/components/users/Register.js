import React, { useState} from "react";
import "./Register.css";
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
    //necesitamos que sea string en lugar de bool (ahora tenemos varios tipos de errores)
    const [showPopup, setShowPopup] = useState(false);
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = () => {
        //limpiar errores que se hayan almacenado antes
        setError("");
        setPasswordError("");
        
        if(password !== confirmPassword){
            setPasswordError("Las contraseñas no coinciden. Inténtelo de nuevo.");
        }


        const user = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            password,
            role: "CLIENT",
        };

        signUp(
            user,
            (data) => {
                console.log("Registro correcto:", data);
                navigate("/routines", { replace: true, state: { registered: true, email } })                        },
            (error) => {
                setError("Correo electrónico o teléfono ya existe");
                console.error("Error en el registro:", error);
            },
        );
    };

    return (
        <div className="contenedor">
            <Slogan className="slogan-registro" />

            <div className="caja-login">
                <img
                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                    alt="Logo medgym"
                    className="logo"
                />

                <h2 className="titulo">Regístrate</h2>

                {error && <p className="mensaje-error">{error}</p>}

                <form className="form" onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}>
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

                    {passwordError && (
                        <p className="mensaje-error" style={{ alignSelf: "flex-start" }}>
                        {passwordError}
                        </p>
                    )}
                    
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

                    <label htmlFor="confirmPassword">Confirmar contraseña</label>
                    <div className="contenedor-password">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Vuelva a escribir aquí su contraseña..."
                        />
                        <span
                            className="ver-password"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            &#128065;
                        </span>
                    </div>
                    
                    <p className="ir-a-login">
                        <Link to="/users/login" className="link-login">
                            Inicia sesión si ya tienes una cuenta.
                        </Link>
                    </p>

                    <button type="submit" className="boton-guardar">
                        Guardar
                    </button>
                </form>
            </div>

            
        </div>
    );
};

export default Register;
