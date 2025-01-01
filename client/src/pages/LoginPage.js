import React from 'react';
import '../styles/login.css'; //css for styling

const LoginPage = () => {
    const handleLogin = () => {
        //redirect user to backend login route
        window.location.href = 'http://localhost:5000/login';
    };

    return (
        
            <div className="login-container">
                <div className="header">
                    <h1>Welcome to |placeholder name|</h1>
                </div>
                <div className="description">
                    <p>|placeholder description|</p>
                </div>
                <div className="login-button-container">
                    <button className="login-button" onClick={handleLogin}>
                        Login with Spotify
                    </button>
                </div>
            </div>
    );
};

export default LoginPage;


