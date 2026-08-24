import Link from "next/link";
import { Box, Button, Dialog, Flex, HStack, Portal, Text } from "@chakra-ui/react";

import { useAuth } from "@/components/app/auth-context";
import { type User } from "@/lib/api/common-entities";

const linksByRole: Record<NonNullable<User["role"]>, Array<{ href: string; label: string }>> = {
  organizer: [
    { href: "/events", label: "Eventos" },
    { href: "/movies", label: "Filmes" },
    { href: "/purchases", label: "Compras" },
  ],
  client: [
    { href: "/events", label: "Eventos" },
    { href: "/purchases", label: "Compras" },
  ],
  doorman: [],
};

export default function Header() {
  const { user } = useAuth();
  const links = user?.role ? linksByRole[user.role] : [];

  return (
    <Box as="header" borderBottomWidth="1px" bg="white" position="sticky" top="0" zIndex="banner">
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto" px="6" py="3">
        <Text asChild fontWeight="bold" fontSize="xl">
          <Link href="/events">Eventizer</Link>
        </Text>

        {user ? (
          <HStack gap="4">
            <HStack as="nav" gap="3">
              {links.map((link) => (
                <Button key={link.href} asChild variant="ghost" size="sm">
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </HStack>

            <Text color="gray.700" fontSize="sm">
              {user.name}
            </Text>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant="outline" size="sm">
                  Sair
                </Button>
              </Dialog.Trigger>

              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>Confirmar saída</Dialog.Title>
                    </Dialog.Header>

                    <Dialog.Body>
                      <Text>Deseja realmente sair da sua conta?</Text>
                    </Dialog.Body>

                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline">Cancelar</Button>
                      </Dialog.ActionTrigger>

                      <Button colorPalette="red">
                        Sair
                      </Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          </HStack>
        ) : (
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </Flex>
    </Box>
  );
}
