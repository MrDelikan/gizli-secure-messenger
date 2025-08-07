import React from 'react';
import './SectionWrapper.css';

interface SectionWrapperProps {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = ''
}) => {
  return (
    <div className={`section-wrapper ${className}`}>
      <div className="section-wrapper-header">
        <h2 className="section-wrapper-title">
          <span className="section-icon">{icon}</span>
          {title}
        </h2>
        <p className="section-wrapper-subtitle">{subtitle}</p>
      </div>
      
      <div className="section-wrapper-content">
        {children}
      </div>
    </div>
  );
};
