"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ConformationalBSequenceForm } from "@epi/validators/epitopes";
import { Button } from "@epi/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@epi/ui/form";
import { Textarea } from "@epi/ui/textarea";
import { ConformationalBSequenceFormSchema } from "@epi/validators/epitopes";

const ConformationalBSequenceForm = () => {
  const router = useRouter();
  const [isLoading] = useState(false);

  const form = useForm({
    schema: ConformationalBSequenceFormSchema,
    defaultValues: {
      sequence: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onSubmit(values: ConformationalBSequenceForm) {
    void router.push(`/conformational-b/sequence-based/1`);
  }

  // ara-h-2/AAK96887
  const fillExampleSequence = () => {
    form.setValue(
      "sequence",
      "MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSYERDPYSPSQDPYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEALQQIMENQSDRLQGRQQEQQFKRELRNLPQQCGLRAPQRCDLDVESGG",
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="sequence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amino acid sequence</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter amino acid sequence"
                  {...field}
                  rows={10}
                />
              </FormControl>
              <FormDescription>
                Enter the amino acid sequence for prediction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={fillExampleSequence}>
            Fill Example Sequence
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { ConformationalBSequenceForm };
