import { APIEndpoint, type User } from "./common-entities";
import { presentEvent, type Event, type EventMetadataResponse, type EventResponse } from "./events";

export interface PurchaseResponse {
  id: number
  status: string
  holder: string
  client_id: number
  event_id: number
  client: User
  event: EventResponse<EventMetadataResponse>
}

export interface Purchase extends Omit<PurchaseResponse, "event"> {
  event: Event
}

class PurchasesEndpoint extends APIEndpoint {
  private cache = new Map<number, Purchase>()

  getCached(purchase_id: number) {
    return this.cache.get(purchase_id)
  }

  private present(purchase: PurchaseResponse): Purchase {
    return {
      ...purchase,
      event: presentEvent(purchase.event)
    }
  }

  confirmEvent(purchaseId: number) {
    return new Promise<void>((resolve, reject) => {
      this.doRequest({ endpoint: `/purchases/${purchaseId}/confirm-event`, method: 'POST' })
        .then((response) => {
          if (response.ok) return resolve()

          reject()
        })
    })
  }


  get(purchase_id: number): Promise<Purchase> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        endpoint: `/purchases/${purchase_id}`, method: 'GET'
      }).then(async (response) => {
        const data = await response.json()

        if (!response.ok) return reject(data)

        const purchase = this.present(data)

        this.cache.set(purchase.id, purchase)

        resolve(purchase)
      })
    })
  }

  start(event_id: number): Promise<Purchase> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        endpoint: '/purchases', method: 'POST',
        body: { event_id }
      }).then(async (response) => {
        const data = await response.json()

        if (!response.ok) return reject(data)

        const purchase = this.present(data)

        this.cache.set(purchase.id, purchase)

        resolve(purchase)
      })
    })
  }
}

export default PurchasesEndpoint
