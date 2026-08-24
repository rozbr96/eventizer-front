
import AuthEndpoint from './auth'
import EventsEndpoint from './events'
import PurchasesEndpoint from './purchases'

class API {
  auth: AuthEndpoint
  events: EventsEndpoint
  purchases: PurchasesEndpoint

  constructor(endpoint: string) {
    this.auth = new AuthEndpoint(endpoint)
    this.events = new EventsEndpoint(endpoint)
    this.purchases = new PurchasesEndpoint(endpoint)
  }
}

export * from './events'

export default new API('http://localhost:3000')

