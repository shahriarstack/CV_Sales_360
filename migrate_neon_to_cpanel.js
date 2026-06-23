const { Client } = require('pg');
const https = require('https');
const fs = require('fs');

// Disable TLS checks for self-signed cPanel certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configuration
const config = {
    neonConnectionString: 'postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    cpanelHost: 's1.sitechai.com',
    cpanelPort: 2083,
    username: 'cvacimot',
    password: '9J9q]91tYYyzB)',
    subdomain: 'sales',
    rootDomain: 'cv-acimotors.com',
    docRoot: 'public_html/sales'
};

const authHeader = 'Basic ' + Buffer.from(`${config.username}:${config.password}`).toString('base64');

// Safe escaping helper for MySQL inserts
function formatVal(val) {
    if (val === null || val === undefined) return 'NULL';
    if (val instanceof Date) {
        return `'${val.toISOString().split('T')[0]}'`;
    }
    if (typeof val === 'object') {
        const str = JSON.stringify(val);
        return `'${str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    }
    if (typeof val === 'number') {
        return val.toString();
    }
    return `'${val.toString().replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// UAPI upload files helper
function uploadFiles(destinationDir, filesArray) {
    return new Promise((resolve, reject) => {
        const boundary = '----NodeCpanelUploadBoundary' + Math.random().toString(36).substring(2);
        const chunks = [];

        chunks.push(Buffer.from(`--${boundary}\r\n`));
        chunks.push(Buffer.from(`Content-Disposition: form-data; name="dir"\r\n\r\n`));
        chunks.push(Buffer.from(`${destinationDir}\r\n`));
        chunks.push(Buffer.from(`--${boundary}\r\n`));
        chunks.push(Buffer.from(`Content-Disposition: form-data; name="overwrite"\r\n\r\n`));
        chunks.push(Buffer.from(`1\r\n`));

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
            hostname: config.cpanelHost,
            port: config.cpanelPort,
            path: '/execute/Fileman/upload_files',
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length
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

// UAPI delete file helper
function deleteFile(dir, filename) {
    return new Promise((resolve, reject) => {
        const path = `/execute/Fileman/fileop?op=unlink&sourcefiles=${encodeURIComponent(filename)}&dir=${encodeURIComponent(dir)}`;
        const options = {
            hostname: config.cpanelHost,
            port: config.cpanelPort,
            path: path,
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Length': 0
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve());
        });
        req.on('error', (err) => reject(err));
        req.end();
    });
}

// Hit HTTP URL helper
function triggerUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

async function run() {
    console.log("=== Sales360 Neon to cPanel Data Migrator ===");
    
    // Connect to Neon DB
    console.log("Connecting to Neon PostgreSQL database...");
    const client = new Client({ connectionString: config.neonConnectionString });
    await client.connect();
    console.log("✓ Connected successfully!");

    const tables = [
        'users',
        'territories',
        'models',
        'targets',
        'notices',
        'links',
        'projections',
        'sales',
        'emi',
        'recovery_od',
        'tiv_brands',
        'tiv_submissions',
        'app_settings'
    ];

    let sqlDump = "SET FOREIGN_KEY_CHECKS = 0;\n\n";

    for (const table of tables) {
        console.log(`Fetching data from Neon table "${table}"...`);
        
        // Truncate tables first
        sqlDump += `TRUNCATE TABLE \`${table}\`;\n`;
        
        // Get rows
        const res = await client.query(`SELECT * FROM ${table}`);
        if (res.rows.length === 0) {
            console.log(`ℹ Table "${table}" is empty. Skipping inserts...`);
            continue;
        }

        const columns = Object.keys(res.rows[0]);
        const colList = columns.map(c => `\`${c}\``).join(', ');

        for (const row of res.rows) {
            const values = columns.map(c => formatVal(row[c])).join(', ');
            sqlDump += `INSERT INTO \`${table}\` (${colList}) VALUES (${values});\n`;
        }
        sqlDump += "\n";
        console.log(`✓ Prepared ${res.rows.length} rows for "${table}".`);
    }

    sqlDump += "SET FOREIGN_KEY_CHECKS = 1;\n";
    await client.end();
    console.log("✓ Closed connection to Neon DB.");

    // Prepare run_migration.php script
    const runMigrationPhp = `<?php
header("Content-Type: application/json");
define('DB_HOST', 'localhost');
define('DB_USER', 'cvacimot_dbuser');
define('DB_PASS', 'Shahriar@0123');
define('DB_NAME', 'cvacimot_sales');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    if (file_exists('cpanel_migrated_data.sql')) {
        $sql = file_get_contents('cpanel_migrated_data.sql');
        $pdo->exec($sql);
        echo json_encode(["status" => "success", "message" => "Database successfully migrated!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Migration SQL file not found."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database execution failed: " . $e->getMessage()]);
}
?>`;

    // Upload migration files to cPanel
    console.log("Uploading migration scripts to cPanel...");
    await uploadFiles(config.docRoot, [
        { name: 'cpanel_migrated_data.sql', content: Buffer.from(sqlDump) },
        { name: 'run_migration.php', content: Buffer.from(runMigrationPhp) }
    ]);
    console.log("✓ Migration files uploaded successfully!");

    // Execute run_migration.php via cPanel server temporary URL
    const triggerUri = `https://${config.cpanelHost}/~${config.username}/${config.subdomain}/run_migration.php`;
    console.log(`Triggering remote migration script: ${triggerUri}...`);
    try {
        const responseText = await triggerUrl(triggerUri);
        console.log("Migration response:", responseText);
    } catch (e) {
        console.log(`ℹ Trigger note: Unable to verify direct HTTP status (possibly due to network routing). Retrying with HTTP...`);
        try {
            const httpUri = `http://${config.cpanelHost}/~${config.username}/${config.subdomain}/run_migration.php`;
            const responseText = await triggerUrl(httpUri);
            console.log("Migration response (HTTP):", responseText);
        } catch (err) {
            console.error("✗ Failed to execute remote script. Please trigger manually in browser by visiting:", triggerUri);
        }
    }

    // Cleanup: Delete temporary migration scripts on server
    console.log("Cleaning up temporary migration files on cPanel...");
    try {
        await deleteFile(config.docRoot, 'run_migration.php');
        await deleteFile(config.docRoot, 'cpanel_migrated_data.sql');
        console.log("✓ Server-side cleanup complete!");
    } catch (e) {
        console.warn("ℹ Cleanup warning:", e.message);
    }

    console.log("\n=============================================");
    console.log("✓ DATA MIGRATION PROCESS COMPLETED!");
    console.log("=============================================");
}

run().catch(console.error);
