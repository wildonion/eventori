const cron = require('node-cron');
const Event = require('./models/Event');

// Run the cron job every minute
cron.schedule('* * * * *', async () => {
    try {
        const result = await Event.getAll();
        const events = result.rows;
        const now = new Date();

        for (const event of events) {
            if (event.end_time <= now && !event.is_finished) {
                await Event.setFinished(event.id);
                console.log(`Event ${event.id} marked as finished.`);
            }
        }
    } catch (err) {
        console.error('Error checking event statuses:', err);
    }
});
