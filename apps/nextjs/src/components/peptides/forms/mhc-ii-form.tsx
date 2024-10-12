"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@hey-api/client-fetch";
import { useMutation } from "@tanstack/react-query";

import type { MhcIIForm } from "@epi/validators/epitopes";
import { predictionCreateMhcIiPredictionMutation as createMutation } from "@epi/api/client/react-query";
import { Button } from "@epi/ui/button";
import { Checkbox } from "@epi/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@epi/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@epi/ui/select";
import { Separator } from "@epi/ui/separator";
import { toast } from "@epi/ui/sonner";
import { Textarea } from "@epi/ui/textarea";
import { MhcIIFormSchema } from "@epi/validators/epitopes";

import Loading from "~/app/(app)/loading";
import { env } from "~/env";
import { MHC_II_ALLELES } from "~/lib/constants";
import { api } from "~/trpc/react";
import { useMySession } from "~/utils/supabase/client";

const MhcIIForm: React.FC = () => {
  const utils = api.useUtils();
  const router = useRouter();
  const { session, loading } = useMySession();

  const form = useForm({
    schema: MhcIIFormSchema,
    defaultValues: {
      sequence: "",
      alleles: [],
      tcrRecognitionProbabilityMethod: "",
      mhcBindingAffinityMethod: "",
      pmhcStabilityMethod: "",
    },
  });

  const createJobMutation = api.job.create.useMutation({
    onSuccess: () => {
      void utils.job.byUser.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPredictionMutation = api.mhcIIPrediction.create.useMutation({
    onSuccess: (input) => {
      void utils.job.byId.invalidate({ id: input.prediction?.jobId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const apiUrl =
    env.NEXT_PUBLIC_USE_LAMBDA_API === "true"
      ? env.NEXT_PUBLIC_FASTAPI_STAGE_URL
      : env.NEXT_PUBLIC_FASTAPI_URL;

  const localClient = useMemo(() => {
    if (!session?.access_token) {
      return undefined;
    }
    return createClient({
      baseUrl: apiUrl,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  }, [apiUrl, session?.access_token]);

  const predictMutation = useMutation({
    ...createMutation(),
    onSuccess: (input) => {
      void utils.job.byId.invalidate({ id: input.job_id });
    },
    onError: (error: { detail: string }) => {
      console.error("Predict Error:", error);
      toast.error(error.detail);
    },
  });

  const onSubmit = async (data: MhcIIForm) => {
    const newJob = await createJobMutation.mutateAsync({
      name: `MHC-II Prediction for ${data.sequence}`,
      type: "mhc-ii",
    });

    await createPredictionMutation.mutateAsync({
      sequence: data.sequence,
      alleles: data.alleles,
      tcrRecognitionProbabilityMethod: data.tcrRecognitionProbabilityMethod,
      mhcBindingAffinityMethod: data.mhcBindingAffinityMethod,
      pmhcStabilityMethod: data.pmhcStabilityMethod,
      jobId: newJob.job?.id ?? "",
    });

    predictMutation.mutate({
      client: localClient,
      body: {
        sequence: data.sequence,
        alleles: data.alleles,
        tcr_recognition_probability_method:
          data.tcrRecognitionProbabilityMethod,
        mhc_binding_affinity_method: data.mhcBindingAffinityMethod,
        pmhc_stability_method: data.pmhcStabilityMethod,
        job_id: newJob.job?.id ?? "",
      },
    });

    router.push(`/job/${newJob.job?.id}`);
  };

  // Ara h 2.0101 - AAK96887
  const fillExampleValues = () => {
    form.setValue(
      "sequence",
      "MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSYERDPYSPSQDPYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEALQQIMENQSDRLQGRQQEQQFKRELRNLPQQCGLRAPQRCDLDVESGG",
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="sequence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sequence</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter sequence"
                    //   className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alleles"
            render={() => (
              <FormItem>
                <FormLabel>Select Alleles</FormLabel>
                {MHC_II_ALLELES.map((allele) => (
                  <FormField
                    key={allele}
                    control={form.control}
                    name="alleles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(allele)}
                            onCheckedChange={(checked) =>
                              checked
                                ? field.onChange([...field.value, allele])
                                : field.onChange(
                                    field.value.filter(
                                      (value) => value !== allele,
                                    ),
                                  )
                            }
                          />
                        </FormControl>
                        <FormLabel>{allele}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TCR Recognition Probability Method Field */}
          <FormField
            control={form.control}
            name="tcrRecognitionProbabilityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TCR Recognition Probability Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="method-1">Method 1</SelectItem>
                    <SelectItem value="method-2">Method 2</SelectItem>
                    <SelectItem value="method-3">Method 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* MHC Binding Affinity Method Field */}
          <FormField
            control={form.control}
            name="mhcBindingAffinityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MHC Binding Affinity Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="method-1">Method 1</SelectItem>
                    <SelectItem value="method-2">Method 2</SelectItem>
                    <SelectItem value="method-3">Method 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PMHC Stability Method Field */}
          <FormField
            control={form.control}
            name="pmhcStabilityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PMHC Stability Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="method-1">Method 1</SelectItem>
                    <SelectItem value="method-2">Method 2</SelectItem>
                    <SelectItem value="method-3">Method 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={fillExampleValues}>
            Try Sequence example
          </Button>
          <Button
            type="submit"
            disabled={
              createJobMutation.isPending || createPredictionMutation.isPending
            }
          >
            {createJobMutation.isPending || createPredictionMutation.isPending
              ? "Submitting..."
              : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { MhcIIForm };
