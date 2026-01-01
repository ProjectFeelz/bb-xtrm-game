const { createClient } = require('@supabase/supabase-client');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async () => {
  const { data } = await supabase
    .from('leaderboard')
    .select('username, clout')
    .order('clout', { ascending: false })
    .limit(10);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(data)
  };
};
