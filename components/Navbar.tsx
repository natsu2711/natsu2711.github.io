
import React from 'react';

interface NavbarProps {
    onSelectFilter: (type: 'category', value: string) => void;
    onSelectView: (view: 'about' | 'faq') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSelectFilter, onSelectView }) => {
  const navItems = [
    { label: '今日新闻', type: 'category', value: '生活' }, // Assuming this maps to a category
    { label: '编程相关', type: 'category', value: '编程相关' },
    { label: 'CG', type: 'category', value: '画画相关' }, // Assuming this maps to a category
    { label: '音乐相关', type: 'category', value: '音乐相关' }, // Assuming this maps to a category
    { label: 'FAQ', type: 'view', value: 'faq' },
    { label: 'ABOUT', type: 'view', value: 'about' },
  ];

  const handleClick = (item: typeof navItems[0]) => {
    if (item.type === 'category') {
      onSelectFilter('category', item.value);
    } else if (item.type === 'view' && (item.value === 'about' || item.value === 'faq')) {
      onSelectView(item.value);
    }
  }

  return (
    <div className="border-b-4 border-accent">
      <nav className="bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center h-12 overflow-x-auto">
            {navItems.map((item, index) => (
              <li key={item.label} className="flex-shrink-0">
                <button 
                  onClick={() => handleClick(item)}
                  className="text-white font-semibold px-4 py-2 text-sm whitespace-nowrap hover:text-gray-300 transition-colors h-full"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
