<?php
// Disable error reporting output to prevent warning leakages from contaminating JSON responses
error_reporting(0);
ini_set('display_errors', 0);

// Set secure cookie flags
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_use_only_cookies', 1);
ini_set('session.use_strict_mode', 1);

session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Define cPanel MySQL database connection settings
define('DB_HOST', 'localhost');
define('DB_USER', 'cvacimot_dbuser');
define('DB_PASS', 'Shahriar@0123');
define('DB_NAME', 'cvacimot_sales');

// Only allow POST requests for execution
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Only POST method is allowed']);
    exit;
}

// Read the raw JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Security Patch: XSS Sanitization Helper
function isJsonString($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

function sanitizeInputRecursive($data, $skipKeys = []) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            if (in_array($key, $skipKeys, true)) continue;
            $data[$key] = sanitizeInputRecursive($value, $skipKeys);
        }
        return $data;
    }
    if (is_string($data)) {
        if (isJsonString($data) && $data !== "null" && $data !== "true" && $data !== "false" && !is_numeric($data)) {
            return $data; // skip JSON strings
        }
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    return $data;
}

$input = sanitizeInputRecursive($input, ['query']);


$action = isset($input['action']) ? $input['action'] : null;

try {
    // Connect to MySQL
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // Self-healing database check: if any required table is missing, seed database automatically from cpanel_setup.sql
    
    // Table check for active_sessions
    $checkSessions = $pdo->query("SHOW TABLES LIKE 'active_sessions'")->rowCount();
    if ($checkSessions === 0) {
        $pdo->exec("CREATE TABLE IF NOT EXISTS active_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(128) NOT NULL UNIQUE,
            user_id VARCHAR(50) NOT NULL,
            user_name VARCHAR(100),
            user_role VARCHAR(50) NOT NULL,
            ip_address VARCHAR(100),
            user_agent TEXT,
            device_info VARCHAR(255),
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    $requiredTables = ['users', 'territories', 'models', 'targets', 'notices', 'links', 'projections', 'sales', 'emi', 'recovery_od', 'tiv_brands', 'tiv_submissions', 'app_settings'];
    $missingTable = false;
    foreach ($requiredTables as $t) {
        if ($pdo->query("SHOW TABLES LIKE '$t'")->rowCount() === 0) {
            $missingTable = true;
            break;
        }
    }
    if ($missingTable && file_exists('cpanel_setup.sql')) {
        $setupSql = file_get_contents('cpanel_setup.sql');
        $pdo->exec($setupSql);
    }

    // Check if sales table has 'is_manual' column, if not, add manual columns
    $checkSalesManual = $pdo->query("SHOW COLUMNS FROM sales LIKE 'is_manual'")->rowCount();
    if ($checkSalesManual === 0) {
        $pdo->exec("ALTER TABLE sales ADD COLUMN customer_name VARCHAR(255) DEFAULT NULL");
        $pdo->exec("ALTER TABLE sales ADD COLUMN chassis_no VARCHAR(100) DEFAULT NULL");
        $pdo->exec("ALTER TABLE sales ADD COLUMN purpose_of_use VARCHAR(255) DEFAULT NULL");
        $pdo->exec("ALTER TABLE sales ADD COLUMN financials JSON DEFAULT NULL");
        $pdo->exec("ALTER TABLE sales ADD COLUMN discounts JSON DEFAULT NULL");
        $pdo->exec("ALTER TABLE sales ADD COLUMN old_customer_id VARCHAR(50) DEFAULT NULL");
        $pdo->exec("ALTER TABLE sales ADD COLUMN is_manual BOOLEAN DEFAULT FALSE");
        $pdo->exec("ALTER TABLE sales ADD COLUMN approval_status VARCHAR(50) DEFAULT NULL");
        $pdo->exec("ALTER TABLE sales ADD COLUMN admin_comments TEXT DEFAULT NULL");
        $pdo->exec("ALTER TABLE sales ADD COLUMN timestamp VARCHAR(50) DEFAULT NULL");
    }

    $checkSalesCF = $pdo->query("SHOW COLUMNS FROM sales LIKE 'is_carried_forward'")->rowCount();
    if ($checkSalesCF === 0) {
        $pdo->exec("ALTER TABLE sales ADD COLUMN is_carried_forward BOOLEAN DEFAULT FALSE");
    }

    // Auto-heal: Ensure any manual delivery (s_man_*) has is_manual = 1
    $pdo->exec("UPDATE sales SET is_manual = 1 WHERE id LIKE 's_man_%' AND (is_manual IS NULL OR is_manual = 0)");

    // Migrate any existing manual deliveries from settings to sales table
    $stmtSettings = $pdo->query("SELECT settings_json FROM app_settings WHERE id = '1'");
    $settingsRow = $stmtSettings->fetch();
    if ($settingsRow && !empty($settingsRow['settings_json'])) {
        $settings = json_decode($settingsRow['settings_json'], true);
        if (isset($settings['manualDeliveries']) && is_array($settings['manualDeliveries'])) {
            $stmtInsert = $pdo->prepare("INSERT INTO sales (id, customer_id, district, territory_id, upazila, brand, model, unit_qty, fy, sales_year, sales_month, sale_type, customer_name, chassis_no, purpose_of_use, financials, discounts, old_customer_id, is_manual, approval_status, admin_comments, timestamp, is_carried_forward) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmtUpdateManual = $pdo->prepare("UPDATE sales SET is_manual = 1 WHERE id = ?");

            foreach ($settings['manualDeliveries'] as $del) {
                // Check if already exists in sales
                $stmtCheck = $pdo->prepare("SELECT id FROM sales WHERE id = ?");
                $stmtCheck->execute([$del['id']]);
                $exists = $stmtCheck->fetch();
                if (!$exists) {
                    $isCF = (isset($del['is_carried_forward']) && ($del['is_carried_forward'] == 1 || $del['is_carried_forward'] === true || $del['is_carried_forward'] === '1')) ? 1 : 0;
                    $stmtInsert->execute([
                        $del['id'],
                        isset($del['customer_id']) ? $del['customer_id'] : null,
                        isset($del['district']) ? $del['district'] : null,
                        isset($del['territory_id']) ? $del['territory_id'] : null,
                        isset($del['upazila']) ? $del['upazila'] : null,
                        isset($del['brand']) ? $del['brand'] : null,
                        isset($del['model']) ? $del['model'] : null,
                        isset($del['unit_qty']) ? $del['unit_qty'] : 1,
                        isset($del['fy']) ? $del['fy'] : null,
                        isset($del['sales_year']) ? $del['sales_year'] : null,
                        isset($del['sales_month']) ? $del['sales_month'] : null,
                        isset($del['sale_type']) ? $del['sale_type'] : null,
                        isset($del['customer_name']) ? $del['customer_name'] : null,
                        isset($del['chassis_no']) ? $del['chassis_no'] : null,
                        isset($del['purpose_of_use']) ? $del['purpose_of_use'] : null,
                        isset($del['financials']) ? (is_array($del['financials']) ? json_encode($del['financials']) : $del['financials']) : null,
                        isset($del['discounts']) ? (is_array($del['discounts']) ? json_encode($del['discounts']) : $del['discounts']) : null,
                        isset($del['old_customer_id']) ? $del['old_customer_id'] : null,
                        1, // is_manual
                        isset($del['approval_status']) ? $del['approval_status'] : 'Pending Approval',
                        isset($del['admin_comments']) ? $del['admin_comments'] : '',
                        isset($del['timestamp']) ? $del['timestamp'] : null,
                        $isCF
                    ]);
                } else {
                    $stmtUpdateManual->execute([$del['id']]);
                }
            }
        }
    }

    if ($action === 'login') {
        $userId = isset($input['userId']) ? $input['userId'] : '';
        $employeeId = isset($input['employeeId']) ? $input['employeeId'] : '';

        // Query the user
        $stmt = $pdo->prepare("SELECT id, name, role, email, territories, area_name, employee_id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user && trim((string)$user['employee_id']) === trim((string)$employeeId)) {
            // Authentication successful!
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_territories'] = $user['territories'];
            $_SESSION['user_name'] = $user['name'];

            // Set remember me cookie for 30 days
            $salt = 'aci_sales360_secure_salt_2026';
            $token = hash('sha256', $user['id'] . ':' . $employeeId . ':' . $salt);
            setcookie('aci_remember_me', $user['id'] . ':' . $token, time() + 30 * 86400, '/', '', false, true);

            // Return user info (excluding credentials)
            unset($user['employee_id']);
            $user['territories'] = json_decode($user['territories']);
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid Employee ID for the selected Area/User.']);
        }
        exit;
    }

    if ($action === 'logout') {
        session_destroy();
        setcookie('aci_remember_me', '', time() - 3600, '/');
        echo json_encode(['success' => true]);
        exit;
    }

    // Check if user is authenticated via session or auto-login cookie
    if (!isset($_SESSION['user_id']) && isset($_COOKIE['aci_remember_me'])) {
        $parts = explode(':', $_COOKIE['aci_remember_me'], 2);
        if (count($parts) === 2) {
            $cookieUserId = $parts[0];
            $cookieToken = $parts[1];
            
            $stmt = $pdo->prepare("SELECT id, role, territories, employee_id FROM users WHERE id = ?");
            $stmt->execute([$cookieUserId]);
            $cookieUser = $stmt->fetch();
            
            if ($cookieUser) {
                $salt = 'aci_sales360_secure_salt_2026';
                $expectedToken = hash('sha256', $cookieUser['id'] . ':' . $cookieUser['employee_id'] . ':' . $salt);
                if (hash_equals($expectedToken, $cookieToken)) {
                    // Re-authenticate session
                    $_SESSION['user_id'] = $cookieUser['id'];
                    $_SESSION['user_role'] = $cookieUser['role'];
                    $_SESSION['user_territories'] = $cookieUser['territories'];
                }
            }
        }
    }

    
    // Update active_sessions for authenticated requests
    if (isset($_SESSION['user_id'])) {
        $sessId = session_id();
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        
        $deviceInfo = 'Desktop PC';
        if (preg_match('/mobile/i', $ua)) $deviceInfo = 'Mobile Device';
        if (preg_match('/android/i', $ua)) $deviceInfo = 'Android Phone';
        if (preg_match('/iphone/i', $ua)) $deviceInfo = 'iPhone';
        if (preg_match('/ipad/i', $ua)) $deviceInfo = 'iPad';
        if (preg_match('/macintosh|mac os x/i', $ua)) $deviceInfo = 'Mac computer';
        if (preg_match('/windows/i', $ua)) $deviceInfo = 'Windows PC';
        if (preg_match('/linux/i', $ua) && !preg_match('/android/i', $ua)) $deviceInfo = 'Linux PC';
        
        $browser = 'Browser';
        if (preg_match('/chrome/i', $ua)) $browser = 'Chrome';
        else if (preg_match('/firefox/i', $ua)) $browser = 'Firefox';
        else if (preg_match('/safari/i', $ua)) $browser = 'Safari';
        else if (preg_match('/edge/i', $ua)) $browser = 'Edge';
        
        $deviceFull = "$deviceInfo ($browser)";
        $userName = $_SESSION['user_name'] ?? $_SESSION['user_id'];
        
        try {
            $stmtSess = $pdo->prepare("INSERT INTO active_sessions (session_id, user_id, user_name, user_role, ip_address, user_agent, device_info, last_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW()) 
                ON DUPLICATE KEY UPDATE last_active = NOW(), user_name = VALUES(user_name), ip_address = VALUES(ip_address), device_info = VALUES(device_info)");
            $stmtSess->execute([$sessId, $_SESSION['user_id'], $userName, $_SESSION['user_role'], $ip, $ua, $deviceFull]);
        } catch (Exception $e) {}
    }

    // Otherwise, check if user is authenticated
    $isAuthenticated = isset($_SESSION['user_id']);

    if ($action === 'add_manual_delivery') {
        if (!$isAuthenticated) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }
        
        $delivery = isset($input['delivery']) ? $input['delivery'] : null;
        if (!$delivery) {
            http_response_code(400);
            echo json_encode(['error' => 'Delivery data is required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO sales (id, customer_id, district, territory_id, upazila, brand, model, unit_qty, fy, sales_year, sales_month, sale_type, customer_name, chassis_no, purpose_of_use, financials, discounts, old_customer_id, is_manual, approval_status, admin_comments, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id");
        $stmt->execute([
            $delivery['id'],
            $delivery['customer_id'],
            $delivery['district'],
            $delivery['territory_id'],
            $delivery['upazila'],
            $delivery['brand'],
            $delivery['model'],
            (int)$delivery['unit_qty'],
            $delivery['fy'],
            (int)$delivery['sales_year'],
            $delivery['sales_month'],
            $delivery['sale_type'],
            $delivery['customer_name'],
            $delivery['chassis_no'],
            $delivery['purpose_of_use'],
            is_array($delivery['financials']) ? json_encode($delivery['financials']) : $delivery['financials'],
            is_array($delivery['discounts']) ? json_encode($delivery['discounts']) : $delivery['discounts'],
            $delivery['old_customer_id'],
            1, // is_manual
            $delivery['approval_status'],
            $delivery['admin_comments'],
            $delivery['timestamp']
        ]);

        echo json_encode(['success' => true, 'affected_rows' => $stmt->rowCount()]);
        exit;
    }

    if (isset($input['query'])) {
        $query = $input['query'];
        $params = isset($input['params']) ? $input['params'] : [];
        $trimmedQuery = trim(preg_replace('/\s+/', ' ', $query));

        // 1. Pre-Authentication Data Filtering (Select Users and Territories)
        if (!$isAuthenticated) {
            // Allow SELECT from users but return ONLY public fields, and SELECT from territories
            if (preg_match('/^SELECT\s+\*\s+FROM\s+users$/i', $trimmedQuery)) {
                $stmt = $pdo->query("SELECT id, name, role, territories, area_name FROM users");
                $data = $stmt->fetchAll();
                echo json_encode(['data' => $data]);
                exit;
            }
            if (preg_match('/^SELECT\s+\*\s+FROM\s+territories$/i', $trimmedQuery)) {
                $stmt = $pdo->query("SELECT * FROM territories");
                $data = $stmt->fetchAll();
                echo json_encode(['data' => $data]);
                exit;
            }
            
            // Block all other queries
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }

        // Block comment markers or query-stacking semi-colons to prevent SQL injection bypasses
        if (preg_match('/(--|\/\*|#|;)/', $query)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid Query: Comment markers or multiple statements are not allowed.']);
            exit;
        }

        // 2. Query Whitelist WAF Validation (For Authenticated Users)
        $isQueryAllowed = false;

        // Compile regex whitelist of allowed SQL statement structures
        $whitelist = [
            '/^SELECT\s+\*\s+FROM\s+(targets|projections|emi|sales|recovery_od|users|territories|models|notices|links|tiv_brands|app_settings|tiv_submissions|active_sessions)(\s+ORDER\s+BY\s+[a-z0-9_]+\s+(ASC|DESC))?$/i',
            '/^DELETE\s+FROM\s+active_sessions\s+WHERE\s+id\s*=\s*\?$/i',
            '/^UPDATE\s+models\s+SET\s+brand\s*=\s*\?,\s*name\s*=\s*\?\s+WHERE\s+id\s*=\s*\?$/i',
            '/^INSERT\s+INTO\s+models\s*\(id,\s*brand,\s*name\)\s*VALUES\s*\(\?,\s*\?,\s*\?\)$/i',
            '/^DELETE\s+FROM\s+models\s+WHERE\s+id\s*=\s*\?$/i',
            '/^UPDATE\s+users\s+SET\s+name\s*=\s*\?,\s*role\s*=\s*\?,\s*employee_id\s*=\s*\?,\s*email\s*=\s*\?,\s*territories\s*=\s*\?,\s*area_name\s*=\s*\?\s+WHERE\s+id\s*=\s*\?$/i',
            '/^INSERT\s+INTO\s+users\s*\(id,\s*name,\s*role,\s*email,\s*password,\s*employee_id,\s*territories,\s*area_name\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^DELETE\s+FROM\s+users\s+WHERE\s+id\s*=\s*\?$/i',
            '/^INSERT\s+INTO\s+territories\s*\(id,\s*name,\s*district,\s*upazilas\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^UPDATE\s+users\s+SET\s+territories\s*=\s*\?\s+WHERE\s+id\s*=\s*\?$/i',
            '/^DELETE\s+FROM\s+territories\s+WHERE\s+id\s*=\s*\?$/i',
            '/^INSERT\s+INTO\s+notices\s*\(id,\s*title,\s*message,\s*timestamp,\s*filetype,\s*filename\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^DELETE\s+FROM\s+(targets|projections|sales|emi|recovery_od|models|users|territories|notices|links)\s+WHERE\s+id\s*=\s*\?$/i',
            '/^DELETE\s+FROM\s+(targets|projections|sales|emi|recovery_od|models|users|territories|notices|links)\s+WHERE\s+id\s+IN\s*\(\s*(\?\s*,\s*)*\?\s*\)$/i',
            '/^DELETE\s+FROM\s+(targets|projections|emi|recovery_od|notices|links)$/i',
            '/^DELETE\s+FROM\s+sales(\s+WHERE\s+.*?)?$/i',
            
            '/^INSERT\s+INTO\s+targets\s*\(id,\s*fy,\s*month,\s*territory_id,\s*upazila,\s*district,\s*brand,\s*sale_type,\s*target_qty\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^INSERT\s+INTO\s+projections\s*\(id,\s*fy,\s*month,\s*territory_id,\s*brand,\s*sale_type,\s*projection_qty\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^INSERT\s+INTO\s+emi\s*\(id,\s*customer_code,\s*customer,\s*phone,\s*location,\s*delivery_date,\s*first_inst_date,\s*overdue_count,\s*overdue_total,\s*installment,\s*collected,\s*territory_id,\s*brand,\s*model,\s*installment_no\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+id\s*=\s*id$/i',
            '/^INSERT\s+INTO\s+sales\s*\(id,\s*customer_id,\s*district,\s*territory_id,\s*upazila,\s*brand,\s*model,\s*unit_qty,\s*fy,\s*sales_year,\s*sales_month,\s*sale_type\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)(\s+ON\s+DUPLICATE\s+KEY\s+UPDATE\s+.*?)?$/i',
            '/^INSERT\s+INTO\s+sales\s*\(id,\s*customer_id,\s*district,\s*territory_id,\s*upazila,\s*brand,\s*model,\s*unit_qty,\s*fy,\s*sales_year,\s*sales_month,\s*sale_type,\s*customer_name,\s*chassis_no,\s*purpose_of_use,\s*financials,\s*discounts,\s*old_customer_id,\s*is_manual,\s*approval_status,\s*admin_comments,\s*timestamp\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^UPDATE\s+sales\s+SET\s+customer_name\s*=\s*\?,\s*chassis_no\s*=\s*\?,\s*brand\s*=\s*\?,\s*model\s*=\s*\?,\s*sale_type\s*=\s*\?,\s*purpose_of_use\s*=\s*\?,\s*admin_comments\s*=\s*\?,\s*financials\s*=\s*\?,\s*discounts\s*=\s*\?\s+WHERE\s+id\s*=\s*\?$/i',
            '/^UPDATE\s+sales\s+SET\s+approval_status\s*=\s*\'Done\'\s+WHERE\s+id\s*=\s*\?$/i',
            '/^DELETE\s+FROM\s+sales\s+WHERE\s+is_manual\s*=\s*1$/i',
            '/^INSERT\s+INTO\s+recovery_od\s*\(id,\s*fy,\s*month,\s*territory_id,\s*perfile_od,\s*total_overdue\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+id\s*=\s*id$/i',
            '/^UPDATE\s+emi\s+SET\s+collected\s*=\s*\?\s+WHERE\s+(id|customer_code)\s*=\s*\?$/i',
            '/^UPDATE\s+app_settings\s+SET\s+settings_json\s*=\s*\?(?:\s+WHERE\s+id\s*=\s*\'1\')?$/i',
            '/^INSERT\s+INTO\s+tiv_submissions\s*\(id,\s*territory,\s*month,\s*brand,\s*submission_data\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?\)\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+id\s*=\s*id$/i',
            '/^INSERT\s+INTO\s+links\s*\(id,\s*title,\s*url,\s*type,\s*icon\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^UPDATE\s+links\s+SET\s+title\s*=\s*\?,\s*url\s*=\s*\?,\s*type\s*=\s*\?,\s*icon\s*=\s*\?\s+WHERE\s+id\s*=\s*\?$/i',
            '/^UPDATE\s+(targets|projections|sales|emi|recovery_od)\s+SET\s+.*?\s+WHERE\s+.*?$/i'
        ];

        foreach ($whitelist as $pattern) {
            if (preg_match($pattern, $trimmedQuery)) {
                $isQueryAllowed = true;
                break;
            }
        }

        if (!$isQueryAllowed) {
            http_response_code(403);
            echo json_encode(['error' => 'Security Access Denied: SQL query blocked by API Gateway WAF.']);
            exit;
        }

        
        $upperQuery = strtoupper($trimmedQuery);
        // --- Security Patch: RBAC Enforcement ---
        $isAdmin = ($_SESSION['user_role'] === 'admin');
        
        if (!$isAdmin) {
            // Block DELETE operations
            if (stripos($upperQuery, 'DELETE FROM') === 0) {
                http_response_code(403); echo json_encode(['error' => 'Security Access Denied: Only admins can delete records.']); exit;
            }
            // Block Approval Status manipulation
            if (preg_match('/UPDATE\s+sales\s+SET\s+approval_status/i', $upperQuery)) {
                http_response_code(403); echo json_encode(['error' => 'Security Access Denied: Only admins can approve sales.']); exit;
            }
            // Block user, territory, model, settings manipulations
            if (preg_match('/(INSERT INTO|UPDATE)\s+(users|territories|models|notices|links|app_settings)/i', $upperQuery)) {
                http_response_code(403); echo json_encode(['error' => 'Security Access Denied: Only admins can modify core system data.']); exit;
            }
        }

        // --- Security Patch: Privilege Escalation Prevention ---
        if (preg_match('/^SELECT\s+\*\s+FROM\s+users$/i', $trimmedQuery)) {
            $query = "SELECT id, name, role, territories, area_name, email FROM users"; // Strips employee_id
        }

        // --- Security Patch: Row-Level Security (RLS) ---
        if (!$isAdmin && $_SESSION['user_role'] !== 'subadmin' && preg_match('/^SELECT\s+\*\s+FROM\s+(sales|emi|targets|projections|recovery_od)$/i', $trimmedQuery, $matches)) {
            $table = strtolower($matches[1]);
            $territories = json_decode($_SESSION['user_territories'], true);
            if (!is_array($territories)) $territories = [];
            
            if (empty($territories)) {
                $query = "SELECT * FROM $table WHERE 1=0";
            } else {
                $inClause = implode(',', array_fill(0, count($territories), '?'));
                $query = "SELECT * FROM $table WHERE territory_id IN ($inClause)";
                $params = $territories; // Override params
            }
        }

        // Prepare and execute statement
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        $data = [];
        $upperQuery = strtoupper(trim($query));
        if (stripos($upperQuery, 'SELECT') === 0 || stripos($upperQuery, 'SHOW') === 0) {
            $data = $stmt->fetchAll();

        } else {
            $data = [
                'affected_rows' => $stmt->rowCount(),
                'last_insert_id' => $pdo->lastInsertId()
            ];
        }

        echo json_encode(['data' => $data]);
        exit;
    }

    echo json_encode(['error' => 'Invalid action or query']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
