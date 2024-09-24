import { CardWrapper } from "~/components/auth/card-wrapper";
import { SignUpForm } from "~/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <main>
      <CardWrapper
        headerLabel="Create your account"
        backButtonLabel="Have an account?"
        backButtonLinkLabel="Sign in"
        backButtonHref="/signin"
        showSocial
        showCredentials
      >
        <SignUpForm />
      </CardWrapper>
    </main>
  );
}
