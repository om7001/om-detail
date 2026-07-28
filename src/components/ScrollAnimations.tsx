import { ReactNode } from "react";
import { motion } from "motion/react";

interface ScrollSectionProps {
  children: ReactNode;
  preset: "fade-up" | "slide-in" | "scale-focus" | "rotate-3d";
  direction?: "left" | "right" | "up";
  delay?: number;
  className?: string;
}

export function ScrollSection({
  children,
  preset,
  direction = "up",
  delay = 0,
  className = ""
}: ScrollSectionProps) {
  // Select animation configurations based on the chosen preset
  const getVariants = () => {
    switch (preset) {
      case "slide-in":
        return {
          hidden: {
            opacity: 0,
            x: direction === "left" ? -60 : direction === "right" ? 60 : 0,
            y: direction === "up" ? 40 : 0
          },
          visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1], // Custom elegant ease-out cubic
              delay: delay
            }
          }
        };
      case "scale-focus":
        return {
          hidden: {
            opacity: 0,
            scale: 0.92,
            y: 10
          },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 90,
              damping: 18,
              delay: delay
            }
          }
        };
      case "rotate-3d":
        return {
          hidden: {
            opacity: 0,
            rotateX: 30,
            y: 30,
            transformPerspective: 1200
          },
          visible: {
            opacity: 1,
            rotateX: 0,
            y: 0,
            transition: {
              duration: 0.95,
              ease: [0.25, 1, 0.5, 1],
              delay: delay
            }
          }
        };
      case "fade-up":
      default:
        return {
          hidden: {
            opacity: 0,
            y: 45
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.75,
              ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
              delay: delay
            }
          }
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
