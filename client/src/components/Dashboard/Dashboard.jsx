import React from 'react';
import { useNavigate } from 'react-router-dom';
// import './DashboardPage.css';

const DashboardPage = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
        }
    }, [navigate]);

    return (
        <div className="dashboard">
            <h1>Tableau de Bord</h1>
            <p>Bienvenue sur le tableau de bord. Ici, vous pouvez voir les statistiques et gérer les clients.</p>
        </div>
    );
};

export default DashboardPage;
