// ============================================
// Configuration - 여기에 설정값을 입력하세요
// ============================================
const CONFIG = {
  // Google Apps Script 배포 URL (Step 2에서 생성)
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwVjPoanqg9GMFZXrGXcaOXp-cGIXXXDCepYrGLFb_qg2GLunRmai9W6zuf9KBY18wrSg/exec',

  // 관리자 알림 받을 이메일 (Google Sheets에서 처리)
  ADMIN_EMAIL: 'YOUR_EMAIL_HERE',
};

// ============================================
// Form Submission Handler
// ============================================
async function handleSubmit(event, formType) {
  event.preventDefault();

  const form = event.target;
  const name = form.querySelector('input[name="name"]').value.trim();
  const phone = form.querySelector('input[name="phone"]').value.trim();

  // Validation
  if (!name || !phone) {
    alert('이름과 전화번호를 모두 입력해주세요.');
    return false;
  }

  // Phone number format validation
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  if (!phoneRegex.test(phone.replace(/-/g, ''))) {
    alert('올바른 전화번호를 입력해주세요.');
    return false;
  }

  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '신청 중...';
  submitBtn.classList.add('loading');

  try {
    const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        phone: phone,
        formType: formType,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    });

    // Show success modal
    document.getElementById('successModal').classList.add('active');

    // Reset form
    form.reset();

  } catch (error) {
    console.error('Submit error:', error);
    alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.classList.remove('loading');
  }

  return false;
}

// ============================================
// Modal
// ============================================
function closeModal() {
  document.getElementById('successModal').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('successModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ============================================
// Phone number auto-format (010-1234-5678)
// ============================================
document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', function(e) {
    let value = this.value.replace(/[^0-9]/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 7) {
      this.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
    } else if (value.length > 3) {
      this.value = value.slice(0, 3) + '-' + value.slice(3);
    } else {
      this.value = value;
    }
  });
});
