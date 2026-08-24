import { APIEndpoint, type PaginatedResult, type User } from "./common-entities";
import { presentEvent, type Event, type EventMetadataResponse, type EventResponse } from "./events";
import { cacheTicket, presentTicket, type Ticket, type TicketResponse } from "./tickets";

export interface PurchaseResponse {
  id: number
  status: string
  holder: string
  document_number: string
  client_id: number
  event_id: number
  client: User
  event: EventResponse<EventMetadataResponse>
  ticket?: PurchaseTicketResponse | null
}

export interface Purchase extends Omit<PurchaseResponse, "event"> {
  event: Event
}

export type PaginatedPurchases = PaginatedResult<Purchase>

export interface PurchaseTicketResponse {
  id: number
  holder: string
  document_number: string
  code: string
  consumed: boolean
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

  list({ page = 1, itemsPerPage = 10 }: { page?: number, itemsPerPage?: number } = {}): Promise<PaginatedPurchases> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        endpoint: '/purchases',
        method: 'GET',
        query: { page, itemsPerPage }
      }).then(async (response) => {
        const data = await response.json()

        if (!response.ok) return reject(data)

        const purchases = data.items || []
        const presentedPurchases = purchases.map((purchase: PurchaseResponse) => this.present(purchase))

        presentedPurchases.forEach((purchase: Purchase) => {
          this.cache.set(purchase.id, purchase)
        })

        resolve({
          ...data,
          items: presentedPurchases
        })
      })
    })
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

  supplyPersonalInfo(purchase_id: number, holder: string, document_number: string): Promise<Purchase> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        endpoint: `/purchases/${purchase_id}/supply-personal-info`,
        method: 'POST',
        body: { holder, document_number }
      }).then(async (response) => {
        const data = await response.json()

        if (!response.ok) return reject(data)

        const purchase = this.present(data)

        this.cache.set(purchase.id, purchase)

        resolve(purchase)
      })
    })
  }

  pay(purchase_id: number, body: Record<string, unknown>): Promise<Ticket> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        endpoint: `/purchases/${purchase_id}/pay`,
        method: 'POST',
        body
      }).then(async (response) => {
        const data = await response.json()

        if (!response.ok) return reject(data)

        resolve(cacheTicket(presentTicket(data as TicketResponse)))
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
