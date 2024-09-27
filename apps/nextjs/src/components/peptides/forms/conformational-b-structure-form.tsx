"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ConformationalBStructureForm } from "@epi/validators/epitopes";
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
import { Input } from "@epi/ui/input";
import { Separator } from "@epi/ui/separator";
import { ConformationalBStructureFormSchema } from "@epi/validators/epitopes";

const ConformationalBStructureForm = () => {
  const router = useRouter();
  const [isLoading] = useState(false);

  const form = useForm({
    schema: ConformationalBStructureFormSchema,
    defaultValues: {
      pdbId: "",
      chain: "",
    },
  });

  function onSubmit(values: ConformationalBStructureForm) {
    void router.push(`/conformational-b/structure-based/1`);
  }

  // ara-h-2/AAK96887
  const fillExampleValues = () => {
    form.setValue("pdbId", "3OB4");
    form.setValue("chain", "A");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="pdbId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PDB ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PDB ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chain (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter chain" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Separator />
        <FormField
          control={form.control}
          name="pdbFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Or upload PDB file</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdb"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormDescription>
                Upload a PDB file instead of entering PDB ID
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={fillExampleValues}>
            Try PDB ID and Chain example
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { ConformationalBStructureForm };
