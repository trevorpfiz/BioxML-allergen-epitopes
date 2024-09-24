"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@epi/ui/button";
import { toast } from "@epi/ui/sonner";

import { env } from "~/env";
import { api } from "~/trpc/react";

const FileUpload = (props: { token: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const utils = api.useUtils();
  const createReport = api.report.create.useMutation({
    onSuccess: async () => {
      await utils.report.invalidate();
      setUploading(false);
      router.push("/reports");
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in"
          : "Failed to create report",
      );
    },
  });

  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);

    // Create the FormData object to upload the file
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${env.NEXT_PUBLIC_FASTAPI_URL}/v1/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Upload successful:", responseData.message || responseData);

      const currentDate = getFormattedDate();
      createReport.mutate({
        title: `Mary Smith - ${currentDate}`,
        content: responseData.prechart,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed.");
    }

    // Reset the file state and clear the input
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      <input
        ref={fileInputRef}
        id="file"
        type="file"
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            setFile(files[0]!);
          }
        }}
        accept=".zip"
      />
      <Button type="submit" disabled={uploading || !file}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
};

export { FileUpload };
