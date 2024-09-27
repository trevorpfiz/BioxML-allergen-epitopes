import dynamic from "next/dynamic";

const BasicMoleculeViewer = dynamic(
  () => import("~/components/peptides/3Dmol/basic-viewer"),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col gap-8">
        <h1 className="my-2 text-2xl font-bold">Dashboard</h1>

        <div className="mx-auto w-full max-w-2xl">
          <h2 className="mb-2 text-xl font-semibold">
            3OB4 - MBP-fusion protein of the major peanut allergen Ara h 2
          </h2>
          <div className="min-h-[402px] w-full border shadow">
            <BasicMoleculeViewer pdbId="3OB4" />
          </div>
        </div>
      </div>
    </main>
  );
}
