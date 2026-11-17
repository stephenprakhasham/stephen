import { MOBILES_BRANDS } from "@/lib/mobiles";

export function BrandsStrip() {
  const row1 = MOBILES_BRANDS;
  const row2 = [...MOBILES_BRANDS].reverse();

  return (
    <div className="ym-brands">
      <div className="ym-mq">
        <div className="ym-mq-track">
          <div className="ym-mq-grp">
            {row1.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
          <div className="ym-mq-grp" aria-hidden="true">
            {row1.map((b) => (
              <span key={`${b}-dup`}>{b}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="ym-mq rev">
        <div className="ym-mq-track">
          <div className="ym-mq-grp">
            {row2.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
          <div className="ym-mq-grp" aria-hidden="true">
            {row2.map((b) => (
              <span key={`${b}-dup`}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}