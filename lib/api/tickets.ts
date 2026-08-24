import { APIEndpoint } from "./common-entities";
import { presentEvent, type Event, type EventMetadataResponse, type EventResponse } from "./events";
import { type Purchase, type PurchaseResponse } from "./purchases";

export interface TicketResponse {
  id: number;
  holder: string;
  code: string;
  purchase: PurchaseResponse;
  consumed: boolean;
  event: EventResponse<EventMetadataResponse>;
}

export interface Ticket extends Omit<TicketResponse, "purchase" | "event"> {
  purchase: Purchase;
  event: Event;
}

const ticketCache = new Map<number, Ticket>();

export const presentTicket = (ticket: TicketResponse): Ticket => {
  return {
    ...ticket,
    purchase: {
      ...ticket.purchase,
      event: presentEvent(ticket.purchase.event),
    },
    event: presentEvent(ticket.event),
  };
}

export const cacheTicket = (ticket: Ticket) => {
  ticketCache.set(ticket.id, ticket);

  return ticket;
}

class TicketsEndpoint extends APIEndpoint {
  getCached(ticket_id: number) {
    return ticketCache.get(ticket_id);
  }

  get(ticket_id: number): Promise<Ticket> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        endpoint: `/tickets/${ticket_id}`,
        method: "GET",
      }).then(async (response) => {
        const data = await response.json();

        if (!response.ok) return reject(data);

        resolve(cacheTicket(presentTicket(data)));
      });
    });
  }
}

export default TicketsEndpoint;
