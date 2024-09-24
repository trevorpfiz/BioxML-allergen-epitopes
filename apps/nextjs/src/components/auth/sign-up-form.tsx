"use client";

import { useAction } from "next-safe-action/hooks";

import type { SignUp } from "@epi/validators/auth";
import { Button } from "@epi/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@epi/ui/form";
import { Input } from "@epi/ui/input";
import { SignUpSchema } from "@epi/validators/auth";

import { FormError } from "~/components/auth/form-error";
import { FormSuccess } from "~/components/auth/form-success";
import { signUp } from "~/lib/actions/auth";

export const SignUpForm = () => {
  const form = useForm({
    schema: SignUpSchema,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { execute, result, isExecuting, hasSucceeded } = useAction(signUp);

  const onSubmit = (values: SignUp) => {
    execute(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isExecuting}
                    placeholder="Email address"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isExecuting}
                    placeholder="Password"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {hasSucceeded && (
          <FormSuccess message={"Confirmation email has been sent!"} />
        )}
        <FormError message={result.serverError} />

        <Button disabled={isExecuting} type="submit" className="w-full">
          Continue with Email
        </Button>
      </form>
    </Form>
  );
};
