import { useRouter } from "next/router";
import { useState } from "react";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";

import api from "@/lib/api";
import { toaster } from "@/components/ui/toaster";

const queryValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value || "";

export default function Activate() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const email = queryValue(router.query.email);
  const token = queryValue(router.query.token);
  const canActivate = email.length > 0 && token.length > 0;

  const activate = () => {
    if (!canActivate) {
      toaster.create({
        title: "Erro",
        description: "O link de ativação está incompleto.",
        type: "error",
        closable: true,
      });

      return;
    }

    setSubmitting(true);

    api
      .auth
      .activate({ email, token })
      .then(() => {
        toaster.create({
          title: "Conta ativada",
          description: "Sua conta foi ativada. Entre para continuar.",
          type: "success",
          closable: true,
        });
      })
      .then(() => { router.push("/login") })
      .finally(() => setSubmitting(false));
  }

  return (
    <Flex minH="calc(100vh - 112px)" align="center" justify="center">
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="2xl"
        bg="white"
        boxShadow="lg"
        p={{ base: "6", md: "8" }}
        width="100%"
        maxW="440px"
      >
        <Stack gap="6">
          <Box>
            <Heading as="h1" size="xl" mb="2">
              Ativar conta
            </Heading>

            <Text color="gray.600">
              Confirme a ativação da sua conta Eventizer.
            </Text>
          </Box>

          {canActivate ? (
            <Text color="gray.700" fontSize="sm">
              A conta vinculada a {email} será ativada.
            </Text>
          ) : (
            <Text color="red.600" fontSize="sm">
              O link de ativação está incompleto.
            </Text>
          )}

          <Button type="button" colorPalette="teal" size="lg" loading={submitting} onClick={activate}>
            <FaCheckCircle />
            Ativar conta
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
}
