// api/strava.js

export default async function handler(req, res) {
    // Set CORS headers so your frontend can call this
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
    const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
    const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

    try {
        // Step 1: Get a fresh access token using refresh token
        const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                refresh_token: STRAVA_REFRESH_TOKEN,
                grant_type: 'refresh_token'
            })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
            throw new Error('Failed to refresh token');
        }

        // Step 2: Fetch activities with the fresh token
        const activitiesResponse = await fetch(
            'https://www.strava.com/api/v3/athlete/activities?per_page=5',
            {
                headers: { 
                    'Authorization': `Bearer ${tokenData.access_token}` 
                }
            }
        );

        const activities = await activitiesResponse.json();

        if (!activitiesResponse.ok) {
            throw new Error('Failed to fetch activities');
        }

        // Step 3: Return sanitized data to frontend
        res.status(200).json({
            success: true,
            activities: activities.map(a => ({
                id: a.id,
                name: a.name,
                type: a.type,
                distance: a.distance,
                moving_time: a.moving_time,
                start_date: a.start_date
            }))
        });

    } catch (error) {
        console.error('Strava API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Strava data' 
        });
    }
}