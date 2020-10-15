# Google reCAPTCHA Cloudflare Worker
reCAPTCHA Cloudflare Worker that handles the server-side verification of your reCAPTCHA.


[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/HR/recaptcha-worker)

Make sure to add your (reCAPTCHA secret key)[https://developers.google.com/recaptcha/intro]

```
$ wrangler secret put RECAPTCHA_SECRET --env recaptcha-worker
```