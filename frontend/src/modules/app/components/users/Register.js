import React, { useState } from "react";
// OJO! Importa estilos definidos en CSS
import "./Register.css";
import { Link } from "react-router-dom";
// import { config } from "../../../../config/constants.js"; // ⚠️ Bórralo si no lo usas

// Declaración de la función rot13 (comentada correctamente)
/*
function rot13(s) {
  // devolverá el string con las letras reemplazadas según la regla
  return s.replace(
    /[A-Z]/gi,
    (c) =>
      "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm"[
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c)
      ]
    // en este cifrado se desplaza 13 posiciones cada letra
  );
}
*/


//IMPORTANTE: kebab-case para las clases CSS (palabras-separadas-asi)


// Definición componente funcional (el que React renderiza como pantalla)
const Register = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  //DUDA: deberiamos dejar repetir la contraseña teniendo el ojo?

  // handle = manejar, submit = evento de envío de un formulario
  const handleSubmit = (evento) => {
    evento.preventDefault(); // evitar que el formulario recargue la página por defecto
    console.log("Name:", name,"Surname:", surname,"Email:", email, "Password:", password);
    // CONECTAR CON EL BACKEND
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
        <form className="form" onSubmit={handleSubmit}>
          {/*NOMBRE:*/}
          {/*etiqueta*/}
          <label htmlFor="name">Nombre</label>
          {/*campo para escribir el nombre*/}
          <input
            type="name"
            id="name"
            value={name}
            //cada vez que el usuario escribe se cambia el nombre
            onChange={(e) => setName(e.target.value)}
            required //no permite enviar el formulario si esta vacio
            placeholder="Escriba aquí su nombre..."
          />

          {/*APELLIDOS:*/}
          {/*etiqueta*/}
          <label htmlFor="surname">Apellidos</label>
          {/*campo para escribir los apellidos*/}
          <input
            type="surname"
            id="surname"
            value={surname}
            //cada vez que el usuario escribe se cambian los apellidos
            onChange={(e) => setSurname(e.target.value)}
            required //no permite enviar el formulario si esta vacio
            placeholder="Escriba aquí sus apellidos..."
          />

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

          <p className="ir-a-login">
            {/*Podriamos poner texto aquí para que apareciera antes pero no queremos */}
            <Link to="/" className="link-login">
            Inicia sesión si ya tienes una cuenta.
            </Link>

          </p>


          {/*De tipo submit -> al hacer clic se dispara el evento */}
          <button type="submit" className="boton-guardar">
            Guardar {/*Texto visible DENTRO del boton */}
          </button>

        </form>


      </div>


    </div>
  );
};

export default Register;
