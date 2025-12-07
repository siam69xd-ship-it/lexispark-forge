import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient?: 'purple' | 'blue' | 'mixed';
  index?: number;
}

export default function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  gradient = 'purple',
  index = 0 
}: FeatureCardProps) {
  const gradientClasses = {
    purple: 'from-purple-electric/20 to-purple-electric/5',
    blue: 'from-neon-blue/20 to-neon-blue/5',
    mixed: 'from-purple-electric/15 via-neon-blue/10 to-transparent',
  };

  const iconBgClasses = {
    purple: 'bg-purple-electric/10 text-purple-electric',
    blue: 'bg-neon-blue/10 text-neon-blue',
    mixed: 'bg-gradient-accent text-primary-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={href}>
        <motion.div
          className="group relative p-6 rounded-2xl glass border border-border/50 overflow-hidden h-full"
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradient]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          
          {/* Glow Effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

          <div className="relative z-10">
            {/* Icon */}
            <motion.div 
              className={`w-14 h-14 rounded-xl ${iconBgClasses[gradient]} flex items-center justify-center mb-4`}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Icon className="w-7 h-7" />
            </motion.div>

            {/* Content */}
            <h3 className="text-xl font-bold font-display text-foreground mb-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>

            {/* Arrow */}
            <motion.div 
              className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -10 }}
              whileHover={{ x: 0 }}
            >
              <span className="text-sm font-medium">Explore</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
