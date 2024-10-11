"use client";

import { useRouter } from "next/navigation";

import type { ConformationalBStructureForm } from "@epi/validators/epitopes";
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
import { ConformationalBStructureFormSchema } from "@epi/validators/epitopes";

import { api } from "~/trpc/react";

const ConformationalBStructureForm: React.FC = () => {
  const utils = api.useUtils();
  const router = useRouter();

  const form = useForm({
    schema: ConformationalBStructureFormSchema,
    defaultValues: {
      pdbId: "",
      chain: "",
      bcrRecognitionProbabilityMethod: "",
      surfaceAccessibilityMethod: "",
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
  const createPredictionMutation =
    api.conformationalBPrediction.create.useMutation({
      onSuccess: () => {
        void utils.conformationalBPrediction.byUser.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onSubmit = async (data: ConformationalBStructureForm) => {
    // Step 1: Create a new Job
    const jobName = `PDB ${data.pdbId} Chain ${data.chain}`;
    const newJob = await createJobMutation.mutateAsync({
      name: jobName,
      type: "conformational-b",
    });

    // Step 2: Create a new ConformationalBPrediction associated with the Job
    await createPredictionMutation.mutateAsync({
      pdbId: data.pdbId,
      chain: data.chain,
      bcrRecognitionProbabilityMethod: data.bcrRecognitionProbabilityMethod,
      surfaceAccessibilityMethod: data.surfaceAccessibilityMethod,
      jobId: newJob.job?.id ?? "",
      result: {},
    });

    // Step 3: Call the FastAPI to perform the prediction

    // Step 4: Redirect to the newly created Job's page
    router.push(`/job/${newJob.job?.id}`);
  };

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
          {/* PDB ID Field */}
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

          {/* Chain Field */}
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

          {/* BCR Recognition Probability Method */}
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

          {/* Surface Accessibility Method */}
          <FormField
            control={form.control}
            name="surfaceAccessibilityMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface Accessibility Method</FormLabel>
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
                    <SelectItem value="method-a">Method A</SelectItem>
                    <SelectItem value="method-b">Method B</SelectItem>
                    <SelectItem value="method-c">Method C</SelectItem>
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
            Try PDB ID and Chain example
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

export { ConformationalBStructureForm };
