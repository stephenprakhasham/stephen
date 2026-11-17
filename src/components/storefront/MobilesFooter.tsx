import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/hot-deals";

export function MobilesFooter() {
  return (
    <footer className="ym-foot">
      <div className="container ym-foot-grid">
        <div>
          <div className="ym-foot-brand">
            <span className="ym-foot-barcode" aria-hidden="true" />
            <b>YAGA MOBILES</b>
          </div>
          <p>Premium mobile accessories. One destination.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link href="/mobiles">Shop all</Link></li>
            <li><Link href="/mobiles?category=smartphones">Smartphones</Link></li>
            <li><Link href="/yaga-hot-deals">Hot deals</Link></li>
          </ul>
        </div>
        <div>
          <h4>Store</h4>
          <ul>
            <li><Link href="/mobiles#faq">About us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          </ul>
        </div>
        <p className="ym-foot-fine">
          © {new Date().getFullYear()} YAGA MOBILES · YAGA GROUP
        </p>
      </div>
    </footer>
  );
}