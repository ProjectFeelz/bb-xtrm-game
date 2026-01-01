const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  const { username, score } = JSON.parse(event.body);

  await supabase
    .from('leaderboard')
    .insert([{ username: username, clout: score }]);

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ message: "Score Saved" })
  };
};
