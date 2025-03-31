import PromptCard from './PromptCard';

export default function PromptList({ prompts = [] }) {
  return (
    <div className="prompt-list">
      {prompts.map(prompt => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}