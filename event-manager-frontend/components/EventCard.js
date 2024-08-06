// components/EventCard.js
import { useState } from 'react';

const EventCard = ({ event, isLoggedIn, isRegistered, onJoin, onLeave, onDelete, onUpdate, onLock, onUnlock, onVerify, isEventManager, isAdmin, userId }) => {
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            onDelete();
        }
    };

    const handleUpdate = () => {
        setShowUpdateModal(true);
    };

    const handleLock = () => {
        if (window.confirm(`Are you sure you want to ${event.is_locked ? 'unlock' : 'lock'} this event?`)) {
            event.is_locked ? onUnlock() : onLock();
        }
    };

    return (
        <div className={`event-card ${event.is_finished ? 'finished' : ''}`}>
            <h2>{event.name}</h2>
            <p>{event.description}</p>
            <p>Location: {event.location}</p>
            <p>Start Time: {new Date(event.start_time).toLocaleString()}</p>
            <p>End Time: {new Date(event.end_time).toLocaleString()}</p>
            <p>Status: {event.is_finished ? 'Closed' : event.is_locked ? 'Locked' : 'Open'}</p>
            {isAdmin && (
                <div>
                    <p>Event Manager: {event.manager_username} (ID: {event.manager_id})</p>
                </div>
            )}
            {isLoggedIn && !isAdmin && !isEventManager && !event.is_finished && !event.is_locked && (
                isRegistered ? (
                    <button onClick={onLeave}>Leave Event</button>
                ) : (
                    <button onClick={onJoin}>Participate</button>
                )
            )}
            {isEventManager && (
                <>
                    {!event.is_finished && (
                        <>
                            <button onClick={handleUpdate} className="update-button">Update Event</button>
                            <button onClick={handleLock} className="lock-button">{event.is_locked ? 'Unlock Event' : 'Lock Event'}</button>
                        </>
                    )}
                    <button onClick={handleDelete} className="delete-button">Delete Event</button>
                </>
            )}
            {isAdmin && !event.is_verified && (
                <button onClick={onVerify} className="verify-button">Verify Event</button>
            )}
            {showUpdateModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Update Event</h2>
                        <input
                            type="text"
                            placeholder="Event Name"
                            defaultValue={event.name}
                            onChange={(e) => event.name = e.target.value}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            defaultValue={event.description}
                            onChange={(e) => event.description = e.target.value}
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            defaultValue={event.location}
                            onChange={(e) => event.location = e.target.value}
                        />
                        <input
                            type="datetime-local"
                            placeholder="Start Time"
                            defaultValue={event.start_time}
                            onChange={(e) => event.start_time = e.target.value}
                        />
                        <input
                            type="datetime-local"
                            placeholder="End Time"
                            defaultValue={event.end_time}
                            onChange={(e) => event.end_time = e.target.value}
                        />
                        <button onClick={() => { onUpdate(event); setShowUpdateModal(false); }}>Update</button>
                        <button onClick={() => setShowUpdateModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
            <style jsx>{`
                .event-card {
                    border: 1px solid #ccc;
                    padding: 20px;
                    border-radius: 4px;
                    width: 300px;
                    margin-bottom: 20px;
                }
                button {
                    margin: 5px;
                    padding: 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .update-button {
                    background-color: #0070f3;
                    color: white;
                }
                .lock-button {
                    background-color: #ffa500;
                    color: white;
                }
                .delete-button {
                    background-color: #ff0000;
                    color: white;
                }
                .verify-button {
                    background-color: #28a745;
                    color: white;
                }
                .finished {
                    background-color: #f0f0f0;
                }
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                }
                .modal-content input {
                    margin-bottom: 10px;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default EventCard;
