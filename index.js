// Remove all the token variables - they're now in the backend!

async function fetchStravaActivities() {
    try {
        // Call YOUR backend instead of Strava directly
        const response = await fetch('/api/strava');
        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to fetch activities');
        }

        displayActivities(data.activities);
    } catch (error) {
        console.error('Error fetching Strava data:', error);
        document.getElementById('strava-activities').innerHTML = `
            <div style="text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; border: 1px solid rgba(255, 0, 0, 0.2);">
                <p style="color: rgba(255, 100, 100, 0.8);">
                    ⚠️ Unable to load Strava activities. Please try again later.
                </p>
            </div>
        `;
    }
}

function displayActivities(activities) {
    if (!activities || activities.length === 0) {
        document.getElementById('strava-activities').innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">
                No recent activities found.
            </div>
        `;
        return;
    }

    const html = activities.map(activity => {
        const distanceMiles = (activity.distance / 1609.34).toFixed(2);
        const durationMinutes = Math.floor(activity.moving_time / 60);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        const date = new Date(activity.start_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        const icon = getActivityIcon(activity.type);
        const pace = activity.type === 'Run' 
            ? `${Math.floor(activity.moving_time / 60 / (activity.distance / 1609.34))}:${String(Math.round((activity.moving_time / 60 / (activity.distance / 1609.34) % 1) * 60)).padStart(2, '0')}/mi`
            : '';

        return `
            <div class="achievement-card" style="cursor: pointer;" onclick="window.open('https://www.strava.com/activities/${activity.id}', '_blank')">
                <span class="achievement-icon">${icon}</span>
                <div class="achievement-content" style="flex: 1;">
                    <h4>${activity.name}</h4>
                    <p style="display: flex; gap: 16px; flex-wrap: wrap;">
                        <span>📍 ${distanceMiles} mi</span>
                        <span>⏱️ ${duration}</span>
                        ${pace ? `<span>⚡ ${pace}</span>` : ''}
                        <span>📅 ${date}</span>
                    </p>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('strava-activities').innerHTML = html;
}

function getActivityIcon(type) {
    const icons = {
        'Run': '🏃',
        'VirtualRun': '🏃',
        'TrailRun': '🏃',
        'Ride': '🚴',
        'VirtualRide': '🚴',
        'EBikeRide': '🚴',
        'GravelRide': '🚴',
        'MountainBikeRide': '🚴',
        'Swim': '🏊',
        'Workout': '💪',
        'WeightTraining': '🏋️',
        'Yoga': '🧘',
        'Hike': '🥾',
        'Walk': '🚶',
        'Elliptical': '💪',
        'StairStepper': '💪',
        'Rowing': '🚣',
        'Crossfit': '🏋️'
    };
    
    // Check if we have an exact match first
    if (icons[type]) {
        return icons[type];
    }
    
    // Check if the type contains certain keywords
    if (type && type.toLowerCase().includes('ride')) {
        return '🚴';
    }
    if (type && type.toLowerCase().includes('run')) {
        return '🏃';
    }
    if (type && type.toLowerCase().includes('swim')) {
        return '🏊';
    }
    
    // Default fallback
    return '💪';  // Changed from running to workout emoji
}

window.addEventListener('DOMContentLoaded', fetchStravaActivities);