import { Navigate, Outlet } from "react-router-dom";
import {getServiceToken} from "../../../../backend/appFetch";

function RequiresAuthentication() {
    const token = getServiceToken();

    return !token ? <Outlet /> : <Navigate to="/routines" replace />;
}

export default RequiresAuthentication;
