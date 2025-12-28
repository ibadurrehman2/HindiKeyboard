
import React from 'react';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'fa-home' },
    { id: 'tools', label: 'Tools', icon: 'fa-wrench' },
    { id: 'keyboard', label: 'Keyboard', icon: 'fa-keyboard' },
    { id: 'practice', label: 'WPM Test', icon: 'fa-gauge-high' },
    { id: 'about', label: 'About', icon: 'fa-info-circle' },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <i className="fa-solid fa-keyboard text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              DeshKeyboard <span className="text-indigo-500">Hindi</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <i className={`fa-solid ${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
