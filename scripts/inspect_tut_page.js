async function main() {
  const res = await fetch('http://localhost:8502/tut');
  const text = await res.text();
  console.log('Includes TuT Agent?', text.includes('TuT Agent'));
  console.log('Includes Tut Agent?', text.includes('Tut Agent'));
  console.log('Includes TuT AI?', text.includes('TuT AI'));
  console.log('Includes MCIT AI?', text.includes('MCIT AI'));
  console.log('Includes iframe?', text.includes('<iframe'));
  
  const iframeMatch = text.match(/<iframe[^>]+src="([^"]+)"/);
  console.log('Iframe src:', iframeMatch ? iframeMatch[1] : 'none');
}

main();
