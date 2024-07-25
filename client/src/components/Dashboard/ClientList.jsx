import React, { useEffect, useState } from 'react';
// import './ClientList.css';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const ClientList = () => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            console.log('Token being sent:', token); // Ajoutez cette ligne
            try {
                const response = await fetch(baseURI + 'api/clients', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Response status:', response.status); // Ajoutez cette ligne
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error); // Modifiez cette ligne
                }
                const data = await response.json();
                console.log('Fetched clients:', data); // Ajoutez cette ligne
                setClients(data);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(baseURI + `api/clients/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error); // Modifiez cette ligne
            }
            setClients(clients.filter(client => client.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="client-list">
            <h2>Liste des clients</h2>
            <ul>
                {clients.map(client => (
                    <li key={client.id}>
                        {client.firstname} {client.lastname} ({client.email})
                        <button onClick={() => handleDelete(client.id)}>Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClientList;
