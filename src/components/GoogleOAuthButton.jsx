import { GoogleLogin } from "@react-oauth/google";
import { GoogleAuthClientSide } from "../services/API";
import { useNavigate } from "react-router";

const GoogleOAuthButton = ({user, setUser}) => {
    const navigate = useNavigate();
return (
    // <fieldset>
    //     <div 
    //         id="g_id_onload"
    //         data-client_id="625419452458-p45jdk99ugm7tvdb8p5v2j2rgiikdjq1.apps.googleusercontent.com"
    //         data-context="signin"
    //         data-ux_mode="popup"
    //         data-callback="GoogleAuth"
    //         data-itp_support="true"
    //         >
    //     </div>
    //     <div 
    //         class="g_id_signin"
    //         data-type="standard"
    //         data-shape="rectangular"
    //         data-theme="filled_blue"
    //         data-text="continue_with"
    //         data-size="large"
    //         data-logo_alignment="left"
    //         >
    //     </div>
    // </fieldset>
    <GoogleLogin
        onSuccess={async data => {
            let res = await GoogleAuthClientSide(data);
            setUser(res);
            return user.isLoggedIn ? navigate("/") : null;
        }}
        onError={() => {
            console.log('Login Failed');
        }}
        type="standard"
        theme="outline"
        shape="rectangular"
        width="1200px"
        size="large"
    />
    );
}

export default GoogleOAuthButton;