import { MOBILES_BRANDS } from "@/lib/mobiles";

export function BrandsStrip() {
  return (
    <div className="brands-strip">
      {MOBILES_BRANDS.map((b) => (
        <span key={b}>{b}</span>
      ))}
    </div>
  );
}