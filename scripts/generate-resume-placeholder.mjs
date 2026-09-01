/**
 * Writes a minimal valid one-page PDF so /resume renders and the build
 * never breaks on a missing file. Replace public/Shaan_Syed_Resume.pdf
 * with the real resume; no code change is needed.
 */
import { writeFileSync, statSync } from "node:fs";

const text = "Shaan Syed. Replace this file with the real resume PDF.";
const content = `BT /F1 14 Tf 72 720 Td (${text}) Tj ET`;

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objects.forEach((obj, i) => {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
});

const xref = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets) {
  pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

const out = "public/Shaan_Syed_Resume.pdf";
writeFileSync(out, pdf, "latin1");
console.log(`${out}  ${statSync(out).size} bytes`);
