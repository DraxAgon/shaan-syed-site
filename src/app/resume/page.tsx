import { existsSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";

import { SectionBeside } from "@/components/section";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Shaan Syed's resume as a PDF. Computer Science at Waterloo and Business at Lazaridis, with work at the City of Toronto, Strello Health, and Sumo Dino.",
};

const RESUME_FILE = "Shaan_Syed_Resume.pdf";
const RESUME_PATH = `/${RESUME_FILE}`;

export default function ResumePage() {
  /* Resolved at build time. If the file is ever removed, the page
     still renders and says so rather than showing a broken frame. */
  const hasResume = existsSync(
    path.join(process.cwd(), "public", RESUME_FILE),
  );

  return (
    <>
      <div className="rail hero">
        <div className="rail-side" aria-hidden="true" />
        <div className="rail-main">
          <h1 className="page-heading">Resume</h1>
        </div>
      </div>

      <SectionBeside heading="Resume PDF" id="resume">
          {hasResume ? (
            <>
              <p className="mb-0">
                <a className="link" href={RESUME_PATH} download>
                  {RESUME_FILE}
                </a>
              </p>

              <object
                data={RESUME_PATH}
                type="application/pdf"
                className="resume-frame mt-6"
                aria-label="Resume, PDF"
              >
                <p className="prose-text">
                  Your browser cannot display the PDF inline. Use the download
                  link above to open it.
                </p>
              </object>
            </>
          ) : (
            <p className="prose-text">
              The resume PDF is not in this build. Add {RESUME_FILE} to the
              public folder and redeploy.
            </p>
          )}
      </SectionBeside>
    </>
  );
}
