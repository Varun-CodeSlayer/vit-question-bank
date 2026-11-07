import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms and Conditions | VIT Question Bank",
  description:
    "Terms and Conditions for accessing and using the VIT Question Bank platform.",
};

export default function TermsPage() {
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
              Terms and <span className="grad">Conditions</span>
            </h1>
            <div className="legal-meta">
              <span>Last Updated: 7th November 2026</span>
            </div>
          </header>

          <article className="legal-card">
            <div className="legal-intro">
              <p>
                Welcome to [SITE NAME]. By accessing or using this website, you
                agree to comply with the following Terms and Conditions.
              </p>
              <p>
                Please read these terms carefully before using the website.
              </p>
            </div>

            <div className="legal-content">
              {/* Section 1 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">1.</span> About the Website
                </h2>
                <p>
                  [SITE NAME] is an independent educational platform intended to
                  help students access and practise previous examination questions
                  and academic resources.
                </p>
                <p>The website provides features such as:</p>
                <ul className="legal-list">
                  <li>Previous examination question papers.</li>
                  <li>Topic-wise and module-wise question collections.</li>
                  <li>Course-specific syllabus resources.</li>
                  <li>Student-contributed academic materials.</li>
                </ul>
                <p>
                  The platform is intended for educational and reference purposes
                  only.
                </p>
              </section>

              {/* Section 2 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">2.</span> Independent Platform Disclaimer
                </h2>
                <p>[SITE NAME] is an independently operated student initiative.</p>
                <p>
                  It is not affiliated with, endorsed by, sponsored by, or
                  officially associated with Vellore Institute of Technology
                  (VIT).
                </p>
                <p>
                  All references to VIT, its courses, campuses and academic
                  materials are made solely for identification and educational
                  reference purposes.
                </p>
              </section>

              {/* Section 3 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">3.</span> Permitted Use
                </h2>
                <p>
                  Users may access and use the website for legitimate
                  educational and personal study purposes.
                </p>
                <p>You agree not to:</p>
                <ul className="legal-list">
                  <li>Use the website for unlawful purposes.</li>
                  <li>
                    Disrupt, damage or interfere with website functionality.
                  </li>
                  <li>
                    Attempt unauthorised access to the website, database or
                    infrastructure.
                  </li>
                  <li>
                    Scrape, copy or redistribute website content in ways that
                    violate applicable rights or laws.
                  </li>
                  <li>
                    Misrepresent yourself or submit misleading information.
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">4.</span> Question Papers and Academic Materials
                </h2>
                <p>
                  The website may provide previous examination papers and other
                  academic resources for educational reference.
                </p>
                <p>Users acknowledge that:</p>
                <ul className="legal-list">
                  <li>The accuracy and completeness of materials may vary.</li>
                  <li>
                    Question papers may originate from student contributions or
                    other permitted sources.
                  </li>
                  <li>
                    The availability of a document does not guarantee that it
                    reflects the latest examination pattern or syllabus.
                  </li>
                  <li>
                    Students should refer to official academic resources for
                    authoritative information.
                  </li>
                </ul>
                <p>
                  We do not guarantee that every document is complete, accurate
                  or officially verified.
                </p>
              </section>

              {/* Section 5 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">5.</span> User Contributions
                </h2>
                <p>
                  Users may voluntarily contribute previous examination papers
                  through the contribution page.
                </p>
                <p>By submitting a document, you confirm that:</p>
                <ul className="legal-list">
                  <li>
                    You have the right or necessary permission to submit the
                    material.
                  </li>
                  <li>
                    The submission does not knowingly violate copyright,
                    confidentiality or other applicable rights.
                  </li>
                  <li>
                    The information provided is accurate to the best of your
                    knowledge.
                  </li>
                  <li>
                    You are not knowingly uploading malicious, misleading or
                    inappropriate files.
                  </li>
                </ul>
                <p>
                  By submitting a contribution, you grant [SITE NAME] permission
                  to review, store, organise, display and distribute the
                  submitted material through the website for its educational
                  purpose, subject to applicable rights and permissions.
                </p>
                <p>
                  Submitting a document does not transfer ownership or copyright
                  to the website.
                </p>
                <p>
                  We reserve the right to review, reject, modify its
                  categorisation, restrict access to or remove submitted
                  materials where appropriate.
                </p>
              </section>

              {/* Section 6 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">6.</span> Copyright and Intellectual Property
                </h2>
                <p>
                  All question papers, academic documents, logos, course
                  materials and other third-party resources remain the property
                  of their respective owners.
                </p>
                <p>
                  The availability of a document on this website does not imply
                  that [SITE NAME] owns the document or claims copyright over
                  it.
                </p>
                <p>
                  The website&apos;s original design, branding, software and
                  independently created content may be protected by applicable
                  intellectual property laws.
                </p>
                <p>
                  If you believe material hosted or linked through our website
                  infringes your rights, contact us with the relevant details so
                  that the matter can be reviewed.
                </p>
              </section>

              {/* Section 7 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">7.</span> External Links and Third-Party Services
                </h2>
                <p>
                  The website may use or link to third-party platforms,
                  including Google Drive and other external services.
                </p>
                <p>
                  We do not control the availability, security, policies or
                  content of these external services and are not responsible for
                  interruptions or changes made by their providers.
                </p>
              </section>

              {/* Section 8 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">8.</span> Disclaimer of Warranties
                </h2>
                <p>
                  The website and its resources are provided on an &quot;as
                  is&quot; and &quot;as available&quot; basis.
                </p>
                <p>We do not guarantee:</p>
                <ul className="legal-list">
                  <li>Uninterrupted website availability.</li>
                  <li>Complete accuracy of uploaded documents.</li>
                  <li>Error-free operation of every feature.</li>
                  <li>Continuous availability of externally hosted PDF files.</li>
                  <li>
                    That all academic materials are current or officially
                    verified.
                  </li>
                </ul>
                <p>
                  Users should independently verify important academic
                  information.
                </p>
              </section>

              {/* Section 9 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">9.</span> Limitation of Liability
                </h2>
                <p>
                  To the extent permitted by applicable law, [SITE NAME] and its
                  operators shall not be liable for losses or damages arising
                  from the use of the website, reliance on its materials,
                  temporary service interruptions or the unavailability of
                  third-party resources.
                </p>
                <p>
                  Nothing in these terms excludes liability that cannot legally
                  be excluded.
                </p>
              </section>

              {/* Section 10 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">10.</span> Content Removal Requests
                </h2>
                <p>
                  If you are a copyright holder, content owner or authorised
                  representative and believe that material available through the
                  website should be removed, please contact us.
                </p>
                <p>Include:</p>
                <ul className="legal-list">
                  <li>The document or resource in question.</li>
                  <li>Its website URL or identifying details.</li>
                  <li>An explanation of your concern.</li>
                  <li>
                    Your contact information and relevant supporting evidence.
                  </li>
                </ul>
                <p>
                  We will review legitimate requests and take appropriate action
                  where necessary.
                </p>
                <p>Contact: [CONTACT EMAIL]</p>
              </section>

              {/* Section 11 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">11.</span> Changes to These Terms
                </h2>
                <p>
                  We reserve the right to update these Terms and Conditions as the
                  website evolves.
                </p>
                <p>
                  Revised terms will be published on this page with an updated
                  date. Continued use of the website after changes are published
                  constitutes acceptance of the revised terms, to the extent
                  permitted by applicable law.
                </p>
              </section>

              {/* Section 12 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">12.</span> Governing Law
                </h2>
                <p>
                  These Terms and Conditions shall be governed by the applicable
                  laws of India, subject to applicable legal requirements.
                </p>
              </section>

              {/* Section 13 */}
              <section className="legal-section">
                <h2 className="legal-section-title">
                  <span className="legal-section-num">13.</span> Contact Information
                </h2>
                <p>
                  For questions regarding these Terms and Conditions, contact:
                </p>
                <div className="legal-contact-block">
                  <div>Student Portfolio</div>
                  <div>Email: varun.s.spiderman@gmail.com</div>
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

