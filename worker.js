/**
 * Recaptcha worker function
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
  const corsHeaders = setCorsHeaders(new Headers())

  try {
    const requestMethod = event.request.method

    // Allow CORS
    if (requestMethod === 'OPTIONS') {
      return new Response('', { headers: corsHeaders })
    }

    // Ensure POST request
    if (requestMethod !== 'POST') {
      return new Response('Invalid request method', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Ensure recaptcha token given
    const recaptchaToken = event.request.headers.get('g-recaptcha')
    if (!recaptchaToken) {
      return new Response('Invalid reCAPTCHA', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Get reCAPTCHA secret from KV and verify
    const recaptchaSecret = await RECAPTCHA.get('recaptchasecret')
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
      {
        method: 'POST'
      }
    )
    const recaptchaBody = await recaptchaResponse.json()

    // Handle failure
    if (!recaptchaBody.success) {
      return new Response('reCAPTCHA failed', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Success
    return new Response('reCAPTCHA passed', { status: 202, headers: corsHeaders })
  } catch (err) {
    // Handle unexpected errors
    console.error(err)
    return new Response(err.stack, { status: 500, headers: corsHeaders })
  }
}

// Set the required CORS headers
function setCorsHeaders (headers) {
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST')
  headers.set(
    'Access-Control-Allow-Headers',
    'access-control-allow-headers, g-recaptcha'
  )
  headers.set('Access-Control-Max-Age', 1728185)
  return headers
}
