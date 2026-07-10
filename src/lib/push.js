import { getPushPublicKey, subscribePush } from "@/api/pushApi";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

let registering = false;
let done = false;

/**
 * Đăng ký Web Push: cài service worker, xin quyền nếu cần, tạo subscription
 * và gửi lên backend. An toàn để gọi nhiều lần (idempotent).
 */
export async function registerPush() {
  if (done || registering) return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined") {
    return;
  }

  if (Notification.permission === "default") {
    const perm = await Notification.requestPermission().catch(() => "denied");
    if (perm !== "granted") return;
  } else if (Notification.permission !== "granted") {
    return;
  }

  registering = true;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    const res = await getPushPublicKey();
    const { enabled, publicKey } = res.data?.data || {};
    if (!enabled || !publicKey) return;

    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }
    await subscribePush(sub.toJSON());
    done = true;
  } catch {
    /* trình duyệt không hỗ trợ / bị từ chối — bỏ qua */
  } finally {
    registering = false;
  }
}
