import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Formik, FormikHelpers } from "formik";
import Link from "next/link";
import GoogleLogo from "public/assets/icon/google.svg";
import CustomAuthButton from "@/components/atoms/CustomAuthButton";
// import PasswordInput from "@/components/atoms/PasswordInput";
import { Logincredentials } from "@/pages/api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { AuthSchema } from "@/base/helpers/FormValidationSchemas";
import { toast } from "react-toastify";
import { signIn, signOut, useSession } from "next-auth/react";

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const handleSignUp = async (
    values: Logincredentials,
    { resetForm }: FormikHelpers<Logincredentials>
  ) => {
    const { email, password } = values;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res && res.ok) {
        toast.success("Sign up successful");
        router.push(`/auth/verify?email=${email}`);
      }
      else {
        res.json().then(data => {
          toast.error(data.message);
        });
      }

    } catch (error) {
      /**
       * TODO toast error message for users feedback
       */
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  const handleGoogleSignIn = async (authToken: string) => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`,
        {
          method: "POST",
          body: JSON.stringify({ token: authToken }),
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res && res.ok) {
        const { data: user } = await res.json();

        update({
          ...session,
          user: {
            ...session?.user,
            ...user,
          },
        });

        toast.success("Login successful");
        router.push(`/auth/verify?email=${session?.user.email}`);
      }
    } catch (error) {
      toast.error("Something went wrong");
      signOut();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (
      session &&
      session.user.channel === "google" &&
      status === "authenticated"
    ) {
      const googleAuthToken = session.user.accessToken;
      handleGoogleSignIn(googleAuthToken);
    }
  }, [status]);
  return (
    <>
      <div>
        <h2 className="mb-2 text-[32px] font-extrabold text-gray-900">
          Sign up
        </h2>
        <p>Sign up to my native tree for free</p>
      </div>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSignUp}
        validationSchema={AuthSchema}
      >
        {({
          handleSubmit,
          handleChange,
          values,
          handleBlur,
          errors,
          touched,
        }) => (
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col gap-4 space-y-1"
          >
            <fieldset>
              <Input
                required
                name="email"
                type="email"
                hint={touched.email && errors.email ? errors.email : ""}
                isError={!!(errors.email && touched.email)}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                label="Enter your email"
                placeholder="Email"
              />
            </fieldset>
            <fieldset>
              <Input
                required
                password
                name="password"
                type="password"
                hint={
                  touched.password && errors.password ? errors.password : ""
                }
                isError={!!(errors.password && touched.password)}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                label="Enter your password"
                placeholder="Password"
              />
              {/* <PasswordInput
                required
                name="password"
                type="password"
                hint={errors.password}
                isError={!!errors.password}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                label="Enter your password"
                placeholder="Password"
              /> */}
              <p className="mt-2 text-sm text-gray-500">
                Password must contain at least 6 characters 1 uppercase 1
                lowercase and 1 number
              </p>
            </fieldset>
            <p className="text-sm text-gray-500">
              Already have an account ?{" "}
              <Link href="/auth/signin" className="text-primary">
                Login
              </Link>
            </p>
            <Button
              loading={isLoading}
              type="submit"
              className="max-w-full md:max-w-full"
            >
              Sign up
            </Button>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-full bg-gray-500" />
                <p className="-mt-1 w-fit text-gray-500">or</p>
                <span className="h-[1px] w-full bg-gray-500" />
              </div>
              <CustomAuthButton
                onClick={() => signIn("google")}
                loading={isGoogleLoading}
                icon={GoogleLogo}
                name="Continue with Google"
              />
            </div>
          </form>
        )}
      </Formik>
    </>
  );
};

export default SignUpForm;
