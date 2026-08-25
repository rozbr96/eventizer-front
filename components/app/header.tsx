import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Box, Button, Dialog, Flex, HStack, Portal, Text } from "@chakra-ui/react";
import { FaCalendarAlt, FaCheckCircle, FaFilm, FaReceipt, FaSignInAlt, FaSignOutAlt, FaTimes, FaUserPlus } from "react-icons/fa";
import { type IconType } from "react-icons";

import { useAuth } from "@/components/app/auth-context";
import { type User } from "@/lib/api/common-entities";

const linksByRole: Record<NonNullable<User["role"]>, Array<{ href: string; label: string; icon: IconType }>> = {
  organizer: [
    { href: "/events", label: "Eventos", icon: FaCalendarAlt },
    { href: "/movies", label: "Filmes", icon: FaFilm },
    { href: "/purchases", label: "Compras", icon: FaReceipt },
  ],
  client: [
    { href: "/events", label: "Eventos", icon: FaCalendarAlt },
    { href: "/purchases", label: "Compras", icon: FaReceipt },
  ],
  doorman: [
    { href: "/ticket-verifications", label: "Ingressos Validados", icon: FaCheckCircle },
  ],
};

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const links = user?.role ? linksByRole[user.role] : [];

  const handleLogout = () => {
    setLoggingOut(true);

    logout()
      .then(() => router.push("/login"))
      .finally(() => setLoggingOut(false));
  }

  return (
    <Box as="header" bg="cyan.700" color="white" position="sticky" top="0" zIndex="banner" boxShadow="md">
      <Flex align="center" justify="space-between" maxW="1600px" mx="auto" px="6" py="3">
        <Text asChild fontWeight="bold" fontSize="xl" letterSpacing="tight">
          <Link href="/events">Eventizer</Link>
        </Text>

        {user ? (
          <HStack gap="4">
            <HStack as="nav" gap="3">
              {links.map((link) => {
                const Icon = link.icon;

                return (
                  <Button
                    key={link.href}
                    asChild
                    variant="ghost"
                    size="sm"
                    color="white"
                    _hover={{ bg: "cyan.600", color: "white" }}
                  >
                    <Link href={link.href}>
                      <Icon />
                      {link.label}
                    </Link>
                  </Button>
                );
              })}
            </HStack>

            <Text color="cyan.50" fontSize="sm">
              {user.name}
            </Text>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  color="white"
                  borderColor="cyan.100"
                  _hover={{ bg: "cyan.600", color: "white" }}
                >
                  <FaSignOutAlt />
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
                        <Button variant="outline">
                          <FaTimes />
                          Cancelar
                        </Button>
                      </Dialog.ActionTrigger>

                      <Button colorPalette="red" loading={loggingOut} onClick={handleLogout}>
                        <FaSignOutAlt />
                        Sair
                      </Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          </HStack>
        ) : (
          <HStack gap="2">
            <Button asChild variant="ghost" size="sm" color="white" _hover={{ bg: "cyan.600", color: "white" }}>
              <Link href="/login">
                <FaSignInAlt />
                Login
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm" color="white" borderColor="cyan.100" _hover={{ bg: "cyan.600", color: "white" }}>
              <Link href="/signup">
                <FaUserPlus />
                Criar conta
              </Link>
            </Button>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}
