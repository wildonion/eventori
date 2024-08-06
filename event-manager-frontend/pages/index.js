// pages/index.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import LoginButton from '../components/LoginButton';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isEventManager, setIsEventManager] = useState(false);
    const [managerEvents, setManagerEvents] = useState([]);
    const [registrationStatus, setRegistrationStatus] = useState({});
    const [userId, setUserId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [unverifiedEvents, setUnverifiedEvents] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            const decodedUserId = getUserIdFromToken(token);
            setUserId(decodedUserId);
            axios.get('http://localhost:3001/api/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => setEvents(response.data))
                .catch(error => console.error('Error fetching events:', error));

            axios.get(`http://localhost:3001/api/users/${decodedUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    const user = response.data;
                    if (user.em) {
                        setIsEventManager(true);
                        axios.get('http://localhost:3001/api/events/manager/all', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                            .then(response => setManagerEvents(response.data))
                            .catch(error => console.error('Error fetching manager events:', error));
                    }
                    if (user.is_admin) {
                        setIsAdmin(true);
                        axios.get('http://localhost:3001/api/unverified-events', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                            .then(response => setUnverifiedEvents(response.data))
                            .catch(error => console.error('Error fetching unverified events:', error));

                        axios.get('http://localhost:3001/api/users', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                            .then(response => setUsers(response.data.filter(u => !u.is_admin)))
                            .catch(error => console.error('Error fetching users:', error));
                    }
                })
                .catch(error => console.error('Error fetching user data:', error));
        } else {
            axios.get('http://localhost:3001/api/events')
                .then(response => setEvents(response.data.filter(event => event.is_verified)))
                .catch(error => console.error('Error fetching events:', error));
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && events.length > 0) {
            const decodedUserId = getUserIdFromToken(token);
            events.forEach(event => {
                axios.post(`http://localhost:3001/api/events/${event.id}/isRegistered`, { userId: decodedUserId }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(response => {
                    setRegistrationStatus(prevState => ({
                        ...prevState,
                        [event.id]: response.data.isRegistered
                    }));
                })
                .catch(error => console.error('Error checking registration status:', error));
            });
        }
    }, [events]);

    const handleJoinEvent = (eventId) => {
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:3001/api/events/${eventId}/register`, { userId }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully registered for event', response.data);
            setRegistrationStatus(prevState => ({
                ...prevState,
                [eventId]: true
            }));
        })
        .catch(error => {
            console.error('Error registering for event:', error);
        });
    };

    const handleLeaveEvent = (eventId) => {
        if (!window.confirm("You're leaving the event. Are you sure?")) {
            return;
        }
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:3001/api/events/${eventId}/unregister`, { userId }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully unregistered for event', response.data);
            setRegistrationStatus(prevState => ({
                ...prevState,
                [eventId]: false
            }));
        })
        .catch(error => {
            console.error('Error unregistering for event:', error);
        });
    };

    const handleDeleteEvent = (eventId) => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:3001/api/events/${eventId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully deleted event', response.data);
            setManagerEvents(managerEvents.filter(event => event.id !== eventId));
        })
        .catch(error => {
            console.error('Error deleting event:', error);
        });
    };

    const handleUpdateEvent = (updatedEvent) => {
        const token = localStorage.getItem('token');
        axios.put(`http://localhost:3001/api/events/${updatedEvent.id}`, updatedEvent, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully updated event', response.data);
            setManagerEvents(managerEvents.map(event => event.id === updatedEvent.id ? response.data : event));
        })
        .catch(error => {
            console.error('Error updating event:', error);
        });
    };

    const handleLockEvent = (eventId) => {
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:3001/api/events/${eventId}/lock`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully locked event', response.data);
            setManagerEvents(managerEvents.map(event => event.id === eventId ? { ...event, is_locked: true } : event));
        })
        .catch(error => {
            console.error('Error locking event:', error);
        });
    };

    const handleUnlockEvent = (eventId) => {
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:3001/api/events/${eventId}/unlock`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully unlocked event', response.data);
            setManagerEvents(managerEvents.map(event => event.id === eventId ? { ...event, is_locked: false } : event));
        })
        .catch(error => {
            console.error('Error unlocking event:', error);
        });
    };

    const handleVerifyEvent = (eventId) => {
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:3001/api/verify-event/${eventId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully verified event', response.data);
            setUnverifiedEvents(unverifiedEvents.filter(event => event.id !== eventId));
            setEvents([...events, response.data]);
        })
        .catch(error => {
            console.error('Error verifying event:', error);
        });
    };

    const handleMakeEventManager = (userId) => {
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:3001/api/users/${userId}/make-event-manager`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully updated user role', response.data);
            setUsers(users.map(user => user.id === userId ? { ...user, em: true } : user));
        })
        .catch(error => {
            console.error('Error updating user role:', error);
        });
    };

    const handleDowngradeUser = (userId) => {
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:3001/api/users/${userId}/downgrade`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Successfully updated user role', response.data);
            setUsers(users.map(user => user.id === userId ? { ...user, em: false } : user));
        })
        .catch(error => {
            console.error('Error updating user role:', error);
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserId(null);
    };

    const getUserIdFromToken = (token) => {
        if (!token) return null;
        const decoded = jwtDecode(token); // Use jwtDecode to decode the token
        return decoded ? decoded.id : null;
    };

    return (
        <div>
            <header className="header">
                <h1 className="header-title">Live Events</h1>
                {isLoggedIn && (
                    <div className="header-buttons">
                        {isEventManager && (
                            <Link href="/create-event">
                                <button className="create-event-button">Create Event</button>
                            </Link>
                        )}
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </div>
                )}
            </header>
            {isLoggedIn ? (
                <div>
                    {isAdmin && (
                        <div>
                            <h2>Unverified Events</h2>
                            <div className="events-container">
                                {unverifiedEvents.map(event => (
                                    <EventCard 
                                        key={`unverified-${event.id}`} // Add a unique key prefix
                                        event={event} 
                                        isLoggedIn={isLoggedIn} 
                                        onVerify={() => handleVerifyEvent(event.id)} 
                                        isAdmin={isAdmin}
                                    />
                                ))}
                            </div>
                            <h2>All Users</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.em ? 'Event Manager' : 'Normal User'}</td>
                                            <td>
                                                {user.em ? (
                                                    <button onClick={() => handleDowngradeUser(user.id)}>Downgrade to User</button>
                                                ) : (
                                                    <button onClick={() => handleMakeEventManager(user.id)}>Make Event Manager</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {isEventManager && (
                        <div>
                            <h2>My Events</h2>
                            <div className="events-container">
                                {managerEvents.map(event => (
                                    <EventCard 
                                        key={`manager-${event.id}`} // Add a unique key prefix
                                        event={event} 
                                        isLoggedIn={isLoggedIn} 
                                        onJoin={() => handleJoinEvent(event.id)} 
                                        onLeave={() => handleLeaveEvent(event.id)} 
                                        onDelete={() => handleDeleteEvent(event.id)} 
                                        onUpdate={(updatedEvent) => handleUpdateEvent(updatedEvent)} 
                                        onLock={() => handleLockEvent(event.id)} 
                                        onUnlock={() => handleUnlockEvent(event.id)} 
                                        isRegistered={true} 
                                        isEventManager={isEventManager}
                                        userId={userId}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <h2>All Events</h2>
                    <div className="events-container">
                        {events.map(event => (
                            <EventCard 
                                key={`event-${event.id}`} // Add a unique key prefix
                                event={event} 
                                isLoggedIn={isLoggedIn} 
                                onJoin={() => handleJoinEvent(event.id)} 
                                onLeave={() => handleLeaveEvent(event.id)} 
                                isRegistered={registrationStatus[event.id]} 
                                isEventManager={event.manager_id === userId}
                                userId={userId}
                                onLock={() => handleLockEvent(event.id)}
                                onUnlock={() => handleUnlockEvent(event.id)}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="events-container">
                        {events.filter(event => event.is_verified).map(event => (
                            <EventCard key={`event-${event.id}`} event={event} isLoggedIn={isLoggedIn} isRegistered={false} />
                        ))}
                    </div>
                    <p>You must be logged in to participate in events</p>
                    <LoginButton />
                    <p>Don't have an account? <Link href="/signup">Signup</Link></p>
                </div>
            )}
            <style jsx>{`
                .header {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: rgba(255, 255, 255, 0.9);
                    padding: 10px 20px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                    transition: background-color 0.3s;
                }
                .header-title {
                    font-size: 24px;
                    font-weight: bold;
                }
                .header-buttons {
                    display: flex;
                    gap: 10px;
                }
                .events-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    padding: 20px;
                }
                .logout-button {
                    background-color: #ff0000; /* Make the logout button red */
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .create-event-button {
                    background-color: #0070f3;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    cursor: pointer;
                    border-radius: 4px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                table, th, td {
                    border: 1px solid #ccc;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
            `}</style>
        </div>
    );
};

export default Home;
