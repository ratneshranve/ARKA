export default function SpecTable({ rows = [], caption }) {
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm sm:text-base">
        {caption && <caption className="sr-only">{caption}</caption>}
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.label}-${i}`} className={i % 2 === 0 ? 'bg-muted' : 'bg-white'}>
              <th scope="row" className="w-2/5 px-4 py-3 align-top font-semibold text-primary">
                {r.label}
              </th>
              <td className="px-4 py-3 text-ink">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
