import { CardWrapper } from "~/components/auth/card-wrapper";
import { SignInForm } from "~/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <main>
      <CardWrapper
        headerLabel="Welcome back"
        backButtonLabel="Don't have an account?"
        backButtonLinkLabel="Sign up"
        backButtonHref="/signup"
        showSocial
        showCredentials
      >
        <SignInForm />
      </CardWrapper>
    </main>
  );
}
