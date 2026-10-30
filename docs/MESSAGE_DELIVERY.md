# Message delivery setup

`MessagesApp` sends only the visitor's chat bubbles that have not been sent yet,
plus any text still in the box. It does not send deleted bubbles or the welcome
message. Unsent bubbles show "Not sent yet", and the Send button stays visible
until they go out. "Delivered" appears only after the endpoint confirms success,
and delivered bubbles can no longer be edited or deleted. The thread logic is in
`lib/message-thread.ts`.

## Activate the free FormSubmit endpoint

Use FormSubmit's free AJAX endpoint. It needs no account. The first submission
to an address sends an activation email, and confirming that email turns on
delivery. After activation, FormSubmit also offers a random endpoint string to
use in place of the email address, so the deployed site does not publish the
address.

1. Send one activation request to
   `https://formsubmit.co/ajax/sean.arackal@gmail.com` and confirm the
   activation email in that inbox. Do not use a visitor's message as the
   activation request.
2. Use the random endpoint string FormSubmit provides after confirmation.
3. Set `NEXT_PUBLIC_CONTACT_ENDPOINT` in the deployment environment to
   `https://formsubmit.co/ajax/<random-endpoint-string>`. For local work, set
   it in `.env.local`, and do not commit that file.
4. Send one test conversation and check that it reaches the inbox.

The endpoint is a public environment variable on purpose, because the browser
submits the form. Neither the client nor this repo stores a provider secret.
FormSubmit accepts cross-origin AJAX submissions, which is how this component
sends. The transport parses the JSON response and reports Sent only when
`success` is `true`. An HTTP 200 response with `success: false` still shows as
an error.

## Status

The deploy workflow passes the repository variable `NEXT_PUBLIC_CONTACT_ENDPOINT`
to the build, and the variable is set. A build without it says that delivery is
not configured and shows an email link that opens a pre-filled message to
`sean.arackal@gmail.com`.

## Sources

- [FormSubmit setup and activation](https://formsubmit.co/)
- [FormSubmit AJAX endpoint and random endpoint documentation](https://formsubmit.co/documentation)
- [FormSubmit AJAX response handling](https://formsubmit.co/ajax-documentation)
- [FormSubmit activation FAQ](https://formsubmit.co/help)
- [Formspree free-tier comparison](https://help.formspree.io/articles/account-management/account-limits/)
