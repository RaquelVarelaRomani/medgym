import React, { useState } from "react";
import { login } from "../../../../backend/userService";
// OJO! Importa estilos definidos en CSS
import "./Home.css";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

// import { config } from "../../../../config/constants.js"; //

import { appFetch, fetchConfig, setServiceToken } from "../../../../backend/appFetch";


//IMPORTANTE: kebab-case para las clases CSS (palabras-separadas-asi)


// Definición componente funcional (el que React renderiza como pantalla)
const Home = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  // handle = manejar, submit = evento de envío de un formulario
  const handleSubmit = (evento) => {
    evento.preventDefault(); // evitar que el formulario recargue la página por defecto

    
    //LLAMO AL BACKEND
    appFetch(
      //primer argumento
      "/users/login", /*endpoint (BASE_PATH añade el resto) */
      //segundo (las opciones de la peticion)
      fetchConfig("POST", { email, password }),
      //tercero (peticion que se ejecuta si la respuesta es correcta)
      (data) => { 
        //MUESTRA POR CONSOLA LO QUE DEVUELVE EL BACKEND -> CAMBIAR
        console.log("Login correcto:", data);

        if (data.token) {
          //Si el backend dio un token se guarda
          setServiceToken(data.token);
        }

        
        navigate("/routines");
      },
      (error) => { 
        console.error("Error en login:", error);
        setError("Usuario o contraseña incorrectos");
      }
    )

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
        <h2 className="titulo">Inicia sesión</h2>

        {/* MENSAJE DE ERROR */}
        {error && <p className="mensaje-error">{error}</p>}


        {/*FORMULARIO*/}
        {/*Cuando user pulse entrar, se ejecuta la funcion (handleSubmit)*/}
        <form className="form" onSubmit={handleSubmit}>

          {/*CORREO:*/}
          {/*etiqueta*/}
          <label htmlFor="email">Correo electrónico</label>
          {/*campo para escribir el email*/}
          <input
            type="email"
            id="email"
            value={email}
            //cada vez que el usuario escribe se cambia el email
            onChange={(e) => setEmail(e.target.value)}
            required //no permite enviar el formulario si esta vacio
            placeholder="Escriba aquí su email..."
          />


          {/*CONTRASEÑA*/}
          <label htmlFor="password">Contraseña</label>
          {/*Contenedor para la contraseña porque tambien queremos poner el ojo*/}
          <div className="contenedor-password">

            <input
            //si showPassword es true...
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              //Cada vez que el usario escribe -> SE ACTUALIZA
              onChange={(e) => setPassword(e.target.value)}
              //obligatorio rellenar la contraseña
              required
              placeholder="Escriba aquí su contraseña..."
            />



            {/*PARA APLICAR ESTILOS O EVENTOS a algo pequeño YA DENTRO DE UN BLOQUE*/}
            {/*mirar si por ACCESIBILIDAD es mejor -> button type="button" */}
            <span
              className="ver-password"
              //al hacer clic en el ojo cambia el estado de ShowPassword
              onClick={() => setShowPassword(!showPassword)}
            >
              &#128065;
              {/*Esto es un carácter estándar Unicode-> MIRAR DE HACERLO CON LIBRERIAS*/}
            </span>

          </div>

          <p className="ir-a-registrarse">
            {/*Podriamos poner texto aquí para que apareciera antes pero no queremos */}
            <Link to="/users/register" className="link-registrarse">
            Regístrate si todavía no tienes una cuenta.
            </Link>

          </p>


          {/*De tipo submit -> al hacer clic se dispara el evento */}
          <button type="submit" className="boton-entrar">
            Entrar {/*Texto visible DENTRO del boton */}
          </button>

        </form>

      </div>


    </div>
  );
};

export default Home;
