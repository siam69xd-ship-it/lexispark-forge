import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col pt-14">
      <section className="section-spacing">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose-academic"
          >
            <h1>Privacy Policy</h1>
            
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>

            <p>
              At ShobdoHub, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We may collect the following information:</p>
            <ul>
              <li>Name or username</li>
              <li>Email address</li>
              <li>Learning activity and progress data</li>
              <li>Device and browser information</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>Your data is used to:</p>
            <ul>
              <li>Improve your learning experience</li>
              <li>Personalize content and recommendations</li>
              <li>Track your progress and achievements</li>
              <li>Maintain platform functionality and security</li>
              <li>Communicate important updates about the service</li>
            </ul>

            <h2>3. Data Protection</h2>
            <p>
              We implement industry-standard security measures to protect your personal data. We do not sell, trade, or share personal data with third parties for marketing purposes.
            </p>

            <h2>4. Cookies</h2>
            <p>
              Cookies may be used to enhance user experience, remember your preferences, and analyze platform usage. You can control cookie settings through your browser.
            </p>

            <h2>5. Third-Party Services</h2>
            <p>
              We may use third-party services for authentication, analytics, and platform functionality. These services have their own privacy policies, and we encourage you to review them.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide our services. You may request deletion of your data at any time.
            </p>

            <h2>7. User Control</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Request data deletion or account removal</li>
              <li>Opt out of non-essential communications</li>
            </ul>

            <h2>8. Children's Privacy</h2>
            <p>
              ShobdoHub is designed for learners of all ages. We do not knowingly collect personal information from children under 13 without parental consent.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes through the platform or via email.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at support@shobdohub.com.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}