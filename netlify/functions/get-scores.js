const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async () => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('clout', { ascending: false })
      .limit(10);

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
