import React, { useState, useEffect } from "react";
//OJO! Importa estilos definidos en CSS
import "../App.css";
import { config } from "../../../../config/constants.js";
import { Link } from "react-router-dom";

//declaracion de la funcion rot13
function rot13(s) {
  //devolverá el string con las letras reemplazadas según la regla
  return s.replace(
    /[A-Z]/gi,
    (c) =>
      "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm"[
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c)
      ]
      //en este cifrado se desplaza 13 posiciones cada letra
  );
}

//definicion componente funcional (el que react renderiza como pantalla)
const Home = () => {
  const [message, setMessage] = useState("");
  const [someText, setSomeText] = useState("Sreenzragnf");
  const [answer, setAnswer] = useState(null);

  //efecto que se ejecuta autimaticamente al entrar en la pagina
  useEffect(() => {
    //HTTP al backend (/medgym/api/hello)
    fetch(config.BASE_PATH + "/hello")
    //convierte la respuesta del backend en texto
      .then((response) => response.text())
      //guarda el texto en la variable message
      .then((error) => {
        setMessage(error);
      });
  }, []);

  //declara una funcion (se ejecutara al enviar el formulario)
  const onSubmit = (ev) => {
    //evita que el formulario recargue la pagina
    ev.preventDefault();
    setAnswer(rot13(someText));
  };

  return (
    //contenedor al que se le aplica el estilo definido en CSS bajo la clase .App
    <div className="App">
        <header className="App-header">
            <img //MUESTRA EL LOGO DE LA APP
                src={process.env.PUBLIC_URL + "/assets/logo.svg"} //mostrar logo desde la public/assets
                className="App-logo" //clase CSS para que gire
                alt="logo" //texto alternativo
            />
            {/* TÍTULO PRINCIPAL de la cabecera */}
            <h1 className="App-title">Welcome to MG</h1> 
            {/* BOTONES LOG IN Y SING UP */}
            <div className="App-auth-buttons">
                <Link to="/users/login">
                    <button className="btn-login">Login</button>
                </Link>
                <Link to="/users/signUp">
                    <button className="btn-signup">Sign Up</button>
                </Link>
            </div>
        </header> {/* Cierra la cabecera */}


        {/* Texto de ejemplo */}
        <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
        </p>


      {/* Enlace */}
        <p>
            <Link to="test">App route</Link>
        </p>
        <form action="" onSubmit={onSubmit}>
            <p>
                <label htmlFor="some-text">Input some text: </label>
                <input
            name="some-text"
            id="some-text"
            value={someText}
            onChange={(ev) => setSomeText(ev.currentTarget.value)}
          />
        </p>
        <button>Calculate</button>
      </form>

      {/* El calcula*/}
      {answer && (
        <p>
          The answer is: <strong>{answer}</strong>
        </p>
      )}
    </div>
  );
};

export default Home;
