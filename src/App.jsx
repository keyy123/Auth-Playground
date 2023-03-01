import { useState } from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './components/Home';
import "./styles/style.css";
import Login from './components/views/Login';
import Signup from './components/views/Signup';
import Clean from './components/views/Clean';


const App = () => {
    const [user, setUser] = useState({});
    
    return (
        <GoogleOAuthProvider clientId={`${import.meta.env.VITE_CLIENT_ID}`}>
            <BrowserRouter>
                <Routes>
                    <Route path="/clean" element={<Clean user={user} setUser={setUser}/> } />
                    <Route path="/signup" element={<Signup />}/>
                    <Route path="/login" element={<Login user={user} setUser={setUser}/>}/>
                    <Route path="/" element={<Home user={user} setUser={setUser}/>} />
                </Routes>
            </BrowserRouter>
         </GoogleOAuthProvider>
    )
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App/>)