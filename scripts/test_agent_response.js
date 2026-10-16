const http = require('http');

async function testFetch(url) {
  try {
    const res = await fetch(url);
    console.log(`[${res.status}] ${url}`);
    const text = await res.text();
    console.log('Body length:', text.length);
    console.log('Snippet:', text.slice(0, 300));
    return text;
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
  }
}

async function main() {
  console.log('--- Testing endpoints ---');
  await testFetch('http://localhost:3210/');
  await testFetch('http://localhost:3210/api/health');
  await testFetch('http://localhost:8502/tut');
  await testFetch('http://localhost:8502/api/health');
}

main();
