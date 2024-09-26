import { ConformationalBSequenceForm } from "~/components/peptides/conformational-b-sequence-form";
import { createClient } from "~/utils/supabase/server";

export default async function ConformationalBSequenceBasedPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error ?? !data.user.id) {
    throw new Error("User not found");
  }

  return (
    <main>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="my-4 text-2xl font-semibold">
          Conformational B-cell sequence-based prediction
        </h1>
        <ConformationalBSequenceForm />
      </div>
    </main>
  );
}
