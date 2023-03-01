import {loginClientSide, autoLogin} from "../../services/API";
import { useNavigate } from "react-router";
import GoogleOAuthButton from "../GoogleOAuthButton";
// import { useRef } from "react";

const LoginView = ({setUser, user}) => {    
    const navigate = useNavigate();
    // const formRef = useRef();
    console.log(user);
    return (
        <div className="form-container">   
        <form id="formLogin" className="form" onSubmit={
            async (e) => {   
                let userData = await loginClientSide(e);
                await setUser(userData);
                return user.isLoggedIn ? navigate("/") : null
            }
        }>
            {/* <fieldset> */}
                <p>
                <label 
                    htmlFor="login_email"
                    className="email"
                    >
                    Email
                </label>
                <input 
                    placeholder="email" 
                    id="login_email"
                    // className="login_email_input" 
                    required 
                    autoComplete="username" 
                    />
                </p>
                <p>
                <label 
                    htmlFor="login_password"
                    className="login_password_input"
                    >
                    Password
                </label>
                <input 
                    type="password" 
                    id="login_password" 
                    autoComplete="current-password"
                    />
                </p>
                
                
                {/* <section hidden id="login_section_password">
                    <label htmlFor="login_password">Password</label>
                    <input type="password" id="login_password" autoComplete="current-password"/> 
                </section>   
               
                <section hidden id="login_section_webauthn">
                    <a href="#">Log in with your Authenticator</a>
                </section>   */}
            {/* </fieldset> */}
           

            <button type="submit">Continute</button>   
            <p>
                <a href="/signup" className="navLink">Register a new account</a>    
            </p>   
            <div className="authBtn">
                <GoogleOAuthButton user={user} setUser={setUser}/>
            </div>
            <button onClick={() => showMagicLinkForm()}>
                Magic Link (Email)
            </button>
            <button className ="auto-login-btn" onClick={
    async e => {
        e.preventDefault();
        let userData = await autoLogin();
        console.log(userData);
        await setUser(userData);
        return user.isLoggedIn ? navigate("/") : null;
    }
    }>Auto Login</button>   
        </form>
        </div>
    );
};

function showMagicLinkForm(){
  // Locate the form elements on the DOM 

  // Conditionally show the magic link form if a toggle is enabled
  // and hide the previous form 

  // Allow User to enter their name and email  

  // Invoke the MagicLinkSend Function 

  // Send them to their email - with a rel="noopener"

  // They return to accounts and if JWT is validated redirect to login with 
  // the home page with the user props given (name, email, etc.)
  return  alert('I\'ve been clicked, gah!!')
}

export default LoginView;