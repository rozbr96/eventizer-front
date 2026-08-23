
import { PaginatedResult, APIEndpoint } from './common-entities'

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

export default class extends APIEndpoint {
  list(): Promise<PaginatedEvents> {
    return new Promise((resolve) => {
      this.doRequest({ endpoint: '/events', method: 'GET' })
        .then((response) => {
          resolve(response.json())
        })
    })
  }
}

