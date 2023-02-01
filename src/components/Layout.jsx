import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({user, setUser, children}) => {
    return (
    <div className="layoutParent">
        <Navbar user={user} setUser={setUser}/>
        <div className="layoutChild">
            {children}
        </div>
        <Footer/>
    </div>
    )
}

export default Layout;