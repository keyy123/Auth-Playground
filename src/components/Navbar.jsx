import { logout } from "../../services/API";

const Navbar = ({user, setUser}) => {
    function LogoutApp(){
        setUser(logout())
        console.log(user)
    }
    return (
        <nav className="navbar">
            <div className="logo-img">
                <img src="#" alt="logo"/>
            </div>
            <ul className="navlist">
                <li className="navlink">Link 1</li> 
                <li className="navlink">Link 2</li> 
                <li className="navlink">Link 3</li> 
            </ul>
            {
                user.account === null ?
                     ( 
                        <a href="/login" className="cta-btn">Login</a>
                    ) : (
                        <button  
                        className="cta-btn"
                        onClick={() => LogoutApp()}
                        > 
                        Logout
                        </button>
    
                    )
            }
        </nav>
    )
}

export default Navbar;