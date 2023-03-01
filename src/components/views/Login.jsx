import {loginClientSide, autoLogin} from "../../services/API";
import { useNavigate } from "react-router";
import GoogleOAuthButton from "../GoogleOAuthButton";

const LoginView = ({setUser, user}) => {    
    const navigate = useNavigate();
    console.log(user);
    return (
        <>
<button onClick={
    async e => {
        e.preventDefault();
        let userData = await autoLogin();
        console.log(userData);
        await setUser(userData);
        return user.isLoggedIn ? navigate("/") : null;
    }
    }>Auto Login</button>      
        <form id="formLogin" onSubmit={
            async (e) => {   
                let userData = await loginClientSide(e);
                await setUser(userData);
                return user.isLoggedIn ? navigate("/") : null
            }
        }>
            <fieldset>
                <label 
                    htmlFor="login_email"
                    >
                    Email
                </label>
                <input 
                    placeholder="email" 
                    id="login_email" 
                    required 
                    autoComplete="username" 
                    />
                <label htmlFor="login_password">Password</label>
                <input 
                    type="password" 
                    id="login_password" 
                    autoComplete="current-password"
                    />
                {/* <section hidden id="login_section_password">
                    <label htmlFor="login_password">Password</label>
                    <input type="password" id="login_password" autoComplete="current-password"/> 
                </section>   
               
                <section hidden id="login_section_webauthn">
                    <a href="#">Log in with your Authenticator</a>
                </section>   */}
            </fieldset>
           

            <button type="submit">Continute</button>   
            <p>
                <a href="/signup" className="navLink">Register a new account</a>    
            </p>   
            <GoogleOAuthButton user={user} setUser={setUser}/>
        </form>
        </>
    );
};


export default LoginView;