import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('expiresAt');
        navigate('/'); //back to login page
    }
    return (
        <div> 
            <h1>Spotify Stats</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default HomePage;