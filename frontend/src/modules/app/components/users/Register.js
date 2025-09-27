import React, { useState } from "react";
// OJO! Importa estilos definidos en CSS
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { appFetch, fetchConfig } from "../../../../backend/appFetch";
import Popup from "../common/Popup";
//import { config } from "../../../../config/constants.js"; //

//IMPORTANTE: kebab-case para las clases CSS (palabras-separadas-asi)


//Definición componente funcional (el que React renderiza como pantalla)
const Register = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    //DUDA: deberiamos dejar repetir la contraseña teniendo el ojo?
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();
    //handle = manejar, submit = evento de envío de un formulario
    const handleSubmit = () => {
        //CONECTAR CON BACKEND
        //trim elimina los espaciones en blanco (al inicio y al final)
        const user = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            password, //ya viene tal cual
        };

        appFetch(
            "/users/signUp",
            fetchConfig("POST", user),
            (data) => {
                console.log("Registro correcto:", data);
                navigate("/routines", { replace: true, state: { registered: true, email } });
            },
            (error) => {
                console.error("Error en el registro!", error);
                // alert(error?.globalError ?? "No se pudo realizar el registro");
            }
        );
    };

    // return = lo que hay que renderizar en pantalla
    return (
        // 1) Hacemos un div para agrupar todo dentro del recuadro del login
        <div className="contenedor">
            <div className="caja-login">
                {/*PONEMOS EL LOGO*/}
                <img
                    //src = atributo que indica la ruta de la imagen
                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                    //texto alternativo (se muestra solo si la imagen no se puede cargar)
                    //lo usan los lectores de pantalla (ACCESIBILIDAD)
                    alt="Logo medgym"
                    //para aplicar estilo CSS
                    className="logo"
                />

                {/*TÍTULO*/}
                <h2 className="titulo">Regístrate</h2>

                {/*FORMULARIO*/}
                {/*Cuando user pulse guardar, se ejecuta la funcion (handleSubmit)*/}
                <form className="form" onSubmit={(e) => {
                    e.preventDefault();
                    setShowPopup(true)
                }}>
                    {/*NOMBRE:*/}
                    <label htmlFor="name">Nombre</label>
                    <input
                        type="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Escriba aquí su nombre..."
                    />

                    {/*APELLIDOS:*/}
                    <label htmlFor="surname">Apellidos</label>
                    <input
                        type="surname"
                        id="surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                        placeholder="Escriba aquí sus apellidos..."
                    />

                    {/*CORREO:*/}
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Escriba aquí su email..."
                    />

                    {/*TELEFONO:*/}
                    <label htmlFor="phoneNumber">Teléfono</label>
                    <input
                        type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        placeholder="Escriba aquí su número de teléfono..."
                    />

                    {/*CONTRASEÑA*/}
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
                        <Link to="/" className="link-login">
                            Inicia sesión si ya tienes una cuenta.
                        </Link>
                    </p>

                    <button type="submit" className="boton-guardar">
                        Guardar
                    </button>
                </form>
            </div>

            <Popup text={"Usuario registrado con éxito"} show={showPopup} onOk={handleSubmit} />
        </div>
    );
};

export default Register;
