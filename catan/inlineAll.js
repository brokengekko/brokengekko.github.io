const fs = require('fs');
const path = require('path');

try {
  const css = fs.readFileSync('src/stylesheets/main.css', 'utf-8');
  let js = fs.readFileSync('bin/bundle.js', 'utf-8');
  const favicon = fs.readFileSync('/Users/kanlamat/.gemini/antigravity/brain/6aeb05bb-2db6-4bca-964f-3728a3acb6a5/uber_katan_favicon_1776823182769.png');
  const base64Favicon = favicon.toString('base64');

  js = js.split('</script>').join('<\\/script>');

  // Dynamically base64 encode all static assets and inject them into the JS payload.
  // This solves CORS masking issues in 'file://' context and makes the deployment 100% standalone!
  const imgDir = path.join(__dirname, 'src', 'images');
  const files = fs.readdirSync(imgDir);
  files.forEach(file => {
      if (file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.jpg')) {
          const content = fs.readFileSync(path.join(imgDir, file));
          const base64 = content.toString('base64');
          const ext = file.split('.').pop();
          const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
          const dataUri = `data:${mimeType};base64,${base64}`;
          
          js = js.split(`./src/images/${file}`).join(dataUri);
      }
  });

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Uber Katan</title>
	<link rel="icon" type="image/png" href="data:image/png;base64,${base64Favicon}">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">
	<style>
${css}
	</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
${js}
    </script>
  </body>
</html>`;

  fs.writeFileSync('index.html', html);
  console.log('Successfully generated index.html with inline assets, favicon, and base64 SVG embeds!');
} catch (err) {
  console.error('Error during inlining:', err);
}
