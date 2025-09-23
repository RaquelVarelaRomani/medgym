//Rutas principales -> donde se decide que página mostrar según el URL
import React from "react";

import { Route, Routes } from "react-router-dom";


import Home from "./users/Home";
import Routines from "./routines/Routines";
import RoutineDetails from "./routines/RoutineDetails";
import Test from "./Test";
import Register from "./users/Register";

const Body = () => {
  return (
    <Routes>
      <Route path="/"> {/*Todo lo que está dentro es relativo a la raíz*/}
        <Route index exact element={<Home />} />
        <Route path="routines/routines" element={<Routines />} /> 
        <Route path="routines/:id" element={<RoutineDetails />} />
        <Route path="/test" element={<Test />} />
        <Route path="users/register" element={<Register />} /> {/*Añadi para la pantalla de registrarse */}
      </Route>
    </Routes>
  );
};

export default Body;
