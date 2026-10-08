# Complete notification setup

## Build
- Finish the existing Firebase Cloud Messaging integration rather than replacing it.
- Register each signed-in browser safely, store its device token against the account, and allow that device to opt out without disabling other devices.
- Improve Settings with accurate permission, device, unavailable, and blocked states.
- Handle foreground and background notifications, open the correct same-origin Nuru page when clicked, and remove stale device tokens after failed delivery.
- Keep broadcast sending restricted to verified administrators.

## Verify
- Confirm the connected notification service credentials.
- Test Settings behavior for unsupported, embedded-preview, denied, and enabled states.
- Validate registration storage, administrator authorization, service-worker behavior, mobile layout, type safety, and the live build.

## External requirement
Browser notifications require the Firebase connection’s “Include web push” values. If those values remain unavailable after reconnecting, the app will clearly show that notifications are not ready rather than requesting permission or pretending they are enabled.