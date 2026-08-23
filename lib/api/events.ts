
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
  metadata: EventMetadata
}

export interface EventMetadata {
  id: number
  adult: boolean
  title: string
  video: boolean
  overview: string
  softcore: boolean
  genre_ids: Array<number>
  popularity: number
  vote_count: number
  poster_path: string
  release_date: string
  vote_average: number
  backdrop_path: string
  original_title: string
  original_language: string
}

export type PaginatedEvents = PaginatedResult<Event>

export default class extends APIEndpoint {
  get(event_id: number): Promise<Event> {
    return new Promise((resolve) => {
      this.doRequest({ endpoint: `/events/${event_id}`, method: 'GET' })
        .then((response) => { resolve(response.json()) })
    })
  }

  list(): Promise<PaginatedEvents> {
    return new Promise((resolve) => {
      this.doRequest({ endpoint: '/events', method: 'GET' })
        .then((response) => {
          resolve(response.json())
        })
    })
  }
}

