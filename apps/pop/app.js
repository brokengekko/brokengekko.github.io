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
        // Halt if no flame data is loaded
        if (!currentFlameData || currentFlameData.transforms.length === 0) return;
        
        const transforms = currentFlameData.transforms;

        for (let i = 0; i < 5000; i++) {
            // Pick a random transform. 
            // Note: A true Apophysis engine picks this based on the 'weight' attribute!
            // For now, we pick uniformly for testing.
            const t = transforms[Math.floor(Math.random() * transforms.length)];
            const coefs = t.coefs; 
            
            // Apply Apophysis Affine Transformation: 
            // x' = a*x + c*y + e
            // y' = b*x + d*y + f
            // Note the index mapping: [a=0, b=1, c=2, d=3, e=4, f=5]
            const nx = coefs[0] * x + coefs[2] * y + coefs[4];
            const ny = coefs[1] * x + coefs[3] * y + coefs[5];
            
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
    
    // Global state variables
let currentFlameData = null;
let activeTransformIndex = 0;

// Call this function at the very end of your parseFlameXML function
function applyFlameDataToRenderEngine(flameData) {
    currentFlameData = flameData;
    activeTransformIndex = 0;
    
    const transformListUI = document.getElementById('transform-list');
    transformListUI.innerHTML = ''; // Clear the dummy HTML transforms
    
    // Generate list items for each parsed transform
    flameData.transforms.forEach((transform, index) => {
        const li = document.createElement('li');
        li.textContent = `Transform ${index + 1}`;
        if (index === 0) li.classList.add('active');
        
        // Add click listener for UI interaction
        li.addEventListener('click', () => {
            // Manage 'active' CSS classes
            document.querySelectorAll('#transform-list li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            
            // Update state and refresh the properties panel
            activeTransformIndex = index;
            updatePropertiesPanel(transform);
        });
        
        transformListUI.appendChild(li);
    });
    
    // Initialize the properties panel with the first transform
    if (flameData.transforms.length > 0) {
        updatePropertiesPanel(flameData.transforms[0]);
    }
}

// Dynamically populate the inputs based on the selected transform
function updatePropertiesPanel(transform) {
    const propertiesPanel = document.querySelector('.transform-properties');
    
    // Map the 6 coefficients (a, b, c, d, e, f) and dynamically list variations
    let html = `
        <label>Weight: <input type="number" step="0.01" value="${transform.weight}"></label>
        <hr style="border-color:#444;">
        <label>a (X scale): <input type="number" step="0.01" value="${transform.coefs[0]}"></label>
        <label>b (X shear): <input type="number" step="0.01" value="${transform.coefs[1]}"></label>
        <label>c (Y shear): <input type="number" step="0.01" value="${transform.coefs[2]}"></label>
        <label>d (Y scale): <input type="number" step="0.01" value="${transform.coefs[3]}"></label>
        <label>e (X move): <input type="number" step="0.01" value="${transform.coefs[4]}"></label>
        <label>f (Y move): <input type="number" step="0.01" value="${transform.coefs[5]}"></label>
        <hr style="border-color:#444;">
        <h4>Variations</h4>
    `;
    
    // Loop through variations like spherical, popcorn2, etc.
    for (const [variationName, value] of Object.entries(transform.variations)) {
        html += `<label>${variationName}: <input type="number" step="0.01" value="${value}"></label>`;
    }
    
    propertiesPanel.innerHTML = html;
}
 
}
