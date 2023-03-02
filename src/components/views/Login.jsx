import {loginClientSide, autoLogin, sendMagicLinkClientSide, extractMagicToken} from "../../services/API";
import { useNavigate } from "react-router";
import GoogleOAuthButton from "../GoogleOAuthButton";
import { useState } from "react";
// import { URLSearchParams } from "url";

const LoginView = ({setUser, user}) => {    
    const navigate = useNavigate();
    const [magicForm, setMagicForm] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const [message, setMessage] = useState("");
   
    function showMagicLinkForm(){    
      // Conditionally show the magic link form if a toggle is enabled
      // and hide the previous form 
        setMagicForm((prevState) => !prevState);
      // Allow User to enter their name and email  
    
      // Invoke the MagicLinkSend Function 
    
      // Send them to their email - with a rel="noopener"
    
      // They return to accounts and if JWT is validated redirect to login with 
      // the home page with the user props given (name, email, etc.)
      return  alert('I\'ve been clicked, gah!!')
    }
    let jwt = window.location.search;
    let URLParams = new URLSearchParams(jwt);
    let jwtString = URLParams.has("jwt");
    console.log(jwtString)
    return (
     <div className="form-container">   
        <form id="formLogin" className="form" onSubmit={
            async (e) => {   
                    e.preventDefault();
                    console.log(jwtString);
                    // if(jwtString){
                    //      console.log("there is a JWT in URL")
                    //      await setUser(await extractMagicToken(e));
                    // }
                    // else{
                        console.log("no url params");
                        await setUser(await loginClientSide(e));
                    // }
                    console.log(user)
                    return user.isLoggedIn ? navigate("/") : null
                }
            }>
               {!magicForm && !jwtString && message.length === 0 && <>
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
            <button className ="auto-login-btn" 
                onClick={
                async e => {
                    e.preventDefault();
                    let userData = await autoLogin();
                    console.log(userData);
                    await setUser(userData);
                    return user.isLoggedIn ? navigate("/") : null;
                }}>
                    Auto Login
            </button>
            </>
            }
            {magicForm && !messageSent && message.length === 0 && (      
                <>       
                    <p>
                    <label htmlFor="magic_name">
                        Name:
                    </label>
                    <input 
                        type="text" 
                        id="magic_name"
                        autoComplete="name"
                    />
                </p>
                <p>
                    <label htmlFor="magic_email">
                        Email: 
                    </label>
                    <input
                        type="magic_email"
                        required
                        autoComplete="username"
                        id="magic_email"
                    />
                </p>
                <button className="magicBtn" onClick={
                    async (e) => {
                        alert("magic")
                        const {msg} = await sendMagicLinkClientSide(e);
                        setMessage(msg); // msg from API
                        setMessageSent(true); 
                        console.log(msg, message)
                    }
                    }>Magic</button>
                </>
               )}
               {magicForm && messageSent && message.length > 0 && (
                <>
                    <p>{message}</p>
                </>
               )}
               {!magicForm && jwtString && message.length === 0 && (
                <>
                   <button type="submit" onClick={async (e) => {
                    e.preventDefault();
                    setUser(await extractMagicToken(e));
                    user && user.isLoggedIn ? navigate("/") : null;
                   }}>Magic Login</button>
                </>
                   )
               }
        </form>
        </div>
    );
};


export default LoginView;