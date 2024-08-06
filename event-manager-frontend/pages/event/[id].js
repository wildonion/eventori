import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const EventDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [event, setEvent] = useState(null);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:3001/api/events/${id}`)
                .then(response => setEvent(response.data))
                .catch(error => console.error('Error fetching event details:', error));
        }
    }, [id]);

    if (!event) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{event.name}</h1>
            <p>{event.description}</p>
            {/* Add other event details as needed */}
        </div>
    );
};

export default EventDetails;
