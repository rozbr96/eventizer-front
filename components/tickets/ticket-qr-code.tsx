import { Box, Image, Stack, Text } from "@chakra-ui/react";

export default function TicketQrCode({ code }: { code: string }) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(code)}`;

  return (
    <Stack gap="4" align="center">
      <Box p="4" bg="white" borderWidth="1px" borderRadius="lg" width="fit-content">
        <Image src={qrCodeUrl} alt={`QR Code do ingresso ${code}`} width="220px" height="220px" />
      </Box>

      <Box textAlign="center">
        <Text color="gray.500" fontSize="sm" fontWeight="medium">
          Código do ingresso
        </Text>

        <Text color="gray.900" fontWeight="bold" letterSpacing="wide">
          {code}
        </Text>
      </Box>
    </Stack>
  );
}
