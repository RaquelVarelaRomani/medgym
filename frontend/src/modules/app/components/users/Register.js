import React, { useState} from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import Popup from "../common/Popup";
import {signUp} from "../../../../backend/userService";

const Register = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = () => {
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
                setShowPopup(true);
            },
            (error) => {
                setError(true);
                console.error("Error en el registro:", error);
            },
            () => navigate("/users/login")
        );
    };

    return (
        <div className="contenedor">
            <div className="caja-login">
                <img
                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                    alt="Logo medgym"
                    className="logo"
                />

                <h2 className="titulo">Regístrate</h2>

                {error && <p className="mensaje-error">Correo electrónico o teléfono ya existe</p>}

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

            <Popup text={"Usuario registrado con éxito"} show={showPopup} onOk={() => {
                setShowPopup(false);
                navigate("/routines", { replace: true, state: { registered: true, email } });
            }} />
        </div>
    );
};

export default Register;
