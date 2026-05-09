import React from 'react';

/**
 * Shared <Section> layout primitive.
 *
 * Use this for all top-level page sections so padding / max-width /
 * background variants stay consistent across the site. Components that
 * need custom decoration (background gradients, etc.) can wrap their
 * content with <Section> and add their own absolute-positioned layers
 * via children.
 */

interface SectionProps {
  id?: string;
  /** dark = lion-dark / light = white / black = pure black (legacy) */
  variant?: 'dark' | 'light' | 'black';
  /** vertical padding scale. default = py-24 */
  padY?: 'sm' | 'md' | 'lg';
  /** wide = max-w-7xl, default = container */
  width?: 'default' | 'wide' | 'narrow';
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<SectionProps['variant']>, string> = {
  dark: 'bg-lion-dark text-white',
  light: 'bg-white text-gray-900',
  black: 'bg-black text-white',
};

const padYClasses: Record<NonNullable<SectionProps['padY']>, string> = {
  sm: 'py-16',
  md: 'py-24',
  lg: 'py-28',
};

const widthClasses: Record<NonNullable<SectionProps['width']>, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
};

export const Section: React.FC<SectionProps> = ({
  id,
  variant = 'dark',
  padY = 'md',
  width = 'default',
  className = '',
  children,
}) => {
  return (
    <section
      id={id}
      className={`relative ${variantClasses[variant]} ${padYClasses[padY]} ${className}`}
    >
      <div className={`container mx-auto px-4 md:px-6 ${widthClasses[width]}`}>
        {children}
      </div>
    </section>
  );
};
