import {auth, db} from "./firebase-config.js";
import {GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {ref, update, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const $ = id => document.getElementById(id);
let confirmation = null, recaptcha = null, currentUser = null;

function status(message, error=false){ $("status").textContent=message; $("status").style.color=error?"#ff9b91":"#9be7a7"; }
function switchPane(which){
  $("phonePane").hidden = which!=="phone";
  $("otpPane").hidden = which!=="otp";
  $("phoneTab").classList.toggle("active",which==="phone");
  $("verifyTab").classList.toggle("active",which==="otp");
}
async function saveProfile(user){
  const provider = user.providerData?.[0]?.providerId || "unknown";
  await update(ref(db, "novaUsers/"+user.uid), {
    uid:user.uid,
    displayName:user.displayName || "",
    email:user.email || "",
    phone:user.phoneNumber || "",
    photoURL:user.photoURL || "",
    provider,
    lastLoginAt:Date.now()
  });
  location.href="./player-dashboard.html";
}

$("phoneTab").onclick=()=>switchPane("phone");
$("verifyTab").onclick=()=>{if(confirmation)switchPane("otp");else status("Pehle mobile number par OTP bhejo.",true);};

$("googleBtn").onclick=async()=>{
  status("Google login opening...");
  try{
    const result=await signInWithPopup(auth,new GoogleAuthProvider());
    await saveProfile(result.user);
  }catch(e){status("Google login failed: "+(e.code||e.message),true);}
};

$("sendOtp").onclick=async()=>{
  const phone=$("phone").value.trim();
  if(!/^\+[1-9]\d{7,14}$/.test(phone)){status("Country code ke saath number likho. Example: +919876543210",true);return;}
  try{
    status("OTP bheja ja raha hai...");
    if(!recaptcha) recaptcha=new RecaptchaVerifier(auth,"recaptcha-container",{size:"normal"});
    confirmation=await signInWithPhoneNumber(auth,phone,recaptcha);
    switchPane("otp");status("OTP bhej diya gaya. SMS check karo.");
  }catch(e){
    status("OTP send nahi hua: "+(e.code||e.message),true);
    if(recaptcha){try{await recaptcha.clear();}catch(_){}recaptcha=null;}
  }
};

$("verifyOtp").onclick=async()=>{
  const code=$("otp").value.trim();
  if(!/^\d{6}$/.test(code)){status("6 digit OTP enter karo.",true);return;}
  try{
    status("OTP verify ho raha hai...");
    const result=await confirmation.confirm(code);
    await saveProfile(result.user);
  }catch(e){status("OTP verification failed: "+(e.code||e.message),true);}
};

onAuthStateChanged(auth,user=>{currentUser=user;});
