import React, { useState, useEffect } from 'react';

const DriveThruMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeBoxIndex, setActiveBoxIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/menu-items')
      .then(response => response.json())
      .then(data => {
        setMenuItems(data);
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
        setIsLoading(false);
        // Set initial active index after data loads
        setActiveBoxIndex(0);
      })
      .catch(error => {
        console.error('Error fetching menu items:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoading && menuItems.length > 0) {
      const interval = setInterval(() => {
        setActiveBoxIndex((prevIndex) => (prevIndex + 1) % menuItems.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLoading, menuItems.length]);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-black text-yellow-300 p-6 flex items-center justify-center min-h-screen">
        <p className="text-2xl">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-black text-yellow-300 p-6 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 text-yellow-300">DRIVE-THRU MENU</h1>
        <p className="text-xl">Please Order When Ready</p>
      </div>

      <div className="flex flex-row space-x-8 overflow-x-auto pb-4">
        {categories.map((category) => (
          <div key={category} className="flex-1 min-w-[300px] bg-gray-900 p-6 rounded-xl">
            <h2 className="text-3xl font-bold mb-6 text-white border-b-2 border-yellow-300 pb-2">
              {category}
            </h2>

            <div className="space-y-4">
              {menuItems
                .filter(item => item.category === category)
                .map((item, index) => {
                  const globalIndex = menuItems.indexOf(item);
                  const isActive = activeBoxIndex === globalIndex;
                  
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl p-4 transition-all duration-500 ease-in-out ${
                        isActive
                          ? 'bg-yellow-300 text-black shadow-lg scale-105 border-2 border-white'
                          : 'bg-gray-800 text-yellow-300 shadow-md hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold">{item.name}</span>
                        <span className="text-xl">${Number(item.price).toFixed(2)}</span>
                      </div>
                      
                      <div className={`transition-all duration-500 ${
                        isActive ? 'h-32' : 'h-20'
                      }`}>
                        <div className="h-20 bg-gray-600 rounded-lg mb-2">
                          <img 
                            src="/api/placeholder/200/150"
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        {isActive && (
                          <p className="text-sm mt-2 transition-opacity duration-500">
                            {item.description || 'A delicious menu item'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm border-t-2 border-yellow-300 pt-4">
        <p className="text-lg">Prices subject to change without notice</p>
        <p className="text-lg">Thank you for your order!</p>
      </div>
    </div>
  );
};

export default DriveThruMenu;