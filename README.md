# Google reCAPTCHA v3 Cloudflare Worker
Google reCAPTCHA v3 Cloudflare Worker that handles the server-side verification of your reCAPTCHA.

## Installation

This requires you to have a Cloudflare Workers account and have the Workers CLI installed. If you haven't already, follow this https://developers.cloudflare.com/workers/get-started/guide

1. Deploy it 

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/HR/recaptcha-worker)

2. Set your [reCAPTCHA secret key](https://developers.google.com/recaptcha/intro) environment variable

```
$ wrangler secret put RECAPTCHA_SECRET --env recaptcha-worker
```

3. Write the client-side request code (see Usage) 

## Usage

### Request

From your client-side, make a `POST` request to your deployed cloudflare worker endpoint with the header field `g-recaptcha` set to your reCAPTCHA token.

Like so:

```Javascript
$.ajax({
  type: 'POST',
  url: 'https://recaptcha-worker.YOUR-SUBDOMAIN.workers.dev',
  headers: { 'g-recaptcha': YOUR_RECAPTCHA_TOKEN },
  error: function (res, status, error) {
    if (res.status === 400) {
      // Verification failed
    } else {
      // An error occured
      console.log(res.responseText)
    }
  },
  success: function (res) {
    // Verification successful 
    
    // POST the form data to your backend or something
  }
})
```

### Response

If the verification request succeeds, you'll get a `202` HTTP status code response with the body `reCAPTCHA passed`. 

If the verification request fails, you will get `400` HTTP status code response with the body `reCAPTCHA failed`. 

Otherwise, for any other error, you will get `500` HTTP status code response with the body being the error stack. 
