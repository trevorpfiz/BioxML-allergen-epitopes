import JobForm from "~/components/jobs/job-form";

export default function Home() {
  return (
    <main className="m-auto w-full p-8">
      <div className="mx-auto flex flex-1 gap-4 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <div className="relative flex w-full min-w-0 flex-col gap-8">
          <h1 className="my-2 text-2xl font-bold">Home</h1>
          <JobForm />
        </div>
      </div>
    </main>
  );
}
