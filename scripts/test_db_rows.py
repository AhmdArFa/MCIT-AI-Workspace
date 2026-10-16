import subprocess

# Let's inspect how FileModel is instantiated and tested in the container
cmd = """
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const fileRes = await pool.query('SELECT * FROM files WHERE id = $1', ['file_voi5Gp0EkPap']);
  console.log('File row in DB:', fileRes.rows[0]);
  const userRes = await pool.query('SELECT id, email FROM users');
  console.log('Users in DB:', userRes.rows);
  await pool.end();
}
run().catch(console.error);
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
print("STDERR:\n", res.stderr)
