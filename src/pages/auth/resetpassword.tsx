import React from "react";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";

import AuthLayout from "@/components/Layouts/AuthLayout";
import EmailSentSuccess from "@/components/organisms/ResetPassword/EmailSentSuccess";
import ResetPassword from "@/components/organisms/ResetPassword";
import NewPassword from "@/components/organisms/ResetPassword/NewPassword";
import ResetSuccess from "@/components/organisms/ResetPassword/ResetSuccess";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next/types";

interface AllowedQueries extends ParsedUrlQuery {
  step?: "checkemail" | "newpassword" | "resetsuccess";
  email?: string;
  token?: string;
}

const Resetpassword = () => {
  const router = useRouter();

  const query = router.query as AllowedQueries;

  return (
    <AuthLayout type="website">
      {query.step === "checkemail" && query.email ? (
        <EmailSentSuccess email={query.email as string} />
      ) : query.token ? (
        <NewPassword token={query.token} />
      ) : query.step === "resetsuccess" ? (
        <ResetSuccess />
      ) : (
        <ResetPassword />
      )}
    </AuthLayout>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}

export default Resetpassword;
