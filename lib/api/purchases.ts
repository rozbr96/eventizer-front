import { APIEndpoint, User } from "./common-entities";

export interface Purchase {
  id: number
  status: string
  holder: string
  client_id: number
  event_id: number
  client: User
  event: Event
}

export default class extends APIEndpoint {
  get(purchase_id: number) {
    return new Promise((resolve, reject) => {
      this.doRequest({
        endpoint: `/purchases/${purchase_id}`, method: 'GET'
      }).then(async (response) => {
        const data = await response.json()

        response.ok ? resolve(data) : reject(data)
      })
    })
  }

  start(event_id: number) {
    return new Promise<void>((resolve, reject) => {
      this.doRequest({
        endpoint: '/purchases', method: 'POST',
        body: { event_id }
      }).then(async (response) => {
        if (response.ok) return resolve()

        reject(await response.json())
      })
    })
  }
}

