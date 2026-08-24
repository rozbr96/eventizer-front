import { useState } from "react"
import api from '@/lib/api';
import { Field, Fieldset, IconButton, Input } from "@chakra-ui/react";
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
  const [loginData, setLoginData] = useState<{ email: string, password: string }>({
    email: '',
    password: ''
  })

  const login = () => {
    const redirect = Array.isArray(router.query.redirect) ? router.query.redirect[0] : router.query.redirect

    api
      .auth
      .login(loginData)
      .then(() => refreshUser())
      .then(() => { router.push(redirect || '/events') })
  }

  return (
    <Fieldset.Root>
      <Fieldset.Content>
        <Field.Root>
          <Field.Label>Email</Field.Label>
          <Input type="email" name="email" value={loginData.email} onChange={(event) => { setLoginData({ ...loginData, email: event.target.value }) }} />
        </Field.Root>

        <Field.Root>
          <Field.Label>Senha</Field.Label>
          <Input type="password" name="password" value={loginData.password} onChange={(event) => { setLoginData({ ...loginData, password: event.target.value }) }} />
        </Field.Root>
      </Fieldset.Content>

      <IconButton onClick={login} colorPalette={"teal"}>
        <FaSignInAlt />

        Login
      </IconButton>
    </Fieldset.Root>
  )
}
