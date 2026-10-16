import subprocess

cmd = """
const fs = require('fs');

// Let's check how drizzle is used
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Let's find the schemas chunk
const files = fs.readdirSync('/app/.next/server/chunks');
let schemaChunk = null;
for (const f of files) {
  if (f.startsWith('packages_') && f.endsWith('.js')) {
    const c = fs.readFileSync('/app/.next/server/chunks/' + f, 'utf8');
    if (c.includes('pgTable("files"') || c.includes('pgTable(\"files\"')) {
      schemaChunk = f;
      break;
    }
  }
}
console.log('Schema chunk:', schemaChunk);
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
print("STDERR:\n", res.stderr)
