/**
 * reCAPTCHA Cloudflare Worker
 * Server-side Google reCAPTCHA validation
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest (request) {
  const corsHeaders = setCorsHeaders(new Headers())

  try {
    const requestMethod = request.method

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
    const recaptchaToken = request.headers.get('g-recaptcha')
    if (!recaptchaToken) {
      return new Response('Invalid reCAPTCHA token', {
        status: 400,
        headers: corsHeaders
      })
    }

    if (typeof RECAPTCHA_SECRET === 'undefined') {
      throw new Error('RECAPTCHA_SECRET secret not set')
    }

    // Verify token
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          secret: RECAPTCHA_SECRET,
          response: recaptchaToken
        })
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
    return new Response('reCAPTCHA passed', {
      status: 202,
      headers: corsHeaders
    })
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
