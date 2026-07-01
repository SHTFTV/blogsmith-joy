// Photo Wall push notification service worker.
// Receives a push event from the browser's push service (delivered on
// behalf of the Edge Function in supabase/functions/notify-guest-upload)
// and shows a real OS-level notification, even if no tab is open.

self.addEventListener("push", (event) => {
  let data = { title: "New Photo Wall submission", body: "A guest just shared something." };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // If the payload isn't JSON for some reason, fall back to the default text.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: { url: data.url || "/portal/photo-wall" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/portal/photo-wall";
  event.waitUntil(self.clients.openWindow(url));
});
