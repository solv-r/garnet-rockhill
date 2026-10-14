/** Renders text where **one word** is emphasised, e.g. "Built on **quality**." Editors can type the ** ** marks in Admin > Site content. */
export function Emphasis({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g); // odd positions are the emphasised words
  return <>{parts.map((p, i) => (i % 2 ? <em key={i} className="em">{p}</em> : p))}</>;
}
