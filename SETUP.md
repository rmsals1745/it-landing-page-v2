# IT 국비지원 랜딩페이지 설정 가이드

## 1단계: Google Sheets 설정

1. [Google Sheets](https://sheets.google.com) 새로 만들기
2. 시트 이름을 `상담신청`으로 변경
3. 첫 번째 행에 헤더 입력: `이름` | `전화번호` | `신청위치` | `신청시간` | `문자발송`

## 2단계: Google Apps Script 배포

1. Google Sheets에서 `확장 프로그램` > `Apps Script` 클릭
2. `google-apps-script.js` 파일 내용을 붙여넣기
3. CoolSMS API 키 설정 (3단계 참고)
4. `배포` > `새 배포` > `웹 앱` 선택
   - 실행 주체: 본인
   - 액세스: **누구나**
5. 배포 URL 복사

## 3단계: CoolSMS 설정

1. [CoolSMS](https://coolsms.co.kr) 가입 (개인 가능)
2. 대시보드 > API 키 발급
3. 발신번호 등록 (본인 핸드폰 번호)
4. `google-apps-script.js`에 API Key, Secret, 발신번호 입력

## 4단계: 프론트엔드 연결

1. `script.js`의 `CONFIG.GOOGLE_SCRIPT_URL`에 2단계에서 복사한 URL 입력

## 5단계: Vercel 배포

```bash
npm i -g vercel
cd it-landing-page
vercel
```

## 나중에 카카오 알림톡으로 변경하려면

1. 사업자등록증 준비
2. [카카오 비즈니스](https://business.kakao.com) 채널 생성
3. 알림톡 템플릿 등록 및 승인
4. `google-apps-script.js`의 `sendSMS` 함수를 `sendKakaoAlimtalk`으로 교체
