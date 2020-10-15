/**
 * reCAPTCHA worker function
 * Cloudflare Workers
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} event
 */
async function handleRequest (event) {
  // Generate the CORS headers I'll have to return with requests
  const corsHeaders = setCorsHeaders(new Headers())

  try {
    const requestMethod = event.request.method
    const requestUrl = new URL(event.request.url)
    console.log(requestUrl)

    // Always return the same CORS info
    if (requestMethod === 'OPTIONS') {
      return new Response('', { headers: corsHeaders })
    }

    if (requestMethod !== 'POST') {
      return new Response('Invalid request method', {
        status: 400,
        headers: corsHeaders
      })
    }

    console.log(event.request)
    // const requestBody = await event.request.json()
    const recaptchaToken = event.request.headers.get('g-recaptcha')
    if (!recaptchaToken) {
      return new Response('Invalid reCAPTCHA', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Get reCAPTCHA secret from KV (encrypted at rest and in transit)
    const recaptchaSecret = await RECAPTCHA.get('recaptchasecret')
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
      {
        method: 'POST'
      }
    )

    const recaptchaBody = await recaptchaResponse.json()
    if (!recaptchaBody.success) {
      // reCaptcha failed
      return new Response('reCAPTCHA failed', {
        status: 400,
        headers: corsHeaders
      })
    }

    return new Response('', { status: 202, headers: corsHeaders })
  } catch (err) {
    console.error(err)
    return new Response(err.stack, { status: 500, headers: corsHeaders })
  }
}

function setCorsHeaders (headers) {
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST, GET')
  headers.set(
    'Access-Control-Allow-Headers',
    'access-control-allow-headers, g-recaptcha'
  )
  headers.set('Access-Control-Max-Age', 1728185)
  return headers
}
