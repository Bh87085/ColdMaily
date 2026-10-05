// app/legal/privacy-policy/page.js
import { ShieldCheck, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="text-blue-600 w-8 h-8" />
          <h1 className="text-3xl font-bold text-gray-900">
                <a href="/" className="text-blue-600 hover:underline">
                    ColdMaily
                </a>{" "}
                Privacy Policy
          </h1>

        </div>

        {/* Intro */}
        <p className="text-gray-700 mb-6">
          ColdMaily (“we,” “our,” or “us”) respects your privacy and is committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, store, and protect your information when you use our services. 
          Our platform is based in India but is accessible worldwide. By using ColdMaily, you agree to the practices described in this Privacy Policy.
        </p>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 mb-8">
          <em>Effective Date: August 11, 2025 &nbsp; | &nbsp; Last Updated: August 11, 2025</em>
        </p>

        {/* 1. Information We Collect */}
        <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-6">
          <li><strong>Personal Information:</strong> Name, email address, and profile image (via Google OAuth), plus Gmail account details needed for API permissions.</li>
          <li><strong>Email Metadata:</strong> Thread IDs, message IDs, email headers from Gmail API.</li>
          <li><strong>Encrypted Email Content:</strong> Stored temporarily for sending purposes; we cannot view decrypted bodies.</li>
          <li><strong>Technical Data:</strong> IP address, browser type, operating system, and usage logs.</li>
          <li><strong>Cookies:</strong> Used for authentication, session management, and platform performance.</li>
        </ul>

        {/* 2. How We Collect Data */}
        <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Collect Data</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-6">
          <li>Directly from you during registration or when contacting support.</li>
          <li>Automatically via cookies, analytics tools, and server logs.</li>
          <li>From third-party integrations when you connect Gmail via OAuth or SMTP.</li>
        </ul>

        {/* 3. How We Use Your Data */}
        <h2 className="text-xl font-semibold mt-8 mb-2">3. How We Use Your Data</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-6">
          <li>Provide and operate email automation features.</li>
          <li>Send scheduled emails and follow-ups via Gmail API or SMTP.</li>
          <li>Maintain and improve platform performance.</li>
          <li>Detect and prevent abuse or prohibited activities.</li>
          <li>Comply with legal obligations.</li>
        </ul>
        <p className="text-gray-700 mb-6">
          We do not guarantee delivery into the primary inbox or that recipients will reply. 
          Email placement depends on recipient filters.
        </p>

        {/* 4. Data Sharing */}
        <h2 className="text-xl font-semibold mt-8 mb-2">4. Data Sharing</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-6">
          <li><strong>Service Providers:</strong> Trusted third-party vendors (hosting, email delivery) under confidentiality agreements.</li>
          <li><strong>Legal Requirements:</strong> As required by law, court order, or government authority.</li>
          <li><strong>Aggregated Data:</strong> Shared in anonymized form for analytics or marketing.</li>
          <li>We never sell your personal data to third parties.</li>
        </ul>

        {/* 5. Data Retention */}
        <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Retention</h2>
        <p className="text-gray-700 mb-6">
          Data is stored as long as your account is active. You can revoke Gmail API permissions anytime to stop all processing. 
          Limited logs may remain for compliance and troubleshooting.
        </p>

        {/* 6. Data Security */}
        <h2 className="text-xl font-semibold mt-8 mb-2">6. Data Security</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-6">
          <li>Encrypted storage for email content.</li>
          <li>Secure OAuth authentication for Gmail connections.</li>
          <li>Industry-standard security measures.</li>
          <li>No system can guarantee 100% security.</li>
        </ul>

        {/* 7. Your Rights */}
        <h2 className="text-xl font-semibold mt-8 mb-2">7. Your Rights</h2>
        <ul className="list-disc pl-5 text-gray-700 mb-6">
          <li>Access the personal data we hold about you.</li>
          <li>Request corrections to inaccurate data.</li>
          <li>Request deletion when technically feasible.</li>
          <li>Withdraw Gmail API permissions anytime via Google account settings.</li>
        </ul>

        {/* 8. Future Features */}
        <h2 className="text-xl font-semibold mt-8 mb-2">8. Future Features</h2>
        <p className="text-gray-700 mb-6">
          We may introduce open/click tracking and advanced analytics. 
          These will be opt-in where required and reflected in an updated Privacy Policy.
        </p>

        {/* 9. International Data Transfers */}
        <h2 className="text-xl font-semibold mt-8 mb-2">9. International Data Transfers</h2>
        <p className="text-gray-700 mb-6">
          Your data may be processed outside your country, including in India. 
          By using ColdMaily, you consent to such transfers, subject to applicable laws.
        </p>

        {/* 10. Changes */}
        <h2 className="text-xl font-semibold mt-8 mb-2">10. Changes to This Policy</h2>
        <p className="text-gray-700 mb-6">
          We may update this Privacy Policy periodically. Significant changes will be communicated via email or in-app notifications. 
          Continued use after updates constitutes acceptance.
        </p>

        {/* 11. Contact */}
        <h2 className="text-xl font-semibold mt-8 mb-2">11. Contact Us</h2>
        <p className="text-gray-700 mb-6">
          Email: <a href="mailto:support@coldmaily.com" className="text-blue-600 hover:underline">support@coldmaily.com</a><br/>
          {/* Address: [Your Business Address, India] */}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-10 text-gray-500 text-sm">
          <FileText className="w-5 h-5" />
          <p>This Privacy Policy is effective as of August 11, 2025.</p>
        </div>
      </div>
    </div>
  );
}
