import React, { useState, useEffect } from 'react';

const Api = () => {
    const [message, setMessage] = useState('Loading...');

    useEffect(() => {
        fetch('/api') // This fetches data from the backend
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
            .catch((error) => setMessage('Error connecting to backend'));
    }, []);

    return (
        <div>
            <h1>Backend Response</h1>
            <p>{message}</p>
        </div>
    );
};

export default Api;
