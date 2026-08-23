
export interface PaginatedResult<T> {
  page: number
  items: Array<T>
  total_count: number
  total_pages: number
}

export interface Event {
  id: number
  title: string
  description: string
  datetime: string
  address: string
  address_title: string
  capacity: 14
  price_in_cents: number
  status: string
  organizer_id: number
  metadata: any
}

export type PaginatedEvents = PaginatedResult<Event>

class API {
  constructor(private endpoint: string) { }

  listEvents(): Promise<PaginatedEvents> {
    return new Promise((resolve) => {
      this.doRequest({ endpoint: '/events', method: 'GET' })
        .then((response) => {
          resolve(response.json())
        })
    })
  }

  doRequest(props: {
    endpoint: string,
    method: 'GET' | 'POST',
    query?: {},
    body?: {},
  }) {
    const { endpoint, method, body, query } = props

    const requestOptions: RequestInit = { method }

    const queryString = Object.entries(query || {}).map(([key, value]) => `${key}=${value}`).join(',')
    const url = `${this.endpoint}${endpoint}?${queryString}`

    if (method === 'GET') requestOptions.body = JSON.stringify(body || {})

    return fetch(url, body)
  }
}

export default new API('http://localhost:3000')

