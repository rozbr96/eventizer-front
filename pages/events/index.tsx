
import { Group, Table } from '@chakra-ui/react'

import api, { type PaginatedEvents } from '@/lib/api/index'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

import EventDrawerButton from '@/components/events/drawer-button'
import EventPurchaseButton from '@/components/events/purchase-button'

export const getServerSideProps = (async () => {
  const events = await api.events.list()

  return { props: { events } }
}) satisfies GetServerSideProps<{ events: PaginatedEvents }>

export default function Events({ events }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const tableInfo =
    <Table.Row>
      <Table.ColumnHeader>Título</Table.ColumnHeader>
      <Table.ColumnHeader>Data</Table.ColumnHeader>
      <Table.ColumnHeader>Capacidade</Table.ColumnHeader>
      <Table.ColumnHeader>Status</Table.ColumnHeader>
      <Table.ColumnHeader>Ações</Table.ColumnHeader>
    </Table.Row>

  const loadingData =
    <Table.Row>
      <Table.Cell colSpan={5}>
        Carregando
      </Table.Cell>
    </Table.Row>

  const emptyData =
    <Table.Row>
      <Table.Cell colSpan={5}>
        Sem Eventos
      </Table.Cell>
    </Table.Row>

  const tableData = () => {
    if (!events) return loadingData
    if (events.items.length === 0) return emptyData

    return events.items.map((event) => {
      return <Table.Row key={event.id}>
        <Table.Cell>{event.title}</Table.Cell>
        <Table.Cell>{event.formatted_datetime}</Table.Cell>
        <Table.Cell>{event.capacity}</Table.Cell>
        <Table.Cell>{event.translated_status}</Table.Cell>
        <Table.Cell>
          <Group>
            <EventDrawerButton event={event} />

            <EventPurchaseButton eventId={event.id} />
          </Group>
        </Table.Cell>
      </Table.Row>
    })
  }

  return (
    <Table.Root>
      <Table.Header>
        {tableInfo}
      </Table.Header>

      <Table.Body>
        {tableData()}
      </Table.Body>

      <Table.Footer>
        {tableInfo}
      </Table.Footer>
    </Table.Root>
  );
}
