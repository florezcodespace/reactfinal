export class HttpRequestError extends Error {
  constructor(message, { code = 'request_error', status = 0, url = '', cause } = {}) {
    super(message)
    this.name = 'HttpRequestError'
    this.code = code
    this.status = status
    this.url = url
    this.cause = cause
  }
}

export function isAbortError(error) {
  return error?.name === 'AbortError'
}

export async function fetchJson(
  url,
  { method = 'GET', body, signal, timeoutMs = 15000, headers } = {},
) {
  const controller = new AbortController()
  const forwardAbort = () => controller.abort()

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', forwardAbort, { once: true })
    }
  }

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const requestHeaders = new Headers(headers || {})
    const isJsonBody = body !== undefined && !(body instanceof FormData)

    if (isJsonBody && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : isJsonBody ? JSON.stringify(body) : body,
      signal: controller.signal,
    })
    const contentType = response.headers.get('content-type') || ''

    if (!response.ok) {
      throw new HttpRequestError(`Request failed with status ${response.status}`, {
        code: response.status >= 500 ? 'server_error' : 'request_error',
        status: response.status,
        url,
      })
    }

    if (response.status === 204) {
      return null
    }

    if (!contentType.includes('application/json')) {
      throw new HttpRequestError('Response is not valid JSON.', {
        code: 'invalid_content_type',
        status: response.status,
        url,
      })
    }

    return await response.json()
  } catch (error) {
    if (isAbortError(error) || error instanceof HttpRequestError) {
      throw error
    }

    throw new HttpRequestError(error.message || 'Network request failed.', {
      code: 'network_error',
      url,
      cause: error,
    })
  } finally {
    clearTimeout(timeoutId)

    if (signal) {
      signal.removeEventListener('abort', forwardAbort)
    }
  }
}
