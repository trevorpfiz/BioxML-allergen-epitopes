"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@hey-api/client-fetch";
import { useMutation } from "@tanstack/react-query";

import type { LinearBForm } from "@epi/validators/epitopes";
import { predictionCreateLinearBPredictionMutation as createMutation } from "@epi/api/client/react-query";
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
import { LinearBFormSchema } from "@epi/validators/epitopes";

import Loading from "~/app/(app)/loading";
import { env } from "~/env";
import { api } from "~/trpc/react";
import { useMySession } from "~/utils/supabase/client";

const LinearBForm: React.FC = () => {
  const utils = api.useUtils();
  const router = useRouter();
  const { session, loading } = useMySession();

  const form = useForm({
    schema: LinearBFormSchema,
    defaultValues: {
      sequence: "",
      bCellImmunogenicityMethod: "",
      bcrRecognitionProbabilityMethod: "",
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

  const createPredictionMutation = api.linearBPrediction.create.useMutation({
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

  const onSubmit = async (data: LinearBForm) => {
    // Step 1: Create a new Job
    const newJob = await createJobMutation.mutateAsync({
      name: `Linear B Prediction for ${data.sequence}`,
      type: "linear-b",
    });

    // Step 2: Create a new Linear B Prediction associated with the Job
    await createPredictionMutation.mutateAsync({
      sequence: data.sequence,
      bCellImmunogenicityMethod: data.bCellImmunogenicityMethod,
      bcrRecognitionProbabilityMethod: data.bcrRecognitionProbabilityMethod,
      jobId: newJob.job?.id ?? "",
    });

    // Step 3: Call the FastAPI to perform the prediction
    predictMutation.mutate({
      client: localClient,
      body: {
        sequence: data.sequence,
        b_cell_immunogenicity_method: data.bCellImmunogenicityMethod,
        bcr_recognition_probability_method:
          data.bcrRecognitionProbabilityMethod,
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
          {/* Sequence Field */}
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

          {/* B-cell Immunogenicity Method Field */}
          <FormField
            control={form.control}
            name="bCellImmunogenicityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>B-cell Immunogenicity Method</FormLabel>
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

          {/* BCR Recognition Probability Method Field */}
          <FormField
            control={form.control}
            name="bcrRecognitionProbabilityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BCR Recognition Probability Method</FormLabel>
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

export { LinearBForm };
