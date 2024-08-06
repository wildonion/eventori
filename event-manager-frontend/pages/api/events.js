import axios from 'axios';

export default async (req, res) => {
    if (req.method === 'GET') {
        try {
            const response = await axios.get('http://localhost:3001/api/events/');
            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error fetching events:', error); // Log the frontend error details
            res.status(500).json({ error: 'Failed to fetch events', details: error.message });
        }
    }
};