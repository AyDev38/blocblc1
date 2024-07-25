import React from 'react';
import { useNavigate } from 'react-router-dom';
import Statistics from './Statistics';
import ClientList from './ClientList';
// import './DashboardPage.css';

const DashboardPage = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        console.log('Token from localStorage:', token); // Ajoutez cette ligne pour déboguer
        console.log('Role from localStorage:', role); // Ajoutez cette ligne pour déboguer
        if (!token || role !== 'admin') {
            console.log('Redirection to auth due to missing/invalid token or role');
            navigate('/auth');
        }
    }, [navigate]);

    return (
        <div className="dashboard">
            <h1>Tableau de Bord</h1>
            <Statistics />
            <ClientList />
            <p>Bienvenue sur le tableau de bord. Ici, vous pouvez voir les statistiques et gérer les clients.</p>
        </div>
    );
};

export default DashboardPage;