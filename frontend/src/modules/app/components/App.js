import React from "react";

//importa el HashRouter de esa librería para manejar navegación por URLs con hash
//le pone el alias de Router
import { HashRouter as Router } from "react-router-dom";

import Body from "./Body";

//definimos el componente App como una función flecha
// <Router> para que React sepa cómo manejar las rutas
const App = () => {
  return (
    <Router>
      <Body />
    </Router>
  );
};

export default App;
