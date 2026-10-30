/* =========================================================
   الإعدادات – عدّل هنا فقط
   ========================================================= */
const CONFIG = {
  username: "@MINO",
  bioLines: [                       // سطور النبذة تتبدل وتكتب تلقائيًا
    " ❤️ بسم الله الرحمان الرحيم والصلاة و السلام على أشرف المرسلين",
    "Peaky Blinders ❤️",
    "welcome to my page ❤️"
    
  ],
  discordId: "@milano_mino",                    // ← ضع الـ Discord ID (أرقام) هنا لتفعيل البطاقة الحية
  volume: 0.5
};

/* ========================================================= */
const $ = (id) => document.getElementById(id);
const video = $("bg-video");
const card = $("card");

/* ---------- 1) شاشة الدخول: تبدأ الفيديو + الصوت ---------- */
$("enter-screen").addEventListener("click", async () => {
  $("enter-screen").classList.add("leave");
  video.volume = CONFIG.volume;
  $("volume").value = CONFIG.volume;
  try { await video.play(); } catch (e) { console.warn("play blocked", e); }
  card.classList.remove("hidden");
  typeBio();
});

/* ---------- 2) التحكم بالصوت ---------- */
$("volume").addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = false;
  $("mute-btn").textContent = e.target.value == 0 ? "🔇" : "🔊";
});
$("mute-btn").addEventListener("click", () => {
  video.muted = !video.muted;
  $("mute-btn").textContent = video.muted ? "🔇" : "🔊";
});

/* ---------- 3) النبذة بتأثير الكتابة ---------- */
function typeBio() {
  const el = $("bio");
  let line = 0, char = 0, deleting = false;
  (function tick() {
    const text = CONFIG.bioLines[line];
    el.textContent = text.slice(0, char);
    if (!deleting && char === text.length) { deleting = true; return setTimeout(tick, 1800); }
    if (deleting && char === 0) { deleting = false; line = (line + 1) % CONFIG.bioLines.length; }
    char += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 40 : 90);
  })();
}

/* ---------- 4) عدّاد الزيارات (محلي بسيط) ---------- */
(function views() {
  let n = 0;
  try {
    n = parseInt(localStorage.getItem("views") || "0", 10) + 1;
    localStorage.setItem("views", n);
  } catch (e) { n = 1; }
  $("view-count").textContent = n;
})();

/* ---------- 5) Discord الحي عبر Lanyard ---------- */
async function loadDiscord() {
  if (!CONFIG.discordId) return;
  $("discord-link").href = `https://discord.com/users/${CONFIG.discordId}`;
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordId}`);
    const { success, data } = await res.json();
    if (!success) return;

    const u = data.discord_user;
    const avatar = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    $("avatar").src = avatar;                       // الصورة الكبيرة من ديسكورد
    $("dc-avatar").src = avatar;
    $("dc-name").textContent = u.global_name || u.username;
    $("dc-status").className = "status " + data.discord_status;

    // النشاط: لعبة / Spotify / حالة مخصصة
    const act = (data.activities || []).find(a => a.type !== 4) ||
                (data.activities || []).find(a => a.type === 4);
    $("dc-activity").textContent = act
      ? (act.type === 4 ? (act.state || "") : (act.name + (act.details ? " – " + act.details : "")))
      : "@" + u.username;

    $("discord-card").classList.remove("hidden");
  } catch (err) {
    console.error("Lanyard error", err);
  }
}
loadDiscord();
setInterval(loadDiscord, 30000);   // تحديث كل 30 ثانية
