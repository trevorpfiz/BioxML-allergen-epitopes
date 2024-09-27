import { ConformationalBCompareForm } from "~/components/peptides/forms/conformational-b-compare-form";
import { createClient } from "~/utils/supabase/server";

export default async function ConformationalBComparePage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error ?? !data.user.id) {
    throw new Error("User not found");
  }

  return (
    <main>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="my-4 text-2xl font-semibold">
          Compare conformational B-cell epitopes
        </h1>
        <ConformationalBCompareForm />
      </div>
    </main>
  );
}
