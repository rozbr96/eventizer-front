
import { PaginatedResult, APIEndpoint } from './common-entities'

export interface User {
  id: number
  name: string
}

export interface EventResponse<T = EventMetadataResponse> {
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
  organizer: User
  metadata: T
}

export interface EventMetadataResponse {
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

export interface Event extends EventResponse<EventMetadata> {
  formatted_datetime: string
  price: number
  formatted_price: string
  translated_status: string
}

export interface EventMetadata extends EventMetadataResponse {
  poster_url: string
  backdrop_url: string
  formatted_release_date: string
}

export type PaginatedEvents = PaginatedResult<Event>

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const translateStatus = (status: string) => {
  return {
    published: 'Publicado',
    canceled: 'Cancelado',
    ongoing: 'Em Andamento',
    done: 'Finalizado'
  }[status] || status
}

const present = (event: EventResponse<EventMetadataResponse>): Event => {
  const price = event.price_in_cents / 100

  return {
    ...event,
    formatted_datetime: new Date(event.datetime).toLocaleString(),
    price,
    translated_status: translateStatus(event.status),
    formatted_price: currencyFormatter.format(price),
    metadata: {
      ...event.metadata,
      formatted_release_date: new Date(event.metadata.release_date).toLocaleDateString(),
      backdrop_url: `https://image.tmdb.org/t/p/original/${event.metadata.backdrop_path}`,
      poster_url: `https://image.tmdb.org/t/p/original/${event.metadata.poster_path}`
    }
  }
}

export default class extends APIEndpoint {
  get(event_id: number): Promise<Event> {
    return new Promise((resolve, reject) => {
      this.doRequest({ endpoint: `/events/${event_id}`, method: 'GET' })
        .then(async (response) => {
          if (!response.ok) return reject()

          const event = await response.json()

          resolve(present(event))
        })
    })
  }

  list(): Promise<PaginatedEvents> {
    return new Promise((resolve, reject) => {
      this.doRequest({ endpoint: '/events', method: 'GET' })
        .then(async (response) => {
          if (!response.ok) return reject()

          const results = await response.json()

          results.items = results.items.map((item: EventResponse) => present(item))

          resolve(results)
        })
    })
  }
}

