// app/legal/terms-of-service/page.js
import { FileText, ShieldCheck } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-blue-600 w-8 h-8" />
          <h1 className="text-3xl font-bold text-gray-900">
                <a href="/" className="text-blue-600 hover:underline">
                    ColdMaily
                </a>{" "}
                - Terms of Service
          </h1>
        </div>

        {/* Intro */}
        <p className="text-gray-700 mb-6">
          Welcome to ColdMaily (“we,” “our,” or “us”). ColdMaily is a SaaS platform designed to 
          automate email follow-ups for cold mailing campaigns. These Terms of Service (“Terms”) 
          govern your use of our website, applications, and related services (collectively, the “Service”).
        </p>
        <p className="text-gray-700 mb-6">
          By accessing or using ColdMaily, you agree to be bound by these Terms. 
          If you do not agree, you must not use the Service.
        </p>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 mb-8">
          <em>Effective Date: August 11, 2025 &nbsp; | &nbsp; Last Updated: August 11, 2025</em>
        </p>

        {/* Sections */}
        <h2 className="text-xl font-semibold mt-8 mb-2">1. Eligibility</h2>
        <p className="text-gray-700 mb-6">
          You must be at least 18 years old and capable of forming a legally binding agreement to use ColdMaily.
          By using our Service, you confirm you meet these requirements.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">2. Account Registration</h2>
        <p className="text-gray-700 mb-6">
          You must register an account with accurate and complete information.
          During signup, we request permission via Google/Gmail API to read and send emails on your behalf 
          through SMTP or Gmail API. You are responsible for maintaining the confidentiality of your account credentials.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">3. Scope of Service</h2>
        <p className="text-gray-700 mb-6">
          ColdMaily automates email follow-ups for cold mailing purposes. 
          We currently support sending via SMTP and Gmail API (up to Gmail’s standard sending limit of 500 emails/day). 
          We do not monitor your campaign content in real time but prohibit the use of our Service for spam, phishing, or illegal activities.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">4. Prohibited Activities</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-6">
          <li>Use the Service for gambling, adult content, or illegal trade.</li>
          <li>Send unsolicited bulk messages in violation of anti-spam laws (CAN-SPAM, GDPR, IT Act 2000 of India).</li>
          <li>Engage in phishing or misleading email headers.</li>
          <li>Harass, defame, or harm individuals or entities.</li>
          <li>Attempt to bypass Gmail/SMTP sending limits.</li>
          <li>Upload malware or attempt to compromise the Service.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">5. User Content & AI-Generated Messages</h2>
        <p className="text-gray-700 mb-6">
          You retain all rights to the content you create. 
          ColdMaily may assist in generating templates using AI, but these are suggestions only. 
          You are responsible for reviewing and approving all messages. 
          We are not responsible for damages, legal claims, or losses from your content.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">6. No Deliverability Guarantee</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-6">
          <li>We do not guarantee inbox placement.</li>
          <li>We do not guarantee replies from recipients.</li>
          <li>We do not guarantee accounts will remain in good standing with email providers.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">7. Payments & Refunds</h2>
        <p className="text-gray-700 mb-6">
          ColdMaily is currently free. If paid plans are introduced, details will be updated in these Terms.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">8. Service Availability</h2>
        <p className="text-gray-700 mb-6">
          We strive for high uptime but do not guarantee uninterrupted access. 
          Maintenance or technical issues may cause temporary interruptions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">9. Account Suspension & Termination</h2>
        <p className="text-gray-700 mb-6">
          We reserve the right to suspend or terminate accounts for misuse or illegal activity. 
          Users may revoke Gmail API access anytime from Google account settings.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">10. Intellectual Property</h2>
        <p className="text-gray-700 mb-6">
          ColdMaily’s branding, software, and UI elements remain our intellectual property. 
          You may not copy, modify, or distribute without permission.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">11. Global Access & Compliance</h2>
        <p className="text-gray-700 mb-6">
          ColdMaily is based in India but accessible worldwide. 
          You are responsible for complying with laws in your jurisdiction, including data protection and anti-spam laws.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">12. Limitation of Liability</h2>
        <p className="text-gray-700 mb-6">
          ColdMaily is provided “as is” without warranties. 
          We are not liable for indirect or consequential damages. 
          Our total liability will not exceed the amount paid in the past 12 months (currently $0 for free users).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">13. Consent to Electronic Communications</h2>
        <p className="text-gray-700 mb-6">
          By using our Service, you consent to receive all communications electronically via email or in-platform messages.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">14. Changes to the Service</h2>
        <p className="text-gray-700 mb-6">
          We may modify, suspend, or discontinue parts of the Service without notice.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">15. Governing Law & Jurisdiction</h2>
        <p className="text-gray-700 mb-6">
          These Terms are governed by the laws of India. Disputes will be resolved in the competent courts of [Your City], India.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">16. Changes to These Terms</h2>
        <p className="text-gray-700 mb-6">
          We may update these Terms periodically. Continued use after updates means you accept the changes.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">17. Contact Us</h2>
        <p className="text-gray-700 mb-6">
          Email: <a href="mailto:support@coldmaily.com" className="text-blue-600 hover:underline">support@coldmaily.com</a><br />
          {/* Address: [Your Business Address, India] */}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-10 text-gray-500 text-sm">
          <ShieldCheck className="w-5 h-5" />
          <p>This Terms of Service is effective as of August 11, 2025.</p>
        </div>
      </div>
    </div>
  );
}
