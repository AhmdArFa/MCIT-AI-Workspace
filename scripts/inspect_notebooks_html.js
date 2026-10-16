const http = require('http');

http.get('http://localhost:8502/notebooks', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    const scripts = body.match(/<script[^>]+src="([^">]+)"/g) || [];
    console.log('Script tags count:', scripts.length);
    scripts.forEach(s => console.log('  ', s));

    // Also search for our keywords in body
    console.log('Has "Developed by Eng Ahmed Arfa":', body.includes('Developed by Eng Ahmed Arfa'));
    console.log('Has "Active notebooks":', body.includes('Active notebooks'));
    console.log('Has "Accent":', body.includes('Accent'));
    console.log('Has "Palette":', body.includes('Palette'));

    // Check if redirecting or login
    if (body.includes('login') || body.includes('signin')) {
      console.log('Contains login/signin reference');
    }
  });
});
