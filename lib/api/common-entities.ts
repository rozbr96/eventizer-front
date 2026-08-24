
export interface User {
  id: number
  name: string
}

export interface PaginatedResult<T> {
  page: number
  items: Array<T>
  total_count: number
  total_pages: number
}

export class APIEndpoint {
  constructor(protected endpoint: string) { }

  private redirectToLogin() {
    if (typeof window === 'undefined') return
    if (window.location.pathname === '/login') return

    const redirect = `${window.location.pathname}${window.location.search}`
    const loginUrl = new URL('/login', window.location.origin)
    loginUrl.searchParams.set('redirect', redirect)

    window.location.href = loginUrl.toString()
  }

  private handleUnauthenticatedResponse(response: Response) {
    if (response.status === 401) this.redirectToLogin()

    return response
  }

  async doRequest(props: {
    endpoint: string,
    method: 'GET' | 'POST',
    query?: Record<string, unknown>,
    body?: Record<string, unknown>,
  }) {
    const { endpoint, method, body, query } = props

    const requestOptions: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const queryString = Object.entries(query || {}).map(([key, value]) => `${key}=${value}`).join('&')
    const url = `${this.endpoint}${endpoint}?${queryString}`

    if (method === 'POST') requestOptions.body = JSON.stringify(body || {})

    return fetch(url, requestOptions).then((response) => this.handleUnauthenticatedResponse(response))
  }
}
