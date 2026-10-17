import subprocess

cmd = """
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    const q = 'insert into "messages" ("id", "role", "content", "user_id", "agent_id", "workspace_id", "created_at", "updated_at") values ($1, $2, $3, $4, $5, $6, $7, $8) returning *';
    const params = ['msg_0123456789abcdef', 'user', 'test', 'user_4eDsv8rgH7oybIUSAHQeoDGt3pz', 'inbox', null, new Date(), new Date()];
    const r = await pool.query(q, params);
    console.log('Inserted:', r.rows[0].id);
    await pool.query('delete from messages where id = $1', ['msg_0123456789abcdef']);
  } catch(e) {
    console.error('Insert error:', e);
  } finally {
    await pool.end();
  }
}
run();
"""

res = subprocess.run(['docker', 'exec', '-e', 'NODE_PATH=/app/node_modules', 'mcit-ai-tut-agent-1', 'node', '-e', cmd], capture_output=True, text=True)
print('STDOUT:', res.stdout)
print('STDERR:', res.stderr)
