import subprocess

cmd = """
// Let's test the exact query drizzle executes
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  // Let's see what ownership() produces
  // In FileModel, this.userId = 'user_4eDsv8rgH7oybIUSAHQeoDGt3pz'
  const adminId = 'user_4eDsv8rgH7oybIUSAHQeoDGt3pz';
  const fileId = 'file_voi5Gp0EkPap';
  
  // 1. Direct query with user_id = adminId
  const r1 = await pool.query('SELECT id, user_id FROM files WHERE id = $1 AND user_id = $2', [fileId, adminId]);
  console.log('Query with admin user_id:', r1.rows);
  
  // 2. Direct query without user_id
  const r2 = await pool.query('SELECT id, user_id, visibility FROM files WHERE id = $1', [fileId]);
  console.log('Query without user_id:', r2.rows);

  await pool.end();
}
test().catch(console.error);
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
print("STDERR:\n", res.stderr)
