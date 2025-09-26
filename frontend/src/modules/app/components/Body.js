//Rutas principales -> donde se decide que página mostrar según el URL
import React from "react";

import { Route, Routes } from "react-router-dom";

import Register from "./users/Register";
import Home from "./users/Home";
import Routines from "./routines/Routines";
import Profile from "./users/Profile";
import EditProfile from "./users/EditProfile";
import Test from "./Test";

const Body = () => {
  return (
    <Routes>
      <Route path="/"> {/*Todo lo que está dentro es relativo a la raíz*/}
        <Route index exact element={<Home />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/test" element={<Test />} />
        <Route path="users/profile" element={<Profile />} />
        <Route path="users/profile/edit-profile" element={<EditProfile />} />
        <Route path="users/register" element={<Register />} /> {/*Añadi para la pantalla de registrarse */}
      </Route>
    </Routes>
  );
};

export default Body;
