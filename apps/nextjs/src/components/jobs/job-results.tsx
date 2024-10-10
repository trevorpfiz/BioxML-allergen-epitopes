export default function JobResults({ job }) {
  const renderResultComponent = () => {
    switch (job.type) {
      case "conformational-b-structure":
        return <ConformationalBStructureResult job={job} />;
      case "conformational-b-sequence":
        return <ConformationalBSequenceResult job={job} />;
      // ... other cases
      default:
        return <p>Unknown job type</p>;
    }
  };

  return <div>{renderResultComponent()}</div>;
}
