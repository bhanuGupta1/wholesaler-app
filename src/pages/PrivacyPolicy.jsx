import React from 'react';
import { FaEnvelope, FaUserShield, FaChartBar, FaCookieBite, FaLock, FaGavel } from 'react-icons/fa';

const PrivacyPolicy = () => {
  // Here I set the last updated date dynamically
  const lastUpdated = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Here I define the navigation sections for the sidebar
  const sections = [
    { id: 'overview', label: 'Overview', icon: <FaUserShield /> },
    { id: 'data-collection', label: 'Data Collection', icon: <FaChartBar /> },
    { id: 'cookies', label: 'Cookies & Tracking', icon: <FaCookieBite /> },
    { id: 'usage', label: 'Use of Data', icon: <FaLock /> },
    { id: 'sharing', label: 'Data Sharing', icon: <FaGavel /> },
    { id: 'rights', label: 'User Rights' },
    { id: 'updates', label: 'Policy Updates' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="bg-gray-50 py-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Here I add the sidebar navigation */}
        <aside className="lg:w-1/4 bg-white shadow border border-gray-200 rounded-lg p-6 sticky top-24 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contents</h2>
          <nav className="space-y-3 text-sm">
            {sections.map(({ id, label, icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center text-gray-600 hover:text-indigo-600 transition"
              >
                {icon && <span className="mr-2 text-indigo-500">{icon}</span>}
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Here I add the main privacy policy content */}
        <main className="flex-1 bg-white p-8 rounded-lg shadow text-gray-800">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          {/* Here I add the overview section */}
          <section id="overview" className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p>
              At WholesaleHub, your privacy is important to us. This policy explains what data we collect, how we use it, and your rights.
              By using our services, you consent to this policy.
            </p>
          </section>

          {/* Here I add the data collection section */}
          <section id="data-collection" className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Account Information:</strong> Name, email, business details</li>
              <li><strong>Transaction Data:</strong> Orders, payments, invoices</li>
              <li><strong>Device Info:</strong> IP address, browser, location</li>
              <li><strong>Communication Logs:</strong> Emails, support requests</li>
            </ul>
          </section>

          {/* Here I add the cookies and tracking section */}
          <section id="cookies" className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Cookies & Tracking</h2>
            <p className="mb-3">
              We use cookies and similar tools to personalize your experience and analyze usage:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Essential:</strong> Required for app functionality</li>
              <li><strong>Analytics:</strong> Helps us improve user experience</li>
              <li><strong>Marketing:</strong> Used for offers and ads (if applicable)</li>
            </ul>
          </section>

          {/* Here I add the data usage section */}
          <section id="usage" className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To operate and maintain our platform</li>
              <li>To process payments and track orders</li>
              <li>To send emails, receipts, and account alerts</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Here I add the data sharing section */}
          <section id="sharing" className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
            <p>We do not sell your personal data. We may share it with:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Service providers (e.g. payment processors)</li>
              <li>Legal authorities if required by law</li>
              <li>Partners under strict confidentiality</li>
            </ul>
          </section>

          {/* Here I add the user rights section */}
          <section id="rights" className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">User Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access and download your data</li>
              <li>Request data correction or deletion</li>
              <li>Opt out of marketing communication</li>
              <li>Close your account and delete associated data</li>
            </ul>
          </section>

          {/* Here I add the policy updates section */}
          <section id="updates" className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Policy Updates</h2>
            <p>
              We may update this policy from time to time. Changes will be posted here with a revised “last updated” date.
            </p>
          </section>

          {/* Here I add the contact section */}
          <section id="contact">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="flex items-center text-gray-700">
              <FaEnvelope className="text-indigo-600 mr-2" />
              <span>Email us at: <a href="mailto:privacy@wholesalehub.com" className="text-indigo-600 underline">privacy@wholesalehub.com</a></span>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
