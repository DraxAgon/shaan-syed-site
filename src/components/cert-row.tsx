import type { Certification } from "@/content/certifications";

/* One ledger line for a certification. The name links to the issued
   credential when there is one to verify, so the same row works on
   Awards and on the front page without either owning the markup. */
export function CertRow({
  cert,
  muted = false,
}: {
  cert: Certification;
  muted?: boolean;
}) {
  return (
    <li className="ledger-row">
      <span className="ledger-year">{cert.date ?? ""}</span>
      <span className={`ledger-body${muted ? " muted" : ""}`}>
        {cert.href ? (
          <a
            className="inline-link"
            href={cert.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${cert.name}, opens the credential in a new tab`}
          >
            {cert.name}
          </a>
        ) : (
          cert.name
        )}
        {cert.issuer ? <span className="muted">, {cert.issuer}</span> : null}
      </span>
    </li>
  );
}
