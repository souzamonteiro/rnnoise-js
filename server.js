const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const config = {
    //port: 3000,
    //sslPort: 3443,
    port: 3000,
    sslPort: 3443,
    folder: 'www',
    //folder: '.',
    //enableSSL: false,
    enableSSL: true,
    sslKey: 'localhost-key.pem',
    sslCert: 'localhost.pem',
    cors: true,
    spaMode: true, // Single Page Application mode (redirect all to index.html)
    gzip: true,
    cache: {
        static: 3600, // 1 hour for static files
        html: 300, // 5 minutes for HTML
    }
};

// MIME Types
const mimeTypes = {
    '.html': 'text/html; charset=UTF-8',
    '.htm': 'text/html; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.wasm': 'application/wasm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.map': 'application/json'
};

// Log with timestamp
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const colors = {
        INFO: '\x1b[36m', // Cyan
        SUCCESS: '\x1b[32m', // Green
        WARN: '\x1b[33m', // Yellow
        ERROR: '\x1b[31m', // Red
        DEBUG: '\x1b[35m' // Magenta
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type] || reset}[${timestamp}] ${type}:${reset} ${message}`);
}

// Check if www folder exists
if (!fs.existsSync(config.folder)) {
    log(`Creating folder '${config.folder}'...`, 'INFO');
    fs.mkdirSync(config.folder, { recursive: true });
    
    // Create a default index.html if the folder is empty
    const defaultHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Node.js Server</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container { 
            background: rgba(255, 255, 255, 0.1); 
            padding: 30px; 
            border-radius: 10px; 
            backdrop-filter: blur(10px);
        }
        h1 { color: white; }
        code { 
            background: rgba(0,0,0,0.3); 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: monospace;
        }
        a { color: #ffcc00; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Node.js Server Running!</h1>
        <p>Web server running on port <code>${config.port}</code></p>
        <p>Serving folder: <code>${config.folder}</code></p>
        <p>Place your HTML, CSS, JS files in the <code>${config.folder}</code> folder</p>
        <h3>Useful commands:</h3>
        <ul>
            <li><code>node server.js</code> - Start the server</li>
            <li><code>curl http://localhost:${config.port}</code> - Test the server</li>
            <li>Access <a href="http://localhost:${config.port}">http://localhost:${config.port}</a> in your browser</li>
        </ul>
        <p><em>Server started at ${new Date().toLocaleString()}</em></p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(config.folder, 'index.html'), defaultHtml);
    log(`Default index.html file created in '${config.folder}'`, 'SUCCESS');
}

// Function to serve files
function serveFile(req, res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                if (config.spaMode && ext === '') {
                    // In SPA mode, serve index.html for non-existent routes
                    const indexPath = path.join(config.folder, 'index.html');
                    if (fs.existsSync(indexPath)) {
                        serveFile(req, res, indexPath);
                        return;
                    }
                }
                serve404(req, res);
            } else {
                serve500(req, res, err);
            }
        } else {
            // Set headers
            const headers = {
                'Content-Type': contentType,
                'X-Powered-By': 'Node.js Simple Server'
            };
            
            // Cache headers
            if (config.cache) {
                if (ext === '.html' || ext === '.htm') {
                    headers['Cache-Control'] = `public, max-age=${config.cache.html}`;
                } else if (mimeTypes[ext] && mimeTypes[ext].startsWith('image/') || 
                          mimeTypes[ext] && mimeTypes[ext].startsWith('font/') ||
                          ext === '.js' || ext === '.css') {
                    headers['Cache-Control'] = `public, max-age=${config.cache.static}`;
                }
            }
            
            // CORS headers
            if (config.cors) {
                headers['Access-Control-Allow-Origin'] = '*';
                headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
                headers['Access-Control-Allow-Headers'] = 'Content-Type';
            }
            
            // Gzip compression (simple)
            if (config.gzip && (ext === '.html' || ext === '.htm' || ext === '.js' || ext === '.css' || ext === '.json')) {
                const acceptEncoding = req.headers['accept-encoding'] || '';
                if (acceptEncoding.includes('gzip')) {
                    const zlib = require('zlib');
                    headers['Content-Encoding'] = 'gzip';
                    zlib.gzip(content, (err, result) => {
                        if (err) {
                            serve500(req, res, err);
                            return;
                        }
                        headers['Content-Length'] = result.length;
                        res.writeHead(200, headers);
                        res.end(result);
                    });
                    return;
                }
            }
            
            headers['Content-Length'] = content.length;
            res.writeHead(200, headers);
            res.end(content);
            
            // Request log
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            log(`${ip} - "${req.method} ${req.url}" 200 ${content.length} bytes`, 'SUCCESS');
        }
    });
}

// 404 Page
function serve404(req, res) {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>404 - Page Not Found</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        h1 { font-size: 100px; margin: 0; }
        p { font-size: 20px; }
        a { color: white; text-decoration: underline; }
        .container { 
            background: rgba(255, 255, 255, 0.1); 
            padding: 40px; 
            border-radius: 15px;
            backdrop-filter: blur(10px);
            max-width: 600px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <p><a href="/">Return to home page</a></p>
    </div>
</body>
</html>`;
    
    res.writeHead(404, {
        'Content-Type': 'text/html; charset=UTF-8',
        'Content-Length': Buffer.byteLength(html)
    });
    res.end(html);
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    log(`${ip} - "${req.method} ${req.url}" 404`, 'WARN');
}

