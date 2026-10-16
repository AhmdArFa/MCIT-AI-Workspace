import subprocess

cmd = """
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function test() {
  const r = await pool.query('SELECT id, user_id, name, url FROM files WHERE id = $1', ['file_voi5Gp0EkPap']);
  console.log('Postgres query:', r.rows);
  await pool.end();
}
test().catch(e => console.error(e));
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
