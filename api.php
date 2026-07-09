<?php
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

$action = isset($input['action']) ? $input['action'] : null;

try {
    // Connect to MySQL
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // Self-healing database check: if 'users' table doesn't exist, seed database automatically
    $checkTable = $pdo->query("SHOW TABLES LIKE 'users'")->rowCount();
    if ($checkTable === 0 && file_exists('cpanel_setup.sql')) {
        $setupSql = file_get_contents('cpanel_setup.sql');
        $pdo->exec($setupSql);
    }

    if ($action === 'login') {
        $userId = isset($input['userId']) ? $input['userId'] : '';
        $employeeId = isset($input['employeeId']) ? $input['employeeId'] : '';

        // Query the user
        $stmt = $pdo->prepare("SELECT id, name, role, email, territories, area_name, employee_id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user && $user['employee_id'] === $employeeId) {
            // Authentication successful!
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_territories'] = $user['territories'];

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
        echo json_encode(['success' => true]);
        exit;
    }

    // Otherwise, check if user is authenticated
    $isAuthenticated = isset($_SESSION['user_id']);

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
            '/^SELECT\s+\*\s+FROM\s+(targets|projections|emi|sales|recovery_od|users|territories|models|notices|links|tiv_brands|app_settings|tiv_submissions)$/i',
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
            '/^DELETE\s+FROM\s+(targets|projections|recovery_od|notices|links)$/i',
            '/^DELETE\s+FROM\s+sales\s+WHERE\s+fy\s*=\s*\'2025-26\'$/i',
            '/^DELETE\s+FROM\s+sales\s+WHERE\s+fy\s*=\s*\'2024-25\'$/i',
            '/^INSERT\s+INTO\s+targets\s*\(id,\s*fy,\s*month,\s*territory_id,\s*upazila,\s*brand,\s*sale_type,\s*target_qty\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^INSERT\s+INTO\s+projections\s*\(id,\s*fy,\s*month,\s*territory_id,\s*brand,\s*sale_type,\s*projection_qty\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^INSERT\s+INTO\s+emi\s*\(id,\s*customer_code,\s*customer,\s*phone,\s*location,\s*delivery_date,\s*first_inst_date,\s*overdue_count,\s*overdue_total,\s*installment,\s*collected,\s*territory_id,\s*brand,\s*model,\s*installment_no\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+id\s*=\s*id$/i',
            '/^INSERT\s+INTO\s+sales\s*\(id,\s*customer_id,\s*district,\s*territory_id,\s*upazila,\s*brand,\s*model,\s*unit_qty,\s*fy,\s*sales_year,\s*sales_month,\s*sale_type\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+id\s*=\s*id$/i',
            '/^INSERT\s+INTO\s+recovery_od\s*\(id,\s*fy,\s*month,\s*territory_id,\s*perfile_od,\s*total_overdue\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\)\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+id\s*=\s*id$/i',
            '/^UPDATE\s+emi\s+SET\s+collected\s*=\s*\?\s+WHERE\s+id\s*=\s*\?$/i',
            '/^UPDATE\s+app_settings\s+SET\s+settings_json\s*=\s*\?$/i',
            '/^INSERT\s+INTO\s+tiv_submissions\s*\(id,\s*territory,\s*month,\s*brand,\s*submission_data\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?\)\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+id\s*=\s*id$/i',
            '/^INSERT\s+INTO\s+links\s*\(id,\s*title,\s*url,\s*type,\s*icon\)\s*VALUES\s*\(\?,\s*\?,\s*\?,\s*\?,\s*\?\)$/i',
            '/^UPDATE\s+links\s+SET\s+title\s*=\s*\?,\s*url\s*=\s*\?,\s*type\s*=\s*\?,\s*icon\s*=\s*\?\s+WHERE\s+id\s*=\s*\?$/i',
            '/^UPDATE\s+(targets|projections|sales|emi|recovery_od)\s+SET\s+.*?\s+WHERE\s+id\s*=\s*\?$/i'
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

        // Prepare and execute statement
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        $data = [];
        $upperQuery = strtoupper(trim($query));
        if (stripos($upperQuery, 'SELECT') === 0 || stripos($upperQuery, 'SHOW') === 0) {
            $data = $stmt->fetchAll();
            // Secure passwords and employee_ids in SELECT * FROM users outputs
            if (preg_match('/SELECT\s+\*\s+FROM\s+users/i', $trimmedQuery)) {
                foreach ($data as &$userRow) {
                    unset($userRow['password']);
                    unset($userRow['employee_id']);
                }
            }
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
