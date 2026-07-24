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

// Attach file input to the Open button
document.getElementById('btn-open').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const xmlString = e.target.result;
        parseFlameXML(xmlString);
    };
    reader.readAsText(file);
});

function parseFlameXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        console.error("Error parsing XML");
        return;
    }

    const flameNode = xmlDoc.getElementsByTagName("flame")[0];
    if (!flameNode) return;

    // 1. Extract Global Flame Attributes
    const flameData = {
        name: flameNode.getAttribute("name"),
        size: flameNode.getAttribute("size").split(" ").map(Number),
        center: flameNode.getAttribute("center").split(" ").map(Number),
        scale: parseFloat(flameNode.getAttribute("scale")),
        gamma: parseFloat(flameNode.getAttribute("gamma")),
        brightness: parseFloat(flameNode.getAttribute("brightness")),
        transforms: [],
        palette: []
    };

    // 2. Extract Transforms (xforms)
    const xforms = flameNode.getElementsByTagName("xform");
    for (let i = 0; i < xforms.length; i++) {
        const xform = xforms[i];
        const transform = {
            weight: parseFloat(xform.getAttribute("weight")),
            color: parseFloat(xform.getAttribute("color")),
            coefs: xform.getAttribute("coefs").split(" ").map(Number),
            variations: {}
        };

        // Extract variations (e.g., flatten, spherical, popcorn2)
        // This loops through all attributes and filters out standard ones
        for (let j = 0; j < xform.attributes.length; j++) {
            const attr = xform.attributes[j];
            const name = attr.name;
            if (!["weight", "color", "coefs", "opacity"].includes(name)) {
                transform.variations[name] = parseFloat(attr.value);
            }
        }
        flameData.transforms.push(transform);
    }

    // 3. Extract Palette
    const paletteNode = flameNode.getElementsByTagName("palette")[0];
    if (paletteNode) {
        // Remove line breaks and whitespace, then chunk into 6-character hex codes
        const rawPalette = paletteNode.textContent.replace(/\s+/g, '');
        for (let i = 0; i < rawPalette.length; i += 6) {
            flameData.palette.push('#' + rawPalette.substring(i, i + 6));
        }
    }

    console.log("Successfully parsed flame data:", flameData);
    
    // TODO: Update your UI state and trigger a new render using flameData
    // applyFlameDataToRenderEngine(flameData); 
}
