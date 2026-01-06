export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    console.log('=== STRAVA API CALLED ===');
    
    const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
    const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
    const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
        console.error('Missing environment variables');
        return res.status(500).json({ 
            success: false,
            error: 'Server configuration error - missing credentials'
        });
    }

    try {
        console.log('Step 1: Refreshing token...');
        
        // Step 1: Get fresh access token
        const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                refresh_token: STRAVA_REFRESH_TOKEN,
                grant_type: 'refresh_token'
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token refresh failed:', errorText);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to refresh Strava token',
                details: errorText
            });
        }

        const tokenData = await tokenResponse.json();
        console.log('Token refreshed successfully');

        // Step 2: Fetch activities
        console.log('Step 2: Fetching activities...');
        
        const activitiesResponse = await fetch(
            'https://www.strava.com/api/v3/athlete/activities?per_page=5',
            {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Accept': 'application/json'
                }
            }
        );

        if (!activitiesResponse.ok) {
            const errorText = await activitiesResponse.text();
            console.error('Activities fetch failed:', errorText);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to fetch activities',
                details: errorText
            });
        }

        const activities = await activitiesResponse.json();
        console.log('Success! Got', activities.length, 'activities');

        // Step 3: Return data
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
        console.error('Caught error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error'
        });
    }
}