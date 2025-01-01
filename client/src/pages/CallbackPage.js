import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CallbackPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const expiresIn = urlParams.get('expires_in');

        if (token && expiresIn) {
            const expiresAt = Date.now() + parseInt(expiresIn) * 1000;
            localStorage.setItem('accessToken', token); //save token
            localStorage.setItem('expiresAt', expiresAt);
            navigate('/home'); //redirect to home page
        }
    }, [navigate]);

    return <div>Loading...</div>
};

export default CallbackPage;