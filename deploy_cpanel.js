const https = require('https');
const fs = require('fs');
const path = require('path');

// Disable TLS verification since cPanel might use self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configuration parameters
const config = {
    cpanelHost: 's1.sitechai.com',
    cpanelPort: 2083,
    username: 'cvacimot',
    password: '9J9q]91tYYyzB)',
    subdomain: 'sales',
    rootDomain: 'cv-acimotors.com',
    dbName: 'cvacimot_sales',
    dbUser: 'cvacimot_dbuser',
    dbPass: 'Shahriar@0123',
    docRoot: 'public_html/sales'
};

// Basic Auth header
const authHeader = 'Basic ' + Buffer.from(`${config.username}:${config.password}`).toString('base64');

// Helper to make HTTPS requests to cPanel UAPI
function makeRequest(module, func, params = {}) {
    return new Promise((resolve, reject) => {
        const queryParams = new URLSearchParams(params).toString();
        const path = `/execute/${module}/${func}?${queryParams}`;
        
        const options = {
            hostname: '116.202.222.251',
            port: config.cpanelPort,
            path: path,
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Length': 0,
                'Host': config.cpanelHost
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.errors && parsed.errors.length > 0) {
                        reject(new Error(parsed.errors.join(', ')));
                    } else if (parsed.status === 0) {
                        reject(new Error(parsed.messages ? parsed.messages.join(', ') : 'API error'));
                    } else {
                        resolve(parsed);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data.substring(0, 200)}`));
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.end();
    });
}

// Helper to upload files via Fileman/upload_files
function uploadFiles(destinationDir, filesArray) {
    return new Promise((resolve, reject) => {
        const boundary = '----NodeCpanelUploadBoundary' + Math.random().toString(36).substring(2);
        const chunks = [];

        // Add text fields
        chunks.push(Buffer.from(`--${boundary}\r\n`));
        chunks.push(Buffer.from(`Content-Disposition: form-data; name="dir"\r\n\r\n`));
        chunks.push(Buffer.from(`${destinationDir}\r\n`));
        chunks.push(Buffer.from(`--${boundary}\r\n`));
        chunks.push(Buffer.from(`Content-Disposition: form-data; name="overwrite"\r\n\r\n`));
        chunks.push(Buffer.from(`1\r\n`));

        // Add files
        filesArray.forEach((f, idx) => {
            chunks.push(Buffer.from(`--${boundary}\r\n`));
            chunks.push(Buffer.from(`Content-Disposition: form-data; name="file-${idx + 1}"; filename="${f.name}"\r\n`));
            chunks.push(Buffer.from(`Content-Type: application/octet-stream\r\n\r\n`));
            chunks.push(f.content);
            chunks.push(Buffer.from(`\r\n`));
        });

        chunks.push(Buffer.from(`--${boundary}--\r\n`));
        const payload = Buffer.concat(chunks);

        const options = {
            hostname: '116.202.222.251',
            port: config.cpanelPort,
            path: '/execute/Fileman/upload_files',
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length,
                'Host': config.cpanelHost
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.errors && parsed.errors.length > 0) {
                        reject(new Error(parsed.errors.join(', ')));
                    } else {
                        resolve(parsed);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse upload response: ${data.substring(0, 200)}`));
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log("=== Sales360 cPanel Automated Deployer ===");
    
    // Step 1: Create Subdomain
    try {
        console.log(`[1/5] Creating subdomain "${config.subdomain}.${config.rootDomain}"...`);
        const subResult = await makeRequest('SubDomain', 'addsubdomain', {
            domain: config.subdomain,
            rootdomain: config.rootDomain,
            dir: config.docRoot,
            canoff: 0
        });
        console.log("✓ Subdomain created successfully!");
    } catch (e) {
        // If subdomain already exists, log it but don't fail
        if (e.message.includes('already exists') || e.message.includes('exists')) {
            console.log("ℹ Subdomain already exists. Proceeding...");
        } else {
            console.error("✗ Failed to create subdomain:", e.message);
            process.exit(1);
        }
    }

    // Step 2: Create Database
    try {
        console.log(`[2/5] Creating MySQL database "${config.dbName}"...`);
        await makeRequest('Mysql', 'create_database', { name: config.dbName });
        console.log("✓ Database created successfully!");
    } catch (e) {
        if (e.message.includes('already exists') || e.message.includes('exists')) {
            console.log("ℹ Database already exists. Proceeding...");
        } else {
            console.error("✗ Failed to create database:", e.message);
            process.exit(1);
        }
    }

    // Step 3: Create Database User
    try {
        console.log(`[3/5] Creating database user "${config.dbUser}"...`);
        await makeRequest('Mysql', 'create_user', {
            name: config.dbUser,
            password: config.dbPass
        });
        console.log("✓ Database user created successfully!");
    } catch (e) {
        if (e.message.includes('already exists') || e.message.includes('exists')) {
            console.log("ℹ Database user already exists. Proceeding...");
        } else {
            console.error("✗ Failed to create database user:", e.message);
            process.exit(1);
        }
    }

    // Step 4: Assign Privileges
    try {
        console.log(`[4/5] Assigning privileges for "${config.dbUser}" on "${config.dbName}"...`);
        await makeRequest('Mysql', 'set_privileges_on_database', {
            user: config.dbUser,
            database: config.dbName,
            privileges: 'ALL PRIVILEGES'
        });
        console.log("✓ Privileges assigned successfully!");
    } catch (e) {
        console.error("✗ Failed to assign database privileges:", e.message);
        process.exit(1);
    }

    // Step 5: Upload Files
    try {
        console.log("[5/5] Preparing files for upload...");
        
        const filesToUpload = [
            { name: '.htaccess', path: path.join(__dirname, '.htaccess') },
            { name: 'inspect_emi.php', path: path.join(__dirname, 'inspect_emi.php') },
            { name: 'index.html', path: path.join(__dirname, 'index.html') },
            { name: 'app.js', path: path.join(__dirname, 'app.js') },
            { name: 'style.css', path: path.join(__dirname, 'style.css') },
            { name: 'api.php', path: path.join(__dirname, 'api.php') },
            { name: 'cpanel_setup.sql', path: path.join(__dirname, 'cpanel_setup.sql') }
        ];

        // Add favicon if exists
        const faviconPath = path.join(__dirname, 'favicon.png');
        if (fs.existsSync(faviconPath)) {
            filesToUpload.push({ name: 'favicon.png', path: faviconPath });
        }

        const preparedFiles = filesToUpload.map(f => ({
            name: f.name,
            content: fs.readFileSync(f.path)
        }));

        console.log(`Uploading ${preparedFiles.length} files to "${config.docRoot}"...`);
        await uploadFiles(config.docRoot, preparedFiles);
        console.log("✓ Files uploaded to sales successfully!");
        
        console.log(`Uploading ${preparedFiles.length} files to "public_html/sales360"...`);
        await uploadFiles("public_html/sales360", preparedFiles);
        console.log("✓ Files uploaded to sales360 successfully!");
        
        console.log("\n=============================================");
        console.log("✓ DEPLOYMENT COMPLETED SUCCESSFULY!");
        console.log(`Subdomain: http://${config.subdomain}.${config.rootDomain}`);
        console.log(`Doc Root: ${config.docRoot}`);
        console.log(`Database: ${config.dbName}`);
        console.log(`Database User: ${config.dbUser}`);
        console.log(`Database Pass: ${config.dbPass}`);
        console.log("=============================================");
        console.log("\nNote: Database auto-seeding will run when you first open the webpage in your browser.");
        console.log("If your domain DNS is not yet pointing to s1.sitechai.com, you can also view it using the server IP:");
        console.log(`Temporary URL: http://${config.cpanelHost}/~${config.username}/${config.subdomain}/`);
        console.log("=============================================");
        
    } catch (e) {
        console.error("✗ Failed to upload files:", e.message);
        process.exit(1);
    }
}

run();
