'use client';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main role="alert">
      <h1>エラーが発生しました</h1>
      <p>ページの読み込みに失敗しました。</p>
      <button type="button" className="btn" onClick={() => reset()}>もう一度試す</button>
    </main>
  );
}
