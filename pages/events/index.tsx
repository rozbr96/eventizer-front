
import { FaEye, FaTicketAlt } from 'react-icons/fa'
import { Group, IconButton, Table } from '@chakra-ui/react'

import api, { type PaginatedEvents } from '@/lib/api/index'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

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
        <Table.Cell>{event.datetime}</Table.Cell>
        <Table.Cell>{event.capacity}</Table.Cell>
        <Table.Cell>{event.status}</Table.Cell>
        <Table.Cell>
          <Group>
            <IconButton title="Visualizar Evento" colorPalette={"green"}>
              <FaEye />
            </IconButton>

            <IconButton title="Comprar Ingresso" colorPalette={"blue"}>
              <FaTicketAlt />
            </IconButton>
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
