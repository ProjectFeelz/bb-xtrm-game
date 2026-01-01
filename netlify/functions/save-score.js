const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { username, score } = JSON.parse(event.body);
    
    const { data, error } = await supabase
      .from('leaderboard') // Ensure your table is named 'leaderboard'
      .insert([{ username, clout: score }]);

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Score saved" })
    };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
