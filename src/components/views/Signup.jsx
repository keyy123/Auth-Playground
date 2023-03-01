import { useNavigate } from "react-router";
import { registerClientSide as Register } from "../../services/API";

const Signup = () => {
    const navigate = useNavigate();
    return (
        <form id="formRegister" onSubmit={(e) => {
            Register(e) 
            navigate("/login");
            }}>
            <fieldset>
                <label htmlFor="register_name">Name</label>
                <input placeholder="Name" id="register_name" required autoComplete="name" />
                
                <label htmlFor="register_email">Email</label>
                <input placeholder="Email" id="register_email" required autoComplete="username" />
               
                <label htmlFor="register_password">Your Password</label>
                <input type="password" id="register_password" required autoComplete="new-password" />
            </fieldset>
            <button>Submit</button>
            <a href="/login">Login</a>
        </form>
    )
}

export default Signup;