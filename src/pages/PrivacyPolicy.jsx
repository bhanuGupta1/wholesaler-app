import React from 'react';
import { FaEnvelope, FaLock, FaGavel, FaUserShield, FaChartBar, FaCookieBite } from 'react-icons/fa';

const PrivacyPolicy = () => {
  const lastUpdated = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="lg:w-1/4 mb-8 lg:mb-0 lg:pr-10 sticky top-20 self-start">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Contents</h2>
            <nav className="space-y-4">
              {sections.map(({ id, label, icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {icon && <span className="mr-2 text-indigo-500">{icon}</span>}
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white shadow rounded-lg p-10 prose prose-indigo max-w-none">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: {lastUpdated}</p>

          {/* Overview */}
          <section id="overview">
            <h2>Overview</h2>
            <p>
              At WholesaleHub, your privacy is critically important to us. This policy explains what
              information we collect, how we use it, and the choices you have. By using our services,
              you consent to the practices outlined in this document.
            </p>
          </section>

          {/* Data Collection */}
          <section id="data-collection">
            <h2>Data Collection</h2>
            <p>We collect the following types of data:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email, business address, phone, etc.</li>
              <li><strong>Transaction Data:</strong> Orders, billing, and payment history.</li>
              <li><strong>Device Data:</strong> IP address, browser type, location, and activity logs.</li>
              <li><strong>Communication Data:</strong> Emails, feedback, or chat support transcripts.</li>
            </ul>
          </section>

          {/* Cookies */}
          <section id="cookies">
            <h2>Cookies & Tracking Technologies</h2>
            <p>
              We use cookies, web beacons, and similar technologies to analyze trends, administer the site,
              track users’ movements, and gather demographic information. You can control cookie settings
              through your browser preferences.
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for core site functionality.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand usage patterns.</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant ads and promotions.</li>
            </ul>
          </section>

          {/* Use of Data */}
          <section id="usage">
            <h2>How We Use Your Data</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Enable platform features and account authentication</li>
              <li>Process transactions and provide billing support</li>
              <li>Send important alerts, receipts, and order notifications</li>
              <li>Improve our platform using analytics and feedback</li>
              <li>Comply with legal obligations and protect platform integrity</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section id="sharing">
            <h2>Data Sharing & Third Parties</h2>
            <p>
              We do not sell your personal information. We only share it with:
            </p>
            <ul>
              <li>Service providers (e.g. Stripe, Firebase, shipping partners)</li>
              <li>Legal authorities when required under applicable laws</li>
              <li>Business affiliates, in compliance with confidentiality standards</li>
            </ul>
          </section>

          {/* User Rights */}
          <section id="rights">
            <h2>Your Rights & Choices</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access, update, or delete your data</li>
              <li>Withdraw consent or object to processing</li>
              <li>Export data in a machine-readable format</li>
              <li>Submit complaints to your local privacy authority</li>
            </ul>
          </section>

          {/* Updates */}
          <section id="updates">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. If significant changes are made, we will notify
              you via email or prominently on our platform. Continued use after such updates constitutes acceptance.
            </p>
          </section>

          {/* Contact */}
          <section id="contact">
            <h2>Contact Us</h2>
            <p>
              If you have questions or concerns regarding this policy or our data handling practices,
              please contact us:
            </p>
            <p className="flex items-center">
              <FaEnvelope className="text-indigo-600 mr-2" />
              <a href="mailto:privacy@wholesalehub.com" className="text-indigo-700 underline">
                privacy@wholesalehub.com
              </a>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
