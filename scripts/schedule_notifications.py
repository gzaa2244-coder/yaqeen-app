"""يرتّب تنبيهات اليوم (الأذان، هل صليت؟، الأذكار) في OneSignal. يشغّله GitHub Actions كل يوم."""
import datetime as dt, json, os, urllib.request, urllib.error
from zoneinfo import ZoneInfo

APP_ID = os.environ.get("ONESIGNAL_APP_ID") or "54b7c94c-9465-4764-9342-0ba48c552a1d"
KEY = os.environ["ONESIGNAL_REST_KEY"].strip()
CITY, COUNTRY, METHOD = "Riyadh", "Saudi Arabia", 4          # أم القرى
TZ = ZoneInfo("Asia/Riyadh")
URL = "https://gzaa2244-coder.github.io/yaqeen-app/"
PRAYERS = [("Fajr", "الفجر"), ("Dhuhr", "الظهر"), ("Asr", "العصر"), ("Maghrib", "المغرب"), ("Isha", "العشاء")]


def get(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def send(title, body, when, tag):
    now = dt.datetime.now(TZ)
    if when <= now + dt.timedelta(minutes=1):
        print("skip (past):", tag); return
    payload = {
        "app_id": APP_ID, "target_channel": "push", "included_segments": ["Total Subscriptions"],
        "headings": {"en": title, "ar": title}, "contents": {"en": body, "ar": body},
        "send_after": when.strftime("%Y-%m-%d %H:%M:%S GMT+0300"), "url": URL,
        "web_push_topic": tag,
    }
    r = None
    for scheme in ("Key", "Basic"):          # المفاتيح الجديدة "Key" والقديمة "Basic"
        try:
            r = get("https://api.onesignal.com/notifications", json.dumps(payload).encode(),
                    {"Content-Type": "application/json; charset=utf-8", "Authorization": f"{scheme} {KEY}"})
            break
        except urllib.error.HTTPError as e:
            print(scheme, "->", e.code, e.read().decode()[:200])
            if e.code != 401:
                raise
    if r is None:
        raise SystemExit("❌ OneSignal رفض المفتاح: تأكد إن السر ONESIGNAL_REST_KEY هو App API Key من Settings ← Keys & IDs")
    print("scheduled", tag, when.strftime("%H:%M"), r.get("id"), r.get("errors", ""))


today = dt.datetime.now(TZ).date()
d = today.strftime("%d-%m-%Y")
t = get(f"https://api.aladhan.com/v1/timingsByCity/{d}?city={CITY}&country={COUNTRY.replace(' ', '%20')}&method={METHOD}")["data"]["timings"]
for key, name in PRAYERS:
    h, m = map(int, t[key][:5].split(":"))
    at = dt.datetime.combine(today, dt.time(h, m), TZ)
    send(f"🕌 أذان {name}", f"حان الآن وقت صلاة {name} حسب توقيت الرياض", at, f"adhan-{key}")
    send("🤲 هل صليت؟", f"هل صليت {name}؟ «إن الصلاة كانت على المؤمنين كتابًا موقوتًا»", at + dt.timedelta(minutes=25), f"prayed-{key}")
    if key == "Fajr":
        send("☀️ أذكار الصباح", "لا تنسَ أذكار الصباح، حصّن يومك", at + dt.timedelta(minutes=40), "adhkar-am")
    if key == "Asr":
        send("🌙 أذكار المساء", "حان وقت أذكار المساء", at + dt.timedelta(minutes=40), "adhkar-pm")
