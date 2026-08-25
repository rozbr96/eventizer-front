
import AuthEndpoint from './auth'
import EventsEndpoint from './events'
import MoviesEndpoint from './movies'
import PurchasesEndpoint from './purchases'
import TicketsEndpoint from './tickets'

class API {
  auth: AuthEndpoint
  events: EventsEndpoint
  movies: MoviesEndpoint
  purchases: PurchasesEndpoint
  tickets: TicketsEndpoint

  constructor(endpoint: string) {
    this.auth = new AuthEndpoint(endpoint)
    this.events = new EventsEndpoint(endpoint)
    this.movies = new MoviesEndpoint(endpoint)
    this.purchases = new PurchasesEndpoint(endpoint)
    this.tickets = new TicketsEndpoint(endpoint)
  }
}

export * from './events'
export * from './movies'
export * from './purchases'
export * from './tickets'

const apiEndpoint =
  typeof window === 'undefined'
    ? process.env.NEXT_SERVER_API_HOST || 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_API_HOST || '/api'

const api = new API(apiEndpoint)

export default api
