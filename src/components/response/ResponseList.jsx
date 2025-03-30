import ResponseCard from './ResponseCard';

export default function ResponseList({ responses = [], promptId }) {
  return (
    <div className="responses-container">
      {responses.map(response => (
        <ResponseCard key={response.id} response={response} promptId={promptId} />
      ))}
    </div>
  );
}