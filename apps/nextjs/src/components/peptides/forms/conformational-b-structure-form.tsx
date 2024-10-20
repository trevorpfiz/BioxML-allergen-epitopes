"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@hey-api/client-fetch";
import { useMutation } from "@tanstack/react-query";

import type { ConformationalBForm } from "@epi/validators/epitopes";
import { predictionCreateConformationalBPredictionMutation as createMutation } from "@epi/api/client/react-query";
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
import { ConformationalBFormSchema } from "@epi/validators/epitopes";

import Loading from "~/app/(app)/loading";
import { env } from "~/env";
import { api } from "~/trpc/react";
import { useMySession } from "~/utils/supabase/client";

const ConformationalBForm: React.FC = () => {
  const utils = api.useUtils();
  const router = useRouter();
  const { session, loading } = useMySession();

  const form = useForm({
    schema: ConformationalBFormSchema,
    defaultValues: {
      sequence: "",
      pdbId: "",
      chain: "",
      bcrRecognitionProbabilityMethod: "esm-2",
      surfaceAccessibilityMethod: "method-1",
    },
  });
  const { watch, setValue } = form;
  // Watch sequence and PDB ID + Chain to control conditional disabling
  const sequence = watch("sequence");
  const pdbId = watch("pdbId");
  const chain = watch("chain");
  // Reset mutually exclusive fields
  useEffect(() => {
    const sequenceValue = form.getValues("sequence");
    const pdbIdValue = form.getValues("pdbId");
    const chainValue = form.getValues("chain");

    if (sequenceValue) {
      setValue("pdbId", "");
      setValue("chain", "");
    }

    if (pdbIdValue || chainValue) {
      setValue("sequence", "");
    }
  }, [sequence, pdbId, chain, setValue, form]);

  const createJobMutation = api.job.create.useMutation({
    onSuccess: () => {
      void utils.job.byUser.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPredictionMutation =
    api.conformationalBPrediction.create.useMutation({
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

  const onSubmit = async (data: ConformationalBForm) => {
    // Normalize empty strings to undefined
    const normalizedData = {
      ...data,
      sequence: data.sequence?.trim() === "" ? undefined : data.sequence,
      pdbId: data.pdbId?.trim() === "" ? undefined : data.pdbId,
      chain: data.chain?.trim() === "" ? undefined : data.chain,
      bcrRecognitionProbabilityMethod:
        data.bcrRecognitionProbabilityMethod.trim(),
      surfaceAccessibilityMethod:
        data.surfaceAccessibilityMethod?.trim() === ""
          ? undefined
          : data.surfaceAccessibilityMethod,
    };

    const isStructureBased = !!normalizedData.pdbId;

    // Step 1: Create a new Job
    const jobName = isStructureBased
      ? `Structure-based: PDB ${normalizedData.pdbId}, Chain ${normalizedData.chain ?? "N/A"}`
      : `Sequence-based: ${normalizedData.sequence?.substring(0, 10)}...`;

    const newJob = await createJobMutation.mutateAsync({
      name: jobName,
      type: "conformational-b",
    });

    // Step 2: Create a new ConformationalBPrediction associated with the Job
    await createPredictionMutation.mutateAsync({
      sequence: normalizedData.sequence,
      pdbId: normalizedData.pdbId,
      chain: normalizedData.chain,
      isStructureBased,
      bcrRecognitionProbabilityMethod:
        normalizedData.bcrRecognitionProbabilityMethod,
      surfaceAccessibilityMethod: normalizedData.surfaceAccessibilityMethod,
      jobId: newJob.job?.id ?? "",
    });

    // Step 3: Call the FastAPI to perform the prediction
    predictMutation.mutate({
      client: localClient,
      body: {
        sequence: normalizedData.sequence,
        pdb_id: normalizedData.pdbId,
        chain: normalizedData.chain,
        is_structure_based: isStructureBased,
        bcr_recognition_probability_method:
          normalizedData.bcrRecognitionProbabilityMethod,
        surface_accessibility_method: normalizedData.surfaceAccessibilityMethod,
        job_id: newJob.job?.id ?? "",
      },
    });

    // Step 4: Redirect to the newly created Job's page
    router.push(`/job/${newJob.job?.id}`);
  };

  // Ara h 2.0101 - AAK96887
  const fillSequenceExample = () => {
    // Clear PDB ID and Chain first
    form.setValue("pdbId", "");
    form.setValue("chain", "");

    // Delay setting the sequence until the fields have been cleared
    setTimeout(() => {
      form.setValue(
        "sequence",
        "MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSYERDPYSPSQDPYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEALQQIMENQSDRLQGRQQEQQFKRELRNLPQQCGLRAPQRCDLDVESGG",
      );
    }, 0);
  };

  // ara-h-2/AAK96887
  const fillStructureExample = () => {
    // Clear Sequence first
    form.setValue("sequence", "");

    // Delay setting PDB ID and Chain until sequence has been cleared
    setTimeout(() => {
      form.setValue("pdbId", "3OB4");
      form.setValue("chain", "A");
    }, 0);
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
                    placeholder="MAKLTILVALALFLLAAHA..."
                    disabled={!!pdbId || !!chain}
                    //   className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PDB ID Field */}
          <FormField
            control={form.control}
            name="pdbId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PDB ID</FormLabel>
                <FormControl>
                  <Input placeholder="3OB4" disabled={!!sequence} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Chain Field */}
          <FormField
            control={form.control}
            name="chain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chain (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="A, E" disabled={!!sequence} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* BCR Recognition Probability Method */}
          <FormField
            control={form.control}
            name="bcrRecognitionProbabilityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BCR Recognition Probability</FormLabel>
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
                    <SelectItem value="esm-2">ESM2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Surface Accessibility Method */}
          <FormField
            control={form.control}
            name="surfaceAccessibilityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface Accessibility</FormLabel>
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={fillSequenceExample}
            >
              Try Sequence example
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={fillStructureExample}
            >
              Try PDB ID and Chain example
            </Button>
          </div>
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

export { ConformationalBForm };
