import React, { useEffect, useState } from 'react';
// import './Statistics.css';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const Statistics = () => {
    const [stats, setStats] = useState({ clientCount: 0 });

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(baseURI + 'api/statistics', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setStats(data);
        };
        fetchData();
    }, []);

    return (
        <div className="statistics">
            <h2>Statistiques</h2>
            <p>Nombre de clients: {stats.clientCount}</p>
        </div>
    );
};

export default Statistics;