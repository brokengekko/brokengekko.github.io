const fs = require('fs');
const path = require('path');

const appsDir = __dirname;
const outputFile = path.join(appsDir, 'apps.json');

const appsData = {
    Art: [],
    Otro: []
};

// Read all items in the apps directory
const items = fs.readdirSync(appsDir);

for (const item of items) {
    const itemPath = path.join(appsDir, item);
    const stat = fs.statSync(itemPath);

    // If it's a directory
    if (stat.isDirectory()) {
        // Read contents of this subdirectory
        const subItems = fs.readdirSync(itemPath);
        
        for (const subItem of subItems) {
            // Looking for .txt file with a dash
            if (subItem.endsWith('.txt') && subItem.includes('-')) {
                const nameWithoutExt = subItem.replace('.txt', '');
                const dashIndex = nameWithoutExt.lastIndexOf('-');
                
                if (dashIndex !== -1) {
                    const appName = nameWithoutExt.substring(0, dashIndex).trim();
                    const type = nameWithoutExt.substring(dashIndex + 1).trim();
                    
                    if (type === 'Art' || type === 'Otro') {
                        appsData[type].push({
                            name: appName,
                            path: `${item}/index.html`,
                            dir: `${item}/`
                        });
                        break; // Found the app marker file, move to next directory
                    }
                }
            }
        }
    }
}

// Sort alphabetically
appsData.Art.sort((a, b) => a.name.localeCompare(b.name));
appsData.Otro.sort((a, b) => a.name.localeCompare(b.name));

// Write the JSON file
fs.writeFileSync(outputFile, JSON.stringify(appsData, null, 2));

console.log('✅ apps.json successfully generated!');
console.log(`Found ${appsData.Art.length} Art Apps and ${appsData.Otro.length} Other Apps.`);
