<?php
$appsData = [
    'Art' => [],
    'Otro' => []
];

// Scan all directories in the current folder
$dirs = array_filter(glob('*'), 'is_dir');

foreach ($dirs as $dir) {
    // Look for text files in the directory
    $txtFiles = glob($dir . '/*.txt');
    foreach ($txtFiles as $txt) {
        $filename = basename($txt);
        // format: AppName-Type.txt
        $nameWithoutExt = preg_replace('/\.txt$/i', '', $filename);
        $dashIndex = strrpos($nameWithoutExt, '-');
        
        if ($dashIndex !== false) {
            $appName = trim(substr($nameWithoutExt, 0, $dashIndex));
            $type = trim(substr($nameWithoutExt, $dashIndex + 1));
            
            if ($type === 'Art' || $type === 'Otro') {
                $appsData[$type][] = [
                    'name' => $appName,
                    'path' => $dir . '/index.html',
                    'dir' => $dir . '/'
                ];
                break; // Proceed to next directory after finding the app text file
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-width=1.0">
    <title>Jaya Prime Mini-Apps</title>
    <style>
        :root {
            --bg-color: #0d0d12;
            --nav-bg: #1a1a24;
            --text-main: #00ffff;
            --text-secondary: #ff00ff;
            --highlight: #ffff00;
            --border-color: #33334d;
            --font-family: 'Courier New', Courier, monospace;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: var(--font-family);
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* Cyberpunk Nav Bar */
        nav {
            background-color: var(--nav-bg);
            border-bottom: 2px solid var(--text-main);
            box-shadow: 0 0 10px var(--text-main);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            height: 60px;
            flex-shrink: 0;
            z-index: 10;
        }

        .title {
            font-size: 1.5rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 2px 2px 0px var(--text-secondary);
        }

        .menus {
            display: flex;
            gap: 20px;
            align-items: center;
        }

        .menu-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .menu-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        select {
            background-color: var(--bg-color);
            color: var(--text-main);
            border: 1px solid var(--text-main);
            padding: 5px 10px;
            font-family: var(--font-family);
            font-size: 1rem;
            outline: none;
            cursor: pointer;
            box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
            transition: all 0.3s ease;
        }

        select:hover, select:focus {
            box-shadow: 0 0 10px var(--text-main);
            border-color: var(--highlight);
            color: var(--highlight);
        }

        option {
            background-color: var(--nav-bg);
            color: var(--text-main);
        }

        /* Iframe container */
        .iframe-container {
            flex-grow: 1;
            position: relative;
            width: 100%;
            border: none;
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
            background-color: #000;
        }

        /* Cyberpunk scanlines effect */
        .scanlines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0),
                rgba(255, 255, 255, 0) 50%,
                rgba(0, 0, 0, 0.2) 50%,
                rgba(0, 0, 0, 0.2)
            );
            background-size: 100% 4px;
            pointer-events: none;
            z-index: 5;
            opacity: 0.3;
        }
    </style>
</head>
<body>

    <nav>
        <div class="title">Jaya Prime Mini-Apps</div>
        <div class="menus">
            <div class="menu-group">
                <span class="menu-label">Art Apps</span>
                <select id="art-menu">
                    <!-- Populated via JS -->
                </select>
            </div>
            <div class="menu-group">
                <span class="menu-label">Other Apps</span>
                <select id="otro-menu">
                    <!-- Populated via JS -->
                </select>
            </div>
        </div>
    </nav>

    <div class="scanlines"></div>

    <div class="iframe-container">
        <iframe id="app-frame" src="grunge/index.html" name="app-frame" title="App Frame"></iframe>
    </div>

    <script>
        const artMenu = document.getElementById('art-menu');
        const otroMenu = document.getElementById('otro-menu');
        const appFrame = document.getElementById('app-frame');

        // Data directly injected by PHP
        let appsData = <?php echo json_encode($appsData); ?>;

        function initApps() {
            // Sort menus alphabetically
            appsData.Art.sort((a, b) => a.name.localeCompare(b.name));
            appsData.Otro.sort((a, b) => a.name.localeCompare(b.name));

            // Populate Art Menu
            artMenu.innerHTML = '';
            appsData.Art.forEach(app => {
                const option = document.createElement('option');
                option.value = app.path;
                option.textContent = app.name;
                // Default to FX Studio in grunge
                if (app.dir === 'grunge/') {
                    option.selected = true;
                }
                artMenu.appendChild(option);
            });

            // Populate Otro Menu
            otroMenu.innerHTML = '<option value="">-- Select App --</option>';
            appsData.Otro.forEach(app => {
                const option = document.createElement('option');
                option.value = app.path;
                option.textContent = app.name;
                otroMenu.appendChild(option);
            });
            
            // Check if FX Studio was found, if not, set to the first available if any
            if (artMenu.options.length > 0 && artMenu.selectedIndex === -1) {
                artMenu.selectedIndex = 0;
            }
        }

        // Event Listeners for Menus
        artMenu.addEventListener('change', (e) => {
            if (e.target.value) {
                appFrame.src = e.target.value;
                // Reset other menu
                otroMenu.selectedIndex = 0;
            }
        });

        otroMenu.addEventListener('change', (e) => {
            if (e.target.value) {
                appFrame.src = e.target.value;
                // Reset other menu
                artMenu.selectedIndex = -1;
            }
        });

        // Initialize immediately
        initApps();

    </script>
</body>
</html>
