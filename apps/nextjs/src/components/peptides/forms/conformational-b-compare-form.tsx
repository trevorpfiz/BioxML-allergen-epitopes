"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ConformationalBCompareForm } from "@epi/validators/epitopes";
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
import { Separator } from "@epi/ui/separator";
import { ConformationalBCompareFormSchema } from "@epi/validators/epitopes";

const ConformationalBCompareForm = () => {
  const router = useRouter();
  const [isLoading] = useState(false);

  const form = useForm({
    schema: ConformationalBCompareFormSchema,
    defaultValues: {
      firstPdbId: "",
      firstChain: "",
      secondPdbId: "",
      secondChain: "",
    },
  });

  function onSubmit(values: ConformationalBCompareForm) {
    void router.push(`/conformational-b/compare/1`);
  }

  const fillExampleValues = () => {
    form.setValue("firstPdbId", "7b3o");
    form.setValue("firstChain", "E");
    form.setValue("secondPdbId", "7lm9");
    form.setValue("secondChain", "A");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold">
            Find similar conformational B-cell epitopes between two antigens.
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter two PDB IDs or upload PDB files
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">First antigen</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstPdbId"
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
              name="firstChain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter chain" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="firstPdbFile"
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Second antigen</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="secondPdbId"
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
              name="secondChain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter chain" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="secondPdbFile"
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={fillExampleValues}>
            Try example
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { ConformationalBCompareForm };
