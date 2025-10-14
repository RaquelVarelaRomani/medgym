//Rutas principales -> donde se decide que página mostrar según el URL
import React from "react";

import {Navigate, Route, Routes} from "react-router-dom";

import Register from "./users/Register";
import Login from "./users/Login";
import Profile from "./users/Profile";
import EditProfile from "./users/EditProfile";
import Routines from "./routines/Routines";
import RoutineDetails from "./routines/RoutineDetails";
import CreateRoutine from "./routines/CreateRoutine"
import Exercises from "./routines/Exercises";
import CreateExercise from "./routines/CreateExercise";
import EditRoutine from "./routines/EditRoutine";
import RequiresLogin from "./common/RequiresLogin";
import RequiresLogout from "./common/RequiresLogout";
import Layout from "./Layout";
import WorkoutHistory from "./workouts/WorkoutHistory";
import WorkoutDetails from "./workouts/WorkoutDetails";

const Body = () => {
    return (
        <Routes>
            <Route path="/"> {/*Todo lo que está dentro es relativo a la raíz*/}
                <Route path="/" element={<Navigate to="/users/login" />} />
                <Route element={<RequiresLogout />}>
                    <Route path="users/register" element={<Register />} />
                    <Route path="users/login" element={<Login />} />
                </Route>
                <Route element={<RequiresLogin />}>
                    <Route path="exercises" element={<Layout><Exercises /></Layout>} />
                    <Route path="routines" element={<Layout><Routines /></Layout>} />
                    <Route path="routines/new" element={<Layout><CreateRoutine /></Layout>} />
                    <Route path="routines/edit/:id" element={<Layout><EditRoutine /></Layout>} />
                    <Route path="routines/:id" element={<Layout><RoutineDetails /></Layout>} />
                    <Route path="exercises" element={<Layout><Exercises /></Layout>} />
                    <Route path="exercises/new" element={<Layout><CreateExercise /></Layout>} />
                    <Route path="users/profile" element={<Layout><Profile /></Layout>} />
                    <Route path="users/profile/edit-profile" element={<EditProfile isPasswordMode={false}/>} />
                    <Route path="users/profile/change-password" element={<EditProfile isPasswordMode={true}/>} />
                    <Route path="workouts/history" element={<Layout><WorkoutHistory /></Layout>} />
                    <Route path="workouts/:id" element={<Layout><WorkoutDetails /></Layout>} />
                    <Route path="*" element={<Navigate to="/routines" replace />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default Body;
