import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col pt-14">
      <section className="section-spacing">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose-academic"
          >
            <h1>Terms & Conditions</h1>
            
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By using ShobdoHub, you agree to comply with these Terms & Conditions. If you do not agree with any part of these terms, please do not use our platform.
            </p>

            <h2>2. Use of Content</h2>
            <p>
              All content on ShobdoHub is provided for educational purposes only. You may not copy, reproduce, or redistribute content without explicit permission from ShobdoHub.
            </p>

            <h2>3. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Misuse the platform in any way</li>
              <li>Attempt to access restricted areas of the platform</li>
              <li>Upload harmful, misleading, or inappropriate content</li>
              <li>Use automated tools to scrape or download content</li>
              <li>Share your account credentials with others</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>
              All content, design, logos, and materials on ShobdoHub are the property of ShobdoHub unless otherwise stated. Unauthorized use of our intellectual property is prohibited.
            </p>

            <h2>5. Service Availability</h2>
            <p>
              We may update, modify, or temporarily suspend services for maintenance or improvement. We will try to provide notice when possible, but we are not liable for any disruption in service.
            </p>

            <h2>6. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account and for all activities that occur under your account. Please use a strong password and keep your login credentials confidential.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              ShobdoHub is an educational platform. We are not responsible for exam results, academic outcomes, or any decisions made based on information provided on our platform. Learning progress depends on individual effort and commitment.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of ShobdoHub after changes are posted constitutes acceptance of the new terms.
            </p>

            <h2>9. Contact</h2>
            <p>
              For questions about these terms, please contact us at support@shobdohub.com.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}