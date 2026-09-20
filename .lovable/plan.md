# Landing and authentication update

## Changes
- Add a primary **Try it free** button on the homepage linking directly to `/auth`.
- Make Google login the first option on `/auth`.
- Make account creation the default email form and primary action.
- Keep **Log in** as the clear secondary option for existing users, with password recovery unchanged.
- Preserve real Google OAuth behavior and redirect successful Google sessions directly to `/app`.

## Verification
- Check homepage and authentication layouts on mobile and desktop.
- Confirm each option opens the correct flow and protected app redirect behavior remains intact.
- Confirm the app builds without errors.
