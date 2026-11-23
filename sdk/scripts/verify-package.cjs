let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  const metadata = JSON.parse(input);
  const info = Array.isArray(metadata) ? metadata[0] : metadata['@basiclines/rampa-sdk'];
  const files = info?.files ?? [];
  if (!files.some(file => file.path === 'dist/index.d.ts')) {
    console.error('SDK package is missing dist/index.d.ts');
    process.exitCode = 1;
  }
});
