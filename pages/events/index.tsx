
import { Box, Group, Stack, Table } from '@chakra-ui/react'

import api, { type PaginatedEvents } from '@/lib/api/index'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

import EventDrawerButton from '@/components/events/drawer-button'
import EventPurchaseButton from '@/components/events/purchase-button'
import Pagination from '@/components/ui/pagination'

const parsePage = (page: string | string[] | undefined) => {
  const value = Array.isArray(page) ? page[0] : page
  const parsedPage = Number(value)

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
}

export const getServerSideProps = (async ({ query }) => {
  const page = parsePage(query.page)
  const events = await api.events.list({ page })

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
    <Stack gap="4">
      <Box overflowX="auto">
        <Table.Root css={{
          '& th:not(:first-of-type), & td:not(:first-of-type), & td[colspan]': {
            textAlign: 'center',
          },
        }}>
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
      </Box>

      <Pagination
        page={events.page}
        totalPages={events.total_pages}
        totalCount={events.total_count}
        getPageHref={(page) => `/events?page=${page}`}
      />
    </Stack>
  );
}
