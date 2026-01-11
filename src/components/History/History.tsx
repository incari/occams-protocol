import { CombinedHistory } from './CombinedHistory';

export function History() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 mt-4">History</h1>
      <CombinedHistory />
    </div>
  );
}
