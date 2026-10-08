<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The shared visual system uses semantic midnight-and-gold tokens, Instrument Serif display type, and Work Sans body type so public and authenticated surfaces remain coherent.
- Projects and files are account-owned cloud records; chat accepts a project ID and derives trusted context server-side so browser text cannot impersonate stored project context.
- Web notifications use Firebase Cloud Messaging through the linked server gateway; browser tokens remain account-owned records and each device manages only its own registration so opting out does not disable other devices.
