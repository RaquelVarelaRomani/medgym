import { Navigate, Outlet } from "react-router-dom";
import {getServiceToken} from "../../../../backend/appFetch";

function RequiresLogin() {
    const token = getServiceToken();

    return token ? <Outlet /> : <Navigate to="/users/login" replace />;
}

export default RequiresLogin;
