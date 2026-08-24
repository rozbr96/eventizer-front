import Link from "next/link";
import { Button, Group, Text } from "@chakra-ui/react";

type PaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  getPageHref: (page: number) => string;
}

const visiblePages = (currentPage: number, totalPages: number) => {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function Pagination({ page, totalPages, totalCount, getPageHref }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <Text color="gray.600" fontSize="sm">
        {totalCount} registros
      </Text>
    );
  }

  return (
    <Group justify="space-between" width="100%" flexWrap="wrap" gap="3">
      <Text color="gray.600" fontSize="sm">
        Página {page} de {totalPages} • {totalCount} registros
      </Text>

      <Group gap="2" flexWrap="wrap">
        <Button asChild size="sm" variant="outline" disabled={page <= 1}>
          <Link href={getPageHref(page - 1)}>Anterior</Link>
        </Button>

        {visiblePages(page, totalPages).map((pageNumber) => (
          <Button
            key={pageNumber}
            asChild
            size="sm"
            colorPalette={pageNumber === page ? "blue" : "gray"}
            variant={pageNumber === page ? "solid" : "outline"}
          >
            <Link href={getPageHref(pageNumber)}>{pageNumber}</Link>
          </Button>
        ))}

        <Button asChild size="sm" variant="outline" disabled={page >= totalPages}>
          <Link href={getPageHref(page + 1)}>Próxima</Link>
        </Button>
      </Group>
    </Group>
  );
}
