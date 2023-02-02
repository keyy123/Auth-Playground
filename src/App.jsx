import { useState } from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import "./styles/style.css";
import Login from './components/views/Login';
import Signup from './components/views/Signup';
import Clean from './components/views/Clean';

const App = () => {
    const [user, setUser] = useState({});
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/clean' element={user ? <Clean user={user}/> : <Login setUser={setUser}/> } />
                <Route path="/signup" element={Object.keys(user).length !== 0 ? <Home user={user}/> : <Signup/>}/>
                <Route path="/login" element={<Login user={user} setUser={setUser}/>}/>
                <Route path="/" element={<Home user={user} setUser={setUser}/>} />
            </Routes>
        </BrowserRouter>
    )
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App/>)