
import { useState } from "react";
import { Accordion, CloseButton, Drawer, Image, Portal, Span } from "@chakra-ui/react";
import { Event } from "@/lib/api";
import { FaEye } from "react-icons/fa";
import { Button } from "@chakra-ui/react";
import EventPurchaseButton from "./purchase-button";

export default function EventDrawerButton({ event }: { event: Event }) {
  const [open, setOpen] = useState(false)

  const accordionValue = (source: object, key: string) => {
    const value = (source as Record<string, unknown>)[key]

    return value === null || value === undefined || value === "" ? "Não informado" : String(value)
  }

  const accordionInfo = (
    source: object,
    keyValuePairs: Array<{ key: string, value: string }>,
  ) => {
    return (
      <Accordion.Root multiple>
        {keyValuePairs.map(({ key, value }) => (
          <Accordion.Item key={key} value={key}>
            <Accordion.ItemTrigger style={{ cursor: "pointer" }}>
              <Span flex="1">{value}</Span>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>{accordionValue(source, key)}</Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    )
  }

  const eventAccordionDataInfo = [
    { key: 'title', value: 'Evento' },
    { key: 'description', value: 'Descrição' },
    { key: 'formatted_datetime', value: 'Data/Horário' },
    { key: 'address_title', value: 'Local' },
    { key: 'address', value: 'Endereço' },
    { key: 'capacity', value: 'Capacidade' },
    { key: 'price', value: 'Preço' },
    { key: 'translated_status', value: 'Status' },
  ]

  const eventMetadataAccordionDataInfo = [
    { key: 'title', value: 'Filme' },
    { key: 'overview', value: 'Sinopse' },
    { key: 'popularity', value: 'Popularidade' },
  ]

  return (
    <Drawer.Root size="lg" open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Drawer.Trigger asChild>
        <Button colorPalette={"green"}>
          <FaEye />

          Visualizar Evento
        </Button>
      </Drawer.Trigger>

      <Portal>
        <Drawer.Backdrop />

        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{event.title}</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              <Image src={event.metadata.poster_url} alt={event.metadata.title} />

              {accordionInfo(event, eventAccordionDataInfo)}

              {accordionInfo(event.metadata, eventMetadataAccordionDataInfo)}
            </Drawer.Body>

            <Drawer.Footer>
              <EventPurchaseButton eventId={event.id} fullWidth />
            </Drawer.Footer>

            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
