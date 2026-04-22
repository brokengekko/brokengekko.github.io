const fs = require('fs');

try {
  let html = fs.readFileSync('index.html', 'utf-8');
  const css = fs.readFileSync('src/stylesheets/main.css', 'utf-8');
  let js = fs.readFileSync('bin/bundle.js', 'utf-8');

  // Escape closing script tags
  js = js.split('</script>').join('<\\/script>');

  // Inlining CSS safely
  html = html.split('<link rel="stylesheet" href="./src/stylesheets/main.css">').join(`<style>\n${css}\n</style>`);

  // Inlining JS safely without regex substitution bugs
  html = html.split('<script src="./bin/bundle.js" charset="utf-8"></script>').join(`<script>\n${js}\n</script>`);

  fs.writeFileSync('index.html', html);
  console.log('Successfully inlined CSS and JS into index.html');
} catch (err) {
  console.error('Error during inlining:', err);
}
