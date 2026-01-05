import { motion } from 'framer-motion';
import { Mail, Globe } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col pt-14">
      <section className="section-spacing">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">
              Contact Us
            </h1>
            <p className="text-muted-foreground">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto space-y-6"
          >
            <div className="p-6 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground text-sm">For general inquiries</p>
                </div>
              </div>
              <a 
                href="mailto:support@shobdohub.com" 
                className="text-primary hover:underline"
              >
                support@shobdohub.com
              </a>
            </div>

            <div className="p-6 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Website</h3>
                  <p className="text-muted-foreground text-sm">Visit our platform</p>
                </div>
              </div>
              <span className="text-primary">www.shobdohub.com</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              We typically respond within 24-48 hours.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}