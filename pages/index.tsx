import { type GetServerSideProps } from "next";

export const getServerSideProps = (async () => {
  return {
    redirect: {
      destination: "/events",
      permanent: false,
    },
  };
}) satisfies GetServerSideProps;

export default function Home() {
  return null;
}
