"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@hey-api/client-fetch";
import { useMutation } from "@tanstack/react-query";

import type { MhcIForm } from "@epi/validators/epitopes";
import { predictionCreateMhcIPredictionMutation as createMutation } from "@epi/api/client/react-query";
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
import { MhcIFormSchema } from "@epi/validators/epitopes";

import Loading from "~/app/(app)/loading";
import { env } from "~/env";
import { HLA_A_ALLELES, HLA_B_ALLELES, HLA_C_ALLELES } from "~/lib/constants";
import { api } from "~/trpc/react";
import { useMySession } from "~/utils/supabase/client";

const MhcIForm: React.FC = () => {
  const utils = api.useUtils();
  const router = useRouter();
  const { session, loading } = useMySession();

  const form = useForm({
    schema: MhcIFormSchema,
    defaultValues: {
      sequence: "",
      alleles: [],
      tcrRecognitionProbabilityMethod: "mix-tcr-pred",
      mhcBindingAffinityMethod: "netmhcpan-4.1",
      pmhcStabilityMethod: "method-1",
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

  const createPredictionMutation = api.mhcIPrediction.create.useMutation({
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

  // Create a local API client instance
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

  const onSubmit = async (data: MhcIForm) => {
    // Step 1: Create a new Job
    const newJob = await createJobMutation.mutateAsync({
      name: `${data.sequence}`,
      type: "mhc-i",
    });

    // Step 2: Create a new MHC-I Prediction associated with the Job
    await createPredictionMutation.mutateAsync({
      sequence: data.sequence,
      alleles: data.alleles,
      tcrRecognitionProbabilityMethod: data.tcrRecognitionProbabilityMethod,
      mhcBindingAffinityMethod: data.mhcBindingAffinityMethod,
      pmhcStabilityMethod: data.pmhcStabilityMethod,
      jobId: newJob.job?.id ?? "",
    });

    // Step 3: Call the FastAPI to perform the prediction
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

    // Step 4: Redirect to the newly created Job's page
    router.push(`/job/${newJob.job?.id}`);
  };

  // Ara h 2.0101 - AAK96887
  const fillExampleValues = () => {
    form.setValue(
      "sequence",
      "MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSYERDPYSPSQDPYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEALQQIMENQSDRLQGRQQEQQFKRELRNLPQQCGLRAPQRCDLDVESGG",
    );
  };

  const toggleGroup = (
    groupAlleles: string[],
    checked: string | boolean,
    currentValues: string[],
    onChange: (value: string[]) => void,
  ) => {
    if (checked) {
      // Add all group alleles to the selected values
      onChange([
        ...currentValues,
        ...groupAlleles.filter((allele) => !currentValues.includes(allele)),
      ]);
    } else {
      // Remove all group alleles from the selected values
      onChange(
        currentValues.filter((allele) => !groupAlleles.includes(allele)),
      );
    }
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
                    placeholder="MAKLTILVALALFLLAAHA..."
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
            render={({ field }) => {
              const isHlaASelected = HLA_A_ALLELES.every((allele) =>
                field.value.includes(allele),
              );
              const isHlaAIndeterminate =
                HLA_A_ALLELES.some((allele) => field.value.includes(allele)) &&
                !isHlaASelected;
              const isHlaBSelected = HLA_B_ALLELES.every((allele) =>
                field.value.includes(allele),
              );
              const isHlaBIndeterminate =
                HLA_B_ALLELES.some((allele) => field.value.includes(allele)) &&
                !isHlaBSelected;
              const isHlaCSelected = HLA_C_ALLELES.every((allele) =>
                field.value.includes(allele),
              );
              const isHlaCIndeterminate =
                HLA_C_ALLELES.some((allele) => field.value.includes(allele)) &&
                !isHlaCSelected;

              return (
                <FormItem>
                  <FormLabel>Class I Alleles</FormLabel>

                  {/* HLA-A Group */}
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={isHlaASelected || isHlaAIndeterminate}
                        onCheckedChange={(checked) =>
                          toggleGroup(
                            HLA_A_ALLELES,
                            checked,
                            field.value,
                            field.onChange,
                          )
                        }
                      />
                    </FormControl>
                    <FormLabel>HLA-A</FormLabel>
                  </FormItem>

                  <div className="ml-4 grid grid-cols-4 gap-4">
                    {HLA_A_ALLELES.map((allele) => (
                      <FormItem
                        key={allele}
                        className="flex flex-row items-center space-x-2 space-y-0"
                      >
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
                        <FormLabel className="max-w-32 break-all">
                          {allele}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>

                  {/* HLA-B Group */}
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={isHlaBSelected || isHlaBIndeterminate}
                        onCheckedChange={(checked) =>
                          toggleGroup(
                            HLA_B_ALLELES,
                            checked,
                            field.value,
                            field.onChange,
                          )
                        }
                      />
                    </FormControl>
                    <FormLabel>HLA-B</FormLabel>
                  </FormItem>

                  <div className="ml-4 grid grid-cols-4 gap-4">
                    {HLA_B_ALLELES.map((allele) => (
                      <FormItem
                        key={allele}
                        className="flex flex-row items-center space-x-2 space-y-0"
                      >
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
                        <FormLabel className="max-w-32 break-all">
                          {allele}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>

                  {/* HLA-C Group */}
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={isHlaCSelected || isHlaCIndeterminate}
                        onCheckedChange={(checked) =>
                          toggleGroup(
                            HLA_C_ALLELES,
                            checked,
                            field.value,
                            field.onChange,
                          )
                        }
                      />
                    </FormControl>
                    <FormLabel>HLA-C</FormLabel>
                  </FormItem>

                  <div className="ml-4 grid grid-cols-4 gap-4">
                    {HLA_C_ALLELES.map((allele) => (
                      <FormItem
                        key={allele}
                        className="flex flex-row items-center space-x-2 space-y-0"
                      >
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
                        <FormLabel className="max-w-32 break-all">
                          {allele}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* TCR Recognition Probability Method Field */}
          <FormField
            control={form.control}
            name="tcrRecognitionProbabilityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TCR Recognition Probability</FormLabel>
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
                    <SelectItem value="mix-tcr-pred">MixTCRpred</SelectItem>
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
                <FormLabel>MHC Binding Affinity</FormLabel>
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
                    <SelectItem value="netmhcpan-4.1">NetMHCpan 4.1</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* pMHC Stability Method Field */}
          <FormField
            control={form.control}
            name="pmhcStabilityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>pMHC Stability</FormLabel>
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

export { MhcIForm };
