interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="flex w-full flex-col justify-center gap-4">
      <h1 className={"text-md"}>Epitope Prediction</h1>
      <p className="text-2xl font-bold">{label}</p>
    </div>
  );
};
