import React from 'react';
import { Mail, Database } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };

  const handleLogoClick = () => {
    handleNavigation('compose');
  };

  const navItems = [
    {
      id: 'compose',
      label: 'Compose',
      icon: Mail,
    },
    {
      id: 'records',
      label: 'Records',
      icon: Database,
    },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors duration-200 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg px-2 py-1"
          >
            <Mail size={28} className="flex-shrink-0" />
            <span className="hidden sm:inline">UniMail Pro</span>
          </button>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                    }
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  `}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
