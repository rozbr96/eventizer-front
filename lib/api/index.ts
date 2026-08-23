
import AuthEndpoint from './auth'
import EventsEndpoint from './events'

class API {
  auth: AuthEndpoint
  events: EventsEndpoint

  constructor(endpoint: string) {
    this.auth = new AuthEndpoint(endpoint)
    this.events = new EventsEndpoint(endpoint)
  }
}

export * from './events'

export default new API('http://localhost:3000')

