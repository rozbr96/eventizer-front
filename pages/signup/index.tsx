import { type FormEvent, useState } from "react";
import Link from "next/link";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Box, Button, Field, Flex, Heading, Input, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

import api from "@/lib/api";
import { authenticated } from "@/lib/auth/server";
import { toaster } from "@/components/ui/toaster";

type SignupData = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export const getServerSideProps = (async ({ req }) => {
  if (!await authenticated(req.headers)) return { props: {} };

  return {
    redirect: {
      destination: "/events",
      permanent: false,
    },
  };
}) satisfies GetServerSideProps;

export default function Signup() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const passwordMismatch =
    signupData.passwordConfirmation.length > 0 &&
    signupData.password !== signupData.passwordConfirmation;

  const signup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (signupData.password !== signupData.passwordConfirmation) {
      toaster.create({
        title: "Erro",
        description: "A confirmação de senha precisa ser igual à senha.",
        type: "error",
        closable: true,
      });

      return;
    }

    setSubmitting(true);

    api
      .auth
      .signup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      })
      .then(() => {
        toaster.create({
          title: "Conta criada",
          description: "Seu cadastro foi recebido. Entre assim que sua conta estiver ativa.",
          type: "success",
          closable: true,
        });
      })
      .then(() => { router.push("/login") })
      .finally(() => setSubmitting(false));
  }

  return (
    <Flex minH="calc(100vh - 112px)" align="center" justify="center">
      <form onSubmit={signup} style={{ width: "100%", maxWidth: "480px" }}>
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          bg="white"
          boxShadow="lg"
          p={{ base: "6", md: "8" }}
        >
          <Stack gap="6">
            <Box>
              <Heading as="h1" size="xl" mb="2">
                Criar conta
              </Heading>

              <Text color="gray.600">
                Cadastre-se para comprar ingressos no Eventizer.
              </Text>
            </Box>

            <Stack gap="4">
              <Field.Root required>
                <Field.Label>Nome</Field.Label>
                <Input
                  type="text"
                  name="name"
                  value={signupData.name}
                  onChange={(event) => { setSignupData({ ...signupData, name: event.target.value }) }}
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={(event) => { setSignupData({ ...signupData, email: event.target.value }) }}
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
                  value={signupData.password}
                  onChange={(event) => { setSignupData({ ...signupData, password: event.target.value }) }}
                  placeholder="Sua senha"
                  autoComplete="new-password"
                  required
                />
              </Field.Root>

              <Field.Root required invalid={passwordMismatch}>
                <Field.Label>Confirmar senha</Field.Label>
                <Input
                  type="password"
                  name="passwordConfirmation"
                  value={signupData.passwordConfirmation}
                  onChange={(event) => { setSignupData({ ...signupData, passwordConfirmation: event.target.value }) }}
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  required
                />
                <Field.ErrorText>As senhas precisam ser iguais.</Field.ErrorText>
              </Field.Root>
            </Stack>

            <Stack gap="4">
              <Button type="submit" colorPalette="teal" size="lg" loading={submitting}>
                <FaUserPlus />
                Criar conta
              </Button>

              <Text color="gray.600" fontSize="sm" textAlign="center">
                Já tem uma conta?{" "}
                <ChakraLink asChild colorPalette="teal" fontWeight="semibold">
                  <Link href="/login">
                    <FaSignInAlt />
                    Entrar
                  </Link>
                </ChakraLink>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </form>
    </Flex>
  );
}
