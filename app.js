  const SITE = "https://yaqeen-platform.streamlit.app/?embed=true&embed_options=dark_theme";

  const DIRECT = "https://yaqeen-platform.streamlit.app/";
  const frame = document.getElementById("app"), splash = document.getElementById("splash");
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let opened = false;
  const goDirect = () => { if (!opened) { opened = true; location.replace(DIRECT); } };
  const inApp = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (false) {
    document.querySelector("#splash .dots").remove();
    document.getElementById("hint").innerHTML = '<button id="open" style="font:inherit;font-weight:600;border:0;border-radius:14px;padding:12px 26px;background:#c9a45c;color:#1d1a17">افتح المنصة</button>';
    document.getElementById("open").onclick = goDirect;
    document.getElementById("tap").remove();
  }
  else {
    frame.src = SITE;
    frame.addEventListener("load", () => setTimeout(() => { splash.style.opacity = 0; setTimeout(() => splash.remove(), 500); }, 600));
    setTimeout(() => { if (document.getElementById("splash")) goDirect(); }, 20000);
  }
  document.getElementById("splash").addEventListener("click", goDirect);
  setTimeout(() => { const h = document.getElementById("hint"); if (h) h.textContent = "المنصة تصحى من النوم… أول فتحة بعد فترة تاخذ دقيقة تقريبًا 🌙"; }, 6000);


  const box = document.getElementById("install"), go = document.getElementById("go"), itext = document.getElementById("itext");
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let dismissed = false; try { dismissed = localStorage.getItem("yq_install_x") === "1"; } catch (e) {}
  let deferred = null;
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); deferred = e;
    if (!standalone && !dismissed) box.style.display = "flex";
  });
  if (ios && !standalone && !dismissed) {
    itext.innerHTML = '<b>ثبّت تطبيق اليقين على الآيفون</b><br>اضغط زر المشاركة ' +
      '<svg class="share" viewBox="0 0 24 24" fill="none" stroke="#f3dc9b" stroke-width="2"><path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8"/></svg>' +
      ' تحت، وبعدها <b>إضافة إلى الشاشة الرئيسية</b>';
    go.style.display = "none";
    setTimeout(() => box.style.display = "flex", 2500);
  }
  go.onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; box.style.display = "none"; };
  document.getElementById("x").onclick = () => { box.style.display = "none"; try { localStorage.setItem("yq_install_x", "1"); } catch (e) {} };
  window.addEventListener("appinstalled", () => { box.style.display = "none"; });
