import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'white' | 'nav';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold rounded-[2px] transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide";
  
  const variants = {
    primary: "bg-lion-orange text-white hover:bg-white hover:text-lion-orange border-2 border-lion-orange",
    outline: "border-2 border-lion-orange text-lion-orange hover:bg-lion-orange hover:text-white",
    white: "bg-white text-lion-black hover:bg-gray-100",
    nav: "bg-lion-orange text-white text-xs font-bold px-3 py-1 rounded-sm hover:bg-[#FF6020]"
  };

  const sizes = {
    xs: "px-3 py-1 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};