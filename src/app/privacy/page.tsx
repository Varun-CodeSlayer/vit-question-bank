import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | VIT Question Bank",
  description:
    "Privacy Policy explaining what information we collect, how it is used, stored, and protected.",
};

export default function PrivacyPage() {
  return (
    <div className="practice-page legal-page">
      {/* Background Ambient Glows */}
      <div className="ambient" aria-hidden="true">
        <div className="ambient__blob ambient__blob--blue"></div>
        <div className="ambient__blob ambient__blob--violet"></div>
      </div>

      <div className="practice-layer">
        <Navbar />

        <main className="legal-main" id="main-content">
          <header className="legal-header">
            <span className="legal-badge">Legal</span>
            <h1 className="legal-title">
              Privacy <span className="grad">Policy</span>
            </h1>
            <div className="legal-meta">
              <span>Last Updated: 7th November 2026</span>
            </div>
          </header>

          <article className="legal-card">
            <div className="legal-intro">
              <p>
                Welcome to [SITE NAME]. We value your privacy and are committed
                to protecting the information you share while using our website.
              </p>
              <p>
                This Privacy Policy explains what information we collect, how we
                use it, how it is stored, and the choices available to you.
              </p>
            </div>

            <div className="legal-content">
              {/* Section 1 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">1.</span> Information We Collect
                </h2>
                <p>
                  We may collect the following information when you use our website:
                </p>
                <h3 className="legal-section-subhead">Information you provide:</h3>
                <ul className="legal-list">
                  <li>
                    Name and other details submitted through the contribution form.
                  </li>
                  <li>
                    Course information and examination details associated with
                    uploaded question papers.
                  </li>
                  <li>
                    Files, documents and other materials you voluntarily submit.
                  </li>
                  <li>
                    Information provided through contact forms or issue reports.
                  </li>
                </ul>

                <h3 className="legal-section-subhead">Automatically collected information:</h3>
                <ul className="legal-list">
                  <li>
                    Basic technical information such as browser type, device
                    information and access logs.
                  </li>
                  <li>
                    Website usage information, if analytics services are enabled.
                  </li>
                </ul>
                <p>
                  We do not intentionally collect sensitive personal information.
                </p>
              </section>

              {/* Section 2 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">2.</span> How We Use Your Information
                </h2>
                <p>Information collected through the website may be used to:</p>
                <ul className="legal-list">
                  <li>Process and review question paper contributions.</li>
                  <li>
                    Organise and categorise examination papers by course and
                    examination details.
                  </li>
                  <li>Maintain and improve the website.</li>
                  <li>Respond to enquiries and reported issues.</li>
                  <li>Identify and resolve technical problems.</li>
                  <li>Prevent misuse, spam and unauthorised activities.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">3.</span> User Contributions and Uploaded Files
                </h2>
                <p>
                  Users may voluntarily submit previous examination papers
                  through our contribution page.
                </p>
                <p>By submitting a contribution, you acknowledge that:</p>
                <ul className="legal-list">
                  <li>
                    The information and files you provide may be reviewed by the
                    website administrators.
                  </li>
                  <li>
                    Approved documents may be made accessible to other website
                    visitors.
                  </li>
                  <li>
                    Submitted documents may be stored using third-party storage
                    services.
                  </li>
                  <li>
                    Personal information included within uploaded documents may
                    be visible to people accessing those documents.
                  </li>
                </ul>
                <p>
                  Please avoid uploading documents containing confidential,
                  sensitive or unnecessary personal information.
                </p>
              </section>

              {/* Section 4 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">4.</span> Data Storage and Third-Party Services
                </h2>
                <p>
                  We may use third-party services to operate the website,
                  including:
                </p>
                <ul className="legal-list">
                  <li>
                    Supabase: For database management and storage of website
                    information.
                  </li>
                  <li>
                    Google Drive: For hosting and displaying PDF documents.
                  </li>
                  <li>Vercel: For website hosting and deployment.</li>
                  <li>
                    Analytics providers: If enabled, for understanding website
                    usage.
                  </li>
                </ul>
                <p>
                  These services may process information according to their
                  respective privacy policies and terms.
                </p>
              </section>

              {/* Section 5 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">5.</span> Data Sharing
                </h2>
                <p>We do not sell users&apos; personal information.</p>
                <p>
                  Information may be accessible to authorised website
                  administrators and relevant service providers when necessary to
                  operate, maintain or improve the website.
                </p>
                <p>
                  Approved contributions may be made available to other users as
                  part of the question bank.
                </p>
              </section>

              {/* Section 6 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">6.</span> Data Retention and Removal
                </h2>
                <p>
                  We retain submitted information and documents for as long as
                  reasonably necessary for the operation of the website or its
                  intended purpose.
                </p>
                <p>
                  If you wish to request the removal or correction of information
                  or a contribution you submitted, contact us at:
                </p>
                <p>Email: [CONTACT EMAIL]</p>
                <p>Requests will be reviewed and handled where reasonably possible.</p>
              </section>

              {/* Section 7 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">7.</span> Cookies and Analytics
                </h2>
                <p>
                  The website may use cookies or similar technologies for
                  essential functionality, security and analytics.
                </p>
                <p>
                  You can manage cookies through your browser settings. Disabling
                  certain cookies may affect website functionality.
                </p>
              </section>

              {/* Section 8 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">8.</span> External Links
                </h2>
                <p>
                  Our website may contain links to external websites and services,
                  including Google Drive.
                </p>
                <p>
                  We are not responsible for the privacy practices, content or
                  security of external websites. We encourage users to review
                  their respective privacy policies.
                </p>
              </section>

              {/* Section 9 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">9.</span> Children&apos;s Privacy
                </h2>
                <p>
                  This website is intended for general student and educational
                  use. We do not knowingly seek to collect personal information
                  from children.
                </p>
                <p>
                  If you believe a child has submitted personal information
                  without appropriate authorisation, please contact us.
                </p>
              </section>

              {/* Section 10 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">10.</span> Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy periodically to reflect
                  changes in our website, features or data practices.
                </p>
                <p>
                  Any updates will be published on this page along with the
                  revised last-updated date.
                </p>
              </section>

              {/* Section 11 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">11.</span> Contact Us
                </h2>
                <p>
                  For questions, concerns or requests regarding this Privacy
                  Policy, contact:
                </p>
                <div className="legal-contact-block">
                  <div>[SITE NAME]</div>
                  <div>Email: varun.s.spiderman@gmail.com </div>
                  <div>Website: https://student-portfolio-varun.vercel.app/#contact </div>
                </div>
              </section>
            </div>

            <div className="legal-disclaimer-box">
              [ SITE NAME ] is an independent educational resource and is not
              officially affiliated with Vellore Institute of Technology (VIT).
            </div>
          </article>
        </main>

        <Footer showCreator={false} />
      </div>
    </div>
  );
}

