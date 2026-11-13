import {auth,db} from "./firebase-config.js";
import {onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {ref,onValue,update} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const $=id=>document.getElementById(id);let user=null,loaded=false;
function msg(t,error=false){$("status").textContent=t;$("status").style.color=error?"#ff9b91":"#9be7a7";}
onAuthStateChanged(auth,u=>{
 if(!u){location.href="./login.html";return;}
 user=u;
 if(loaded)return;loaded=true;
 $("phone").value=u.phoneNumber||"";
 $("email").value=u.email||"";
 onValue(ref(db,"novaUsers/"+u.uid),s=>{
   const p=s.val()||{};
   if(!$("displayName").value)$("displayName").value=p.displayName||u.displayName||"";
   if(!$("ign").value)$("ign").value=p.ign||"";
   if(!$("gameUid").value)$("gameUid").value=p.gameUid||"";
 });
});
$("profileForm").onsubmit=async e=>{
 e.preventDefault();if(!user)return;
 const ign=$("ign").value.trim(),gameUid=$("gameUid").value.trim();
 if(gameUid&&!/^\d{8,12}$/.test(gameUid)){msg("Free Fire UID 8 se 12 digits ka hona chahiye.",true);return;}
 try{
  await update(ref(db,"novaUsers/"+user.uid),{
   uid:user.uid,displayName:$("displayName").value.trim(),
   email:user.email||"",phone:user.phoneNumber||"",
   ign,gameUid,profileUpdatedAt:Date.now()
  });
  msg("Player profile saved successfully.");
 }catch(err){msg("Save failed: "+(err.code||err.message),true);}
};
$("logout").onclick=()=>signOut(auth);
