
export interface PaginatedResult<T> {
  page: number
  items: Array<T>
  total_count: number
  total_pages: number
}

export class APIEndpoint {
  constructor(protected endpoint: string) { }

  doRequest(props: {
    endpoint: string,
    method: 'GET' | 'POST',
    query?: {},
    body?: {},
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

    return fetch(url, requestOptions)
  }
}
