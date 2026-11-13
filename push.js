  const ONESIGNAL_APP_ID = "54b7c94c-9465-4764-9342-0ba48c552a1d";
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      serviceWorkerPath: "yaqeen-app/OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/yaqeen-app/" },
    });
    const bell = document.getElementById("bell");
    const iosBrowser = /iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone;
    const refresh = () => { bell.style.display = (!iosBrowser && OneSignal.Notifications.isPushSupported() && !OneSignal.Notifications.permission) ? "block" : "none"; };
    bell.onclick = async () => { await OneSignal.Notifications.requestPermission(); refresh(); };
    OneSignal.Notifications.addEventListener("permissionChange", refresh);
    refresh();
  });
