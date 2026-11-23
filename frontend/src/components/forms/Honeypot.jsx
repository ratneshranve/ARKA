/** Hidden field that humans never see or fill. Bots that fill it are silently discarded by the API. */
export default function Honeypot({ register }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
    </div>
  );
}
