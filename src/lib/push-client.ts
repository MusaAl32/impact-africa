export type PushResult =
  | { status: "registered"; token: string }
  | { status: "not-configured" | "unsupported" | "open-in-new-tab" | "denied" };

export type PushAvailability =
  | "ready"
  | "not-configured"
  | "unsupported"
  | "open-in-new-tab"
  | "denied";

const TOKEN_KEY = "nuru-push-token";

function getFirebaseConfig() {
  const appId = import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID"] as string | undefined;
  return {
    config: {
      apiKey: (import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY"] as string | undefined) ?? "",
      projectId: (import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID"] as string | undefined) ?? "",
      appId: appId ?? "",
      messagingSenderId: appId?.split(":")[1] ?? "",
    },
    vapidKey: (import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY"] as string | undefined) ?? "",
  };
}

function hasConfiguration() {
  const { config, vapidKey } = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && config.appId && config.messagingSenderId && vapidKey);
}

export async function getPushAvailability(): Promise<PushAvailability> {
  if (!hasConfiguration()) return "not-configured";
  const { isSupported } = await import("firebase/messaging");
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !(await isSupported())) return "unsupported";
  if (window.top !== window.self) return "open-in-new-tab";
  if (Notification.permission === "denied") return "denied";
  return "ready";
}

export function getStoredPushToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Call from a click handler. Browser-only. */
export async function enablePush(): Promise<PushResult> {
  const { config, vapidKey } = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.appId || !vapidKey || !config.messagingSenderId) return { status: "not-configured" };
  const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !(await isSupported())) return { status: "unsupported" };
  if (window.top !== window.self) return { status: "open-in-new-tab" };
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return { status: "denied" };
  const { initializeApp, getApps } = await import("firebase/app");
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${new URLSearchParams(config).toString()}`);
  const app = getApps()[0] ?? initializeApp(config);
  const token = await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return { status: "denied" };
  try { window.localStorage.setItem(TOKEN_KEY, token); } catch { /* registration still works */ }
  return { status: "registered", token };
}

export async function disablePush() {
  const token = getStoredPushToken();
  try {
    if (hasConfiguration() && "serviceWorker" in navigator) {
      const { deleteToken, getMessaging, isSupported } = await import("firebase/messaging");
      if (await isSupported()) {
        const { initializeApp, getApps } = await import("firebase/app");
        const { config } = getFirebaseConfig();
        const app = getApps()[0] ?? initializeApp(config);
        await deleteToken(getMessaging(app));
      }
    }
  } finally {
    try { window.localStorage.removeItem(TOKEN_KEY); } catch { /* nothing to clear */ }
  }
  return token;
}

export async function listenForForegroundPush(
  notify: (message: { title: string; body?: string }) => void,
) {
  if (!hasConfiguration() || typeof window === "undefined") return () => undefined;
  const { getMessaging, isSupported, onMessage } = await import("firebase/messaging");
  if (!(await isSupported())) return () => undefined;
  const { initializeApp, getApps } = await import("firebase/app");
  const { config } = getFirebaseConfig();
  const app = getApps()[0] ?? initializeApp(config);
  return onMessage(getMessaging(app), (payload) => {
    const title = payload.notification?.title?.trim() || "Nuru AI";
    const body = payload.notification?.body?.trim();
    notify(body ? { title, body } : { title });
  });
}
