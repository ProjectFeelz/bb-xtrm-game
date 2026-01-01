const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client outside the handler for better performance
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event, context) => {
    // 1. Define CORS headers so the browser doesn't block the request
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 2. Handle the "Preflight" request (Browsers do this automatically)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // 3. Perform the database query
        // Matches your 'leaderboard' table and columns: 'username' and 'clout'
        const { data, error } = await supabase
            .from('leaderboard')
            .select('username, clout')
            .order('clout', { ascending: false })
            .limit(10);

        // 4. If Supabase returns an error, catch it
        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }

        // 5. Return the successful data
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        // 6. Log the error to Netlify's console so you can see what happened
        console.error("Function Error:", error.message);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: "Internal Server Error", 
                details: error.message 
            })
        };
    }
};
