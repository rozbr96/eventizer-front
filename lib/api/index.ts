
import EventsEndpoint from './events'

class API {
  events: EventsEndpoint

  constructor(endpoint: string) {
    this.events = new EventsEndpoint(endpoint)
  }
}

export * from './events'

export default new API('http://localhost:3000')

