import { type FormEvent, useState } from "react"
import api from '@/lib/api';
import { Box, Button, Field, Flex, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { FaSignInAlt } from "react-icons/fa";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { useAuth } from "@/components/app/auth-context";
import { authenticated } from "@/lib/auth/server";

export const getServerSideProps = (async ({ req, query }) => {
  if (!await authenticated(req.headers)) return { props: {} };

  const redirect = Array.isArray(query.redirect) ? query.redirect[0] : query.redirect;

  return {
    redirect: {
      destination: redirect || "/events",
      permanent: false,
    },
  };
}) satisfies GetServerSideProps;

export default function Login() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [loginData, setLoginData] = useState<{ email: string, password: string }>({
    email: '',
    password: ''
  })

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const redirect = Array.isArray(router.query.redirect) ? router.query.redirect[0] : router.query.redirect

    setSubmitting(true)

    api
      .auth
      .login(loginData)
      .then(() => refreshUser())
      .then(() => { router.push(redirect || '/events') })
      .finally(() => setSubmitting(false))
  }

  return (
    <Flex minH="calc(100vh - 112px)" align="center" justify="center">
      <form onSubmit={login} style={{ width: "100%", maxWidth: "440px" }}>
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          bg="white"
          boxShadow="lg"
          p={{ base: "6", md: "8" }}
        >
          <Stack gap="6">
            <Flex align="start" justify="space-between" gap="4">
              <Box>
                <Heading as="h1" size="xl" mb="2">
                  Entrar
                </Heading>

                <Text color="gray.600">
                  Acesse sua conta para continuar no Eventizer.
                </Text>
              </Box>
            </Flex>

            <Stack gap="4">
              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={(event) => { setLoginData({ ...loginData, email: event.target.value }) }}
                  placeholder="voce@email.com"
                  autoComplete="email"
                  required
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Senha</Field.Label>
                <Input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={(event) => { setLoginData({ ...loginData, password: event.target.value }) }}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  required
                />
              </Field.Root>
            </Stack>

            <Button type="submit" colorPalette="teal" size="lg" loading={submitting}>
              <FaSignInAlt />
              Login
            </Button>
          </Stack>
        </Box>
      </form>
    </Flex>
  )
}
