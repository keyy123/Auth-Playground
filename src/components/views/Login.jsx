import { loginClientSide as LoginFxn } from "../../../services/API";
import { useNavigate } from "react-router";

const LoginView = ({setUser, user}) => {
    const navigate = useNavigate();
    return (
        <form id="formLogin" onSubmit={async (e) => {
            let userData = await LoginFxn(e);
            setUser(userData)
            user && user.account ? navigate("/") : e.preventDefault();
        }}>
            <fieldset>
                <label htmlFor="login_email">Email</label>
                <input placeholder="email" id="login_email" required autoComplete="username"/>
                <label htmlFor="login_password">Password</label>
                <input type="password" id="login_password" autoComplete="current-password"/>
                {/* <section hidden id="login_section_password">
                    {/* <label htmlFor="login_password">Password</label>
                    <input type="password" id="login_password" autoComplete="current-password"/> 
                </section>   
                */}
                {/* <section hidden id="login_section_webauthn">
                    <a href="#">Log in with your Authenticator</a>
                </section>   */}
            </fieldset>
            <button>Continute</button>         
            <p>
                <a href="/register" className="navLink">Register a new account</a>    
            </p>   
        </form>
    );
};

export default LoginView;