import { Box, SimpleGrid, Stack, Text } from "@chakra-ui/react";

const qrCells = Array.from({ length: 81 }, (_, index) => {
  const row = Math.floor(index / 9);
  const column = index % 9;
  const inTopLeftMarker = row < 3 && column < 3;
  const inTopRightMarker = row < 3 && column > 5;
  const inBottomLeftMarker = row > 5 && column < 3;

  return inTopLeftMarker || inTopRightMarker || inBottomLeftMarker || (row * 3 + column * 5) % 4 === 0;
});

export default function PixPaymentInfo({ pixKey }: { pixKey: string }) {
  return (
    <Stack gap="4" align={{ base: "stretch", sm: "start" }}>
      <Box p="4" bg="white" borderWidth="1px" borderRadius="lg" width="fit-content">
        <SimpleGrid columns={9} gap="1" aria-label="QR Code Pix">
          {qrCells.map((active, index) => (
            <Box
              key={index}
              w="3"
              h="3"
              borderRadius="xs"
              bg={active ? "gray.900" : "gray.100"}
            />
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <Text color="gray.500" fontSize="sm" fontWeight="medium">
          Chave Pix
        </Text>

        <Text color="gray.900" fontWeight="semibold">
          {pixKey}
        </Text>
      </Box>
    </Stack>
  );
}
