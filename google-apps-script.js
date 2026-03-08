// ============================================
// Google Apps Script - Google Sheets에 배포하세요
// ============================================
//
// 설정 방법:
// 1. Google Sheets 새로 만들기 (https://sheets.google.com)
// 2. 시트 이름을 "상담신청" 으로 변경
// 3. 첫 번째 행에 헤더 입력: 이름 | 전화번호 | 신청위치 | 신청시간 | 문자발송
// 4. 확장 프로그램 > Apps Script 클릭
// 5. 이 코드를 붙여넣기
// 6. 배포 > 새 배포 > 웹 앱 선택
//    - 실행 주체: 본인
//    - 액세스: 누구나
// 7. 배포 URL을 script.js의 GOOGLE_SCRIPT_URL에 입력
//

// ============================================
// CoolSMS 설정
// ============================================
const COOLSMS_API_KEY = 'YOUR_COOLSMS_API_KEY';       // CoolSMS API Key
const COOLSMS_API_SECRET = 'YOUR_COOLSMS_API_SECRET'; // CoolSMS API Secret
const SENDER_PHONE = '01000000000';                     // 발신번호 (본인 번호)
const ADMIN_PHONE = '01000000000';                      // 관리자 알림 받을 번호

// ============================================
// POST 요청 처리
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = data.name;
    const phone = data.phone;
    const formType = data.formType || 'unknown';
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    // 1. Google Sheets에 저장
    saveToSheet(name, phone, formType, timestamp);

    // 2. 신청자에게 접수 확인 문자 발송
    const customerMsg = `[IT국비지원 교육센터]\n${name}님, 상담 신청이 접수되었습니다.\n\n빠른 시일 내에 전문 상담사가 연락드리겠습니다.\n\n감사합니다.`;
    sendSMS(phone, customerMsg);

    // 3. 관리자에게 알림 문자 발송
    const adminMsg = `[새 상담신청]\n이름: ${name}\n전화: ${phone}\n위치: ${formType}\n시간: ${timestamp}`;
    sendSMS(ADMIN_PHONE, adminMsg);

    return ContentService.createTextOutput(
      JSON.stringify({ result: 'success' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// Google Sheets에 데이터 저장
// ============================================
function saveToSheet(name, phone, formType, timestamp) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('상담신청');
  if (!sheet) {
    const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('상담신청');
    newSheet.appendRow(['이름', '전화번호', '신청위치', '신청시간', '문자발송']);
    newSheet.appendRow([name, phone, formType, timestamp, '발송완료']);
  } else {
    sheet.appendRow([name, phone, formType, timestamp, '발송완료']);
  }
}

// ============================================
// CoolSMS 문자 발송
// ============================================
function sendSMS(to, message) {
  try {
    const url = 'https://api.coolsms.co.kr/messages/v4/send';

    // Clean phone number
    const cleanPhone = to.replace(/-/g, '');

    const payload = {
      message: {
        to: cleanPhone,
        from: SENDER_PHONE,
        text: message,
        type: 'SMS'
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'HMAC-SHA256 apiKey=' + COOLSMS_API_KEY + ', date=' + new Date().toISOString() + ', salt=' + generateSalt() + ', signature=' + generateSignature()
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // 간단한 방식 - CoolSMS SDK 대신 REST API 직접 호출
    const simpleUrl = 'https://api.coolsms.co.kr/messages/v4/send-many/detail';
    const simplePayload = {
      messages: [{
        to: cleanPhone,
        from: SENDER_PHONE,
        text: message
      }]
    };

    // Basic Auth 방식 (더 간단)
    const credentials = Utilities.base64Encode(COOLSMS_API_KEY + ':' + COOLSMS_API_SECRET);
    const simpleOptions = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Basic ' + credentials
      },
      payload: JSON.stringify(simplePayload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(simpleUrl, simpleOptions);
    Logger.log('SMS Response: ' + response.getContentText());
    return true;

  } catch (error) {
    Logger.log('SMS Error: ' + error.toString());
    // 문자 발송 실패해도 시트 저장은 유지
    return false;
  }
}

// ============================================
// 유틸리티
// ============================================
function generateSalt() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 16);
}

function generateSignature() {
  // CoolSMS HMAC-SHA256 서명 생성
  const date = new Date().toISOString();
  const salt = generateSalt();
  const data = date + salt;
  const signature = Utilities.computeHmacSha256Signature(data, COOLSMS_API_SECRET);
  return Utilities.base64Encode(signature);
}

// ============================================
// 나중에 카카오 알림톡으로 변경할 때
// ============================================
// sendSMS 함수를 sendKakaoAlimtalk 함수로 교체하면 됩니다.
// 카카오 비즈니스 채널 + 알림톡 템플릿 등록 필요
//
// function sendKakaoAlimtalk(to, templateId, variables) {
//   // 카카오 알림톡 API 호출
//   // https://developers.kakao.com/docs/latest/ko/message/rest-api
// }
