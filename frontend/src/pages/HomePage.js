import React, { useEffect, useState } from 'react';
import '../styles/home.css'; //style file
import { useLocation, useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [timeRange, setTimeRange] = useState('long_term');
    const [userData, setUserData] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        //check for token in url
        const searchParams = new URLSearchParams(location.search);
        const tokenFromURL = searchParams.get('token');

        if (tokenFromURL) {
            //store in localStorage
            localStorage.setItem('accessToken', tokenFromURL);
            navigate('/home', { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          // If no token in localStorage, possibly redirect to '/' or just skip fetch
          console.warn('No access token found in localStorage. Please log in.');
          return;
        }

        fetch(`http://localhost:5000/user-stats?time_range=${timeRange}&token=${accessToken}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user stats');
                }
                return response.json();
            })
            .then((data) => setUserData(data))
            .catch((error) => console.error('Error fetching user stats:', error));
        }, [timeRange]);

    const handleLogout = () => {
        const accessToken = localStorage.getItem('accessToken');
        //pass token to logout endpoint
        fetch(`http://localhost:5000/logout?token=${accessToken}`)
            .then(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('expiresAt');
                //redirect to login page
                window.location.href = '/';
        });

    }

    return (
        <div className="home-container">
            <h1 className="title">Welcome to Your Spotify Stats</h1>

            {userData ? (
                <>
                {/* Profile Section */}
                <div className="stats-container">
                    <div className="profile">
                        <img
                            src={userData.profilePicture}
                            alt="Profile"
                            className="profile-picture"
                        />
                    </div>
                </div>

                {/*Time Range Dropdown */}
                <div className="time-range-selector">
                    <label htmlFor="time-range">View stats for:</label>
                    <select
                        id="time-range"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="long_term">All Time</option>
                        <option value="medium_term">Last 6 Months</option>
                        <option value="short_term">Last 4 Weeks</option>
                    </select>
                </div>

                {/* Top Artists and Tracks */}
                <div className="columns">
                    <div className="column">
                        <h3>Top 10 Artists</h3>
                        <ul>
                            {userData.artists.map((artist,index) => (
                                <li key={index} className="artist-item">
                                    <img
                                        src={artist.image}
                                        alt={artist.name}
                                        className="artist-image"
                                    />
                                    <span>{artist.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="column">
                        <h3>Top 10 Tracks</h3>
                        <ul>
                            {userData.tracks.map((track,index) => (
                                <li key={index} className="track-item">
                                    <img
                                        src={track.image}
                                        alt={track.name}
                                        className="track-image"
                                    />
                                    <span> 
                                        {track.name} by {track.artist}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </>
            ) : (
                <p>Loading your stats...</p>
            )}
        </div>
    );
};

export default HomePage;