<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// SQLite connection
$db = new SQLite3(__DIR__ . '/database.sqlite');
$db->busyTimeout(5000);

// Get all carried forward entries
$result = $db->query("SELECT id, timestamp, sales_month, sales_year FROM manual_deliveries WHERE is_carried_forward = 1");

$count = 0;
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $monthMap = ["January"=>"01", "February"=>"02", "March"=>"03", "April"=>"04", "May"=>"05", "June"=>"06", "July"=>"07", "August"=>"08", "September"=>"09", "October"=>"10", "November"=>"11", "December"=>"12"];
    $m = $row['sales_month'];
    $mNum = isset($monthMap[$m]) ? $monthMap[$m] : '01';
    $yr = $row['sales_year'];
    
    $newTimestamp = "{$yr}-{$mNum}-01 10:00:00";
    
    if ($row['timestamp'] !== $newTimestamp) {
        $stmt = $db->prepare("UPDATE manual_deliveries SET timestamp = :ts WHERE id = :id");
        $stmt->bindValue(':ts', $newTimestamp, SQLITE3_TEXT);
        $stmt->bindValue(':id', $row['id'], SQLITE3_TEXT);
        $stmt->execute();
        echo "Updated {$row['id']} to {$newTimestamp}\n";
        $count++;
    }
}
echo "Total updated: $count\n";
