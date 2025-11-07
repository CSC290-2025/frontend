import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Home, Settings, Bell, User } from 'lucide-react';

// --- MenuBar Component ---

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  gradient: string;
  iconColor: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: 'Hot line',
    href: '/hotline',
    gradient:
      'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
    iconColor: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: 'Activities',
    href: '/activity',
    gradient:
      'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)',
    iconColor: 'group-hover:text-orange-500 dark:group-hover:text-orange-400',
  },
];

// Animation variants for different parts of the menu
const itemVariants: Variants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants: Variants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
    },
  },
};

const navGlowVariants: Variants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

function MenuBar(): React.JSX.Element {
  return (
    <motion.nav
      className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/60 p-2 shadow-lg backdrop-blur-lg dark:border-gray-800/80 dark:bg-black/60 dark:shadow-gray-900/20"
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        className="pointer-events-none absolute -inset-2 z-0 rounded-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 50%, rgba(239,68,68,0.1) 100%)',
        }}
        variants={navGlowVariants}
      />
      <ul className="relative z-10 flex items-center gap-2">
        {menuItems.map((item: MenuItem) => (
          <motion.li key={item.label} className="relative">
            <motion.div
              className="group relative block overflow-visible rounded-xl"
              style={{ perspective: '600px' }}
              whileHover="hover"
              initial="initial"
            >
              {/* Glow effect on hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
                variants={glowVariants}
                style={{
                  background: item.gradient,
                  opacity: 0,
                }}
              />
              {/* Front-facing menu item */}
              <motion.a
                href={item.href}
                className="relative z-10 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"
                variants={itemVariants}
                transition={sharedTransition}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center bottom',
                }}
              >
                <span
                  className={`transition-colors duration-300 ${item.iconColor}`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </motion.a>
              {/* Back-facing menu item for the 3D flip effect */}
              <motion.a
                href={item.href}
                className="absolute inset-0 z-10 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"
                variants={backVariants}
                transition={sharedTransition}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center top',
                  transform: 'rotateX(90deg)',
                }}
              >
                <span
                  className={`transition-colors duration-300 ${item.iconColor}`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </motion.a>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
}

export default MenuBar;
