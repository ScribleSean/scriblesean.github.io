# Message delivery setup

`MessagesApp` sends only the visitor's submitted chat bubbles. It does not retain
typing, deleted bubbles, the welcome copy, or any fake read/delivered state.

## Recommended zero-cost activation

Use FormSubmit's free AJAX endpoint. It does not require account registration:
the first submission to an address triggers an activation email, and confirming
that email activates delivery. FormSubmit also documents a random endpoint
string that can replace the email address after activation, which avoids
publishing the destination address in the deployed client.

1. The owner points one deliberate activation request at
   `https://formsubmit.co/ajax/sean.arackal@gmail.com` and confirms the
   activation email that arrives in that inbox. Do not use a visitor's message
   as this activation request.
2. Use the random endpoint string FormSubmit provides after confirmation.
3. Set `NEXT_PUBLIC_CONTACT_ENDPOINT` in the deployment environment to
   `https://formsubmit.co/ajax/<random-endpoint-string>`. For local work, set
   it in `.env.local`; do not commit that file.
4. Submit one intentional test conversation after activation and verify it
   reaches the target inbox.

The endpoint is intentionally a public environment value because browser form
submission requires it. No provider secret is stored in the client or this repo.
FormSubmit documents AJAX submission as cross-origin, matching the browser-side
transport used by this component.

## Current blocker

The repository has no configured endpoint and the FormSubmit destination has
not been activated. The owner must activate the endpoint before in-page delivery
can be enabled.
Until then, the app reports the configuration state honestly and exposes an
email fallback that opens a pre-filled message to `sean.arackal@gmail.com`.

## Sources

- [FormSubmit setup and activation](https://formsubmit.co/)
- [FormSubmit AJAX endpoint and random endpoint documentation](https://formsubmit.co/documentation)
- [FormSubmit activation FAQ](https://formsubmit.co/help)
- [Formspree free-tier comparison](https://help.formspree.io/articles/account-management/account-limits/)
