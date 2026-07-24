const canvas = document.getElementById('renderCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

// Setup high-performance additive blending for fractal flames
ctx.globalCompositeOperation = 'lighter';

// Simple Affine Transforms (IFS)
const transforms = [
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0 },
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 1, f: 0 },
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0.866 }
];

let isRendering = false;
let renderAnimationId;

function renderFractal() {
    // Center and scale the fractal map to the canvas
    const scale = 300;
    const offsetX = canvas.width / 2 - (scale / 2);
    const offsetY = canvas.height / 2 - (scale / 2.5);
    
    let x = Math.random();
    let y = Math.random();
    
    // Low opacity for the "flame" additive blending effect
    ctx.fillStyle = "rgba(0, 150, 255, 0.05)"; 

    // Render loop per frame (batching points for performance)
    function iterate() {
        for (let i = 0; i < 5000; i++) {
            // Pick a random transform
            const t = transforms[Math.floor(Math.random() * transforms.length)];
            
            // Apply affine transformation: 
            // x' = ax + by + e
            // y' = cx + dy + f
            const nx = t.a * x + t.b * y + t.e;
            const ny = t.c * x + t.d * y + t.f;
            x = nx;
            y = ny;
            
            // Draw pixel
            ctx.fillRect(x * scale + offsetX, -y * scale + canvas.height - offsetY, 1, 1);
        }
        
        if (isRendering) {
            renderAnimationId = requestAnimationFrame(iterate);
        }
    }
    
    iterate();
}

document.getElementById('btn-render').addEventListener('click', () => {
    isRendering = !isRendering;
    if (isRendering) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // clear canvas
        renderFractal();
    } else {
        cancelAnimationFrame(renderAnimationId);
    }
});
