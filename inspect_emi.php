<?php
// Temporary database inspection script - Deactivated for security
http_response_code(403);
echo json_encode(['error' => 'Access denied']);
