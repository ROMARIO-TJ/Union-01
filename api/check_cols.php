<?php
require_once 'config.php'; // I assume config.php exists and has $pdo
try {
    $stmt = $pdo->query("DESCRIBE players");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($cols);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
