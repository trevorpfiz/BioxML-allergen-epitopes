"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { NewReportParams, Report } from "@epi/db/schema";
import { insertReportParams } from "@epi/db/schema";
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

import { api } from "~/trpc/react";

const ReportForm = ({
  report,
  closeModal,
}: {
  report?: Report;
  closeModal?: () => void;
}) => {
  const editing = !!report?.id;

  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm({
    schema: insertReportParams,
    defaultValues: report ?? {
      title: "",
      content: "",
      transcript: "",
    },
  });

  const onSettled = async (
    action: "create" | "update" | "delete",
    data?: { error?: string },
  ) => {
    if (data?.error) {
      toast.error(data.error);
      return;
    }

    await utils.report.byUser.invalidate();

    if (action === "delete") {
      router.push("/reports");
    } else if (action === "update") {
      router.refresh();
    }

    if (closeModal) closeModal();
    toast.success(`Report ${action}d!`);
  };

  const { mutate: createReport, isPending: isCreating } =
    api.report.create.useMutation({
      onSettled: (data, err) => onSettled("create", { error: err?.message }),
    });

  const { mutate: updateReport, isPending: isUpdating } =
    api.report.update.useMutation({
      onSettled: (data, err) => onSettled("update", { error: err?.message }),
    });

  const { mutate: deleteReport, isPending: isDeleting } =
    api.report.delete.useMutation({
      onSettled: (data, err) => onSettled("delete", { error: err?.message }),
    });

  const handleSubmit = (values: NewReportParams) => {
    if (editing) {
      updateReport({ ...values, id: report.id });
    } else {
      createReport(values);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={"space-y-8"}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        /> */}
        <Button
          type="submit"
          className="mr-1"
          disabled={isCreating || isUpdating}
        >
          {editing
            ? `Sav${isUpdating ? "ing..." : "e"}`
            : `Creat${isCreating ? "ing..." : "e"}`}
        </Button>
        {editing ? (
          <Button
            type="button"
            variant={"destructive"}
            onClick={() => deleteReport({ id: report.id })}
          >
            Delet{isDeleting ? "ing..." : "e"}
          </Button>
        ) : null}
      </form>
    </Form>
  );
};

export default ReportForm;
