NOVA ESPORTS 2.0 — PHASE 1 STARTER FILES

Is ZIP mein 4 naye files hain:
1. login.html
2. nova-auth.js
3. player-dashboard.html
4. nova-dashboard.js

IMPORTANT:
- Ye files existing firebase-config.js ko use karti hain.
- Existing homepage, CS admin, 2v2 admin, BR scoreboard ko replace nahi karti.
- Ye abhi Phase 1 ka login/profile starter hai. Full tournament registration/payment system abhi is ZIP mein nahi hai.

GITHUB MEIN ADD KARNE KE STEPS:
1. Apna GitHub repository kholo:
   https://github.com/novaesportsff07-lab/NovaEsports07
2. Add file > Upload files par jao.
3. ZIP ko pehle phone/computer par extract karo.
4. Extract ki hui 4 files ko repository ke ROOT folder mein upload karo.
5. Commit changes karo.
6. Site par login.html open karo:
   https://novaesportsff07-lab.github.io/NovaEsports07/login.html

FIREBASE CONSOLE SETUP (LOGIN TEST SE PEHLE):
1. Firebase Console > Authentication > Sign-in method.
2. Google provider enable karo.
3. Phone provider enable karo.
4. Authentication > Settings > Authorized domains mein:
   novaesportsff07-lab.github.io add/verify karo.
5. Phone OTP ke liye Firebase reCAPTCHA/SMS configuration aur SMS region policy check karo.

DATABASE NOTE:
- Profile data novaUsers/{Firebase Auth UID} path mein save hota hai.
- Existing database rules ko bina inspect kiye change mat karna.
- Agar permission_denied aaye, to Realtime Database Rules mein authenticated user ko sirf apne novaUsers/{uid} record par required access dene wali rule carefully configure/test karni hogi.
- Kabhi bhi public read/write rules (.read: true / .write: true) mat lagana.
- Admin roles client-side profile fields se assign mat karna.

TEST:
- Google login.
- Phone OTP.
- Dashboard redirect.
- IGN aur Free Fire UID save.
- Logout/login.
- Existing CS admin, 2v2 admin aur scoreboard alag se verify karo.

Security rules aur repository ke remaining files audit ke baad hi Phase 2 registration/payment development add karna chahiye.