// 500 Page
function serve500(req, res, error) {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>500 - Internal Server Error</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #ff5858 0%, #f09819 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        h1 { font-size: 100px; margin: 0; }
        p { font-size: 20px; }
        .error { 
            background: rgba(255, 255, 255, 0.2); 
            padding: 20px; 
            border-radius: 10px;
            margin: 20px 0;
            font-family: monospace;
            text-align: left;
            max-width: 800px;
            overflow: auto;
        }
        .container { 
            background: rgba(255, 255, 255, 0.1); 
            padding: 40px; 
            border-radius: 15px;
            backdrop-filter: blur(10px);
            max-width: 800px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>500</h1>
        <h2>Internal Server Error</h2>
        <p>Something went wrong on the server.</p>
        <div class="error">${error ? error.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'Unknown error'}</div>
        <p><a href="/">Return to home page</a></p>
    </div>
</body>
</html>`;
    
    res.writeHead(500, {
        'Content-Type': 'text/html; charset=UTF-8',
        'Content-Length': Buffer.byteLength(html)
    });
    res.end(html);
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    log(`${ip} - "${req.method} ${req.url}" 500 - ${error ? error.message : 'Unknown error'}`, 'ERROR');
}

// Request handler
function requestHandler(req, res) {
    // Request log
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    log(`${ip} - "${req.method} ${req.url}"`, 'INFO');
    
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Remove trailing slash, except for root
    if (pathname !== '/' && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }
    
    // Decode URL
    try {
        pathname = decodeURIComponent(pathname);
    } catch (e) {
        log(`Error decoding URL: ${pathname}`, 'WARN');
        serve404(req, res);
        return;
    }
    
    // Prevent directory traversal
    if (pathname.includes('../') || pathname.includes('..\\')) {
        log(`Directory traversal attempt: ${pathname}`, 'WARN');
        serve404(req, res);
        return;
    }
    
    // Map path to file
    let filePath;
    if (pathname === '/') {
        filePath = path.join(config.folder, 'index.html');
    } else {
        filePath = path.join(config.folder, pathname);
    }
    
    // Check if it's a directory
    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isDirectory()) {
            // If it's a directory, try to serve index.html inside it
            const indexPath = path.join(filePath, 'index.html');
            fs.access(indexPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    serveFile(req, res, indexPath);
                } else {
                    // List directory (optional - disabled by default)
                    if (req.method === 'GET' && config.listDirectories) {
                        listDirectory(req, res, filePath, pathname);
                    } else {
                        serve404(req, res);
                    }
                }
            });
        } else {
            serveFile(req, res, filePath);
        }
    });
}

// HTTP server
const httpServer = http.createServer(requestHandler);

// HTTPS server (optional)
let httpsServer;
if (config.enableSSL) {
    try {
        const sslOptions = {
            key: fs.readFileSync(config.sslKey),
            cert: fs.readFileSync(config.sslCert)
        };
        httpsServer = https.createServer(sslOptions, requestHandler);
    } catch (err) {
        log(`Error loading SSL certificates: ${err.message}`, 'ERROR');
        log('Serving HTTP only', 'WARN');
        config.enableSSL = false;
    }
}

// Start servers
httpServer.listen(config.port, () => {
    log(`✅ HTTP server running at: http://localhost:${config.port}`, 'SUCCESS');
    log(`📁 Serving files from folder: ${config.folder}`, 'INFO');
    log(`🌐 Access: http://localhost:${config.port}`, 'INFO');
    
    // Open browser automatically (optional)
    if (process.argv.includes('--open')) {
        const { exec } = require('child_process');
        const url = `http://localhost:${config.port}`;
        const platform = process.platform;
        let command;
        
        if (platform === 'darwin') command = `open ${url}`;
        else if (platform === 'win32') command = `start ${url}`;
        else command = `xdg-open ${url}`;
        
        exec(command, (err) => {
            if (err) log(`Could not open browser: ${err.message}`, 'WARN');
        });
    }
});

if (config.enableSSL && httpsServer) {
    httpsServer.listen(config.sslPort, () => {
        log(`🔐 HTTPS server running at: https://localhost:${config.sslPort}`, 'SUCCESS');
        log(`🌐 Access: https://localhost:${config.sslPort}`, 'INFO');
    });
}

// Signal handling for graceful shutdown
process.on('SIGINT', () => {
    log('Shutting down server...', 'INFO');
    httpServer.close(() => {
        log('HTTP server shut down', 'INFO');
        if (httpsServer) {
            httpsServer.close(() => {
                log('HTTPS server shut down', 'INFO');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
});

// Uncaught exception handling
process.on('uncaughtException', (err) => {
    log(`Uncaught error: ${err.message}`, 'ERROR');
    log(err.stack, 'ERROR');
});

// Add live reload functionality (optional)
if (process.argv.includes('--live-reload')) {
    log('Live reload activated', 'INFO');
    const chokidar = require('chokidar');
    
    // Watch for changes in the www folder
    const watcher = chokidar.watch(config.folder, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    });
    
    watcher.on('change', (filePath) => {
        log(`File changed: ${filePath}`, 'DEBUG');
        // Here you could implement WebSocket for live reload
    });
}

// Export for testing
module.exports = {
    httpServer,
    httpsServer,
    config,
    serveFile,
    serve404,
    serve500
};