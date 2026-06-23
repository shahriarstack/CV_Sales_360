<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Define cPanel MySQL database connection settings
define('DB_HOST', 'localhost');
define('DB_USER', 'cvacimot_dbuser');
define('DB_PASS', 'Password360!@#');
define('DB_NAME', 'cvacimot_sales360');

// Only allow POST requests for execution
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Only POST method is allowed']);
    exit;
}

// Read the raw JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['query'])) {
    echo json_encode(['error' => 'No query provided']);
    exit;
}

$query = $input['query'];
$params = isset($input['params']) ? $input['params'] : [];

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

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
