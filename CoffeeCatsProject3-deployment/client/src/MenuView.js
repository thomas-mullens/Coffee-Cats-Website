import React, { useState, useEffect } from 'react';
import Americano from './images/Americano.jpg';
import Cappuccino from './images/Cappuccino.jpg';
import Chai_Latte from './images/Chai_Latte.jpg';
import Earl_Grey_Tea from './images/Earl_Grey_Tea.jpg';
import Espresso from './images/Espresso.jpg';
import Green_Tea from './images/Green_Tea.jpg';
import Latte from './images/Latte.jpg';
import Macchiato from './images/Macchiato.jpg';
import Mocha from './images/Mocha.jpg';
import Frappuccino from './images/Frappuccino.jpg';
import Iced_Coffee from './images/Iced_Coffee.jpg';
import Iced_Latte from './images/Iced_Latte.jpg';
import Iced_Tea from './images/Iced_Tea.jpg';
import Smoothie from './images/Smoothie.jpg';
import Bagel from './images/Bagel.jpg';
import Salad from './images/Salad.jpg';
import Muffin from './images/Muffin.jpg';
import Sandwich from './images/Sandwich.jpg';
import Hot_Chocolate from './images/Hot_Chocolate.jpg';
import Chicken_McNugget from './images/Chicken_McNugget.jpg';
import Croissant from './images/Croissant.jpg';


const DriveThruMenu = ({ highContrast, textSize }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeBoxIndex, setActiveBoxIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://coffeecatsproject3-0okd.onrender.com/api/menu-items')
      .then(response => response.json())
      .then(data => {
        setMenuItems(data);
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
        setIsLoading(false);
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

  const image = (itemName) => {
    if (itemName === "Americano") {
      return Americano;
    } else if (itemName === "Cappuccino") {
      return Cappuccino;
    } else if (itemName === "Chai Latte") {
      return Chai_Latte;
    } else if (itemName === "Earl Grey Tea") {
      return Earl_Grey_Tea;
    } else if (itemName === "Espresso") {
      return Espresso;
    } else if (itemName === "Green Tea") {
      return Green_Tea;
    } else if (itemName === "Latte") {
      return Latte;
    } else if (itemName === "Macchiato") {
      return Macchiato;
    } else if (itemName === "Mocha") {
      return Mocha;
    } else if (itemName === "Frappuccino") {
      return Frappuccino;
    } else if (itemName === "Iced Coffee") {
      return Iced_Coffee;
    } else if (itemName === "Iced Latte") {
      return Iced_Latte;
    } else if (itemName === "Iced Tea") {
      return Iced_Tea;
    } else if (itemName === "Smoothie") {
      return Smoothie;
    } else if (itemName === "Bagel") {
      return Bagel;
    } else if (itemName === "Croissant") {
      return Croissant;
    } else if (itemName === "Muffin") {
      return Muffin;
    } else if (itemName === "Salad") {
      return Salad;
    } else if (itemName === "Sandwich") {
      return Sandwich;
    } else if (itemName === "Hot Chocolate") {
      return Hot_Chocolate;
    } else if (itemName === "Chicken McNugget") {
      return Chicken_McNugget;
    }
  }

  const getTextSize = () => {
    if (textSize === 2) {
      return {
        text5: 'text-6xl',
        text4: 'text-5xl',
        text3: 'text-4xl',
        text2: 'text-3xl',
        textXL: 'text-2xl',
        textLG: 'text-xl',
        textBase: 'text-lg',
        textSM: 'text-base',
        textXS: 'text-sm',
      };
    } else if (textSize === 3) {
      return {
        text5: 'text-7xl',
        text4: 'text-6xl',
        text3: 'text-5xl',
        text2: 'text-4xl',
        textXL: 'text-3xl',
        textLG: 'text-2xl',
        textBase: 'text-xl',
        textSM: 'text-lg',
        textXS: 'text-base',
      };
    } else if (textSize === 4) {
      return {
        text5: 'text-8xl',
        text4: 'text-7xl',
        text3: 'text-6xl',
        text2: 'text-5xl',
        textXL: 'text-4xl',
        textLG: 'text-3xl',
        textBase: 'text-2xl',
        textSM: 'text-xl',
        textXS: 'text-lg',
      };
    }  else {
      return {
        text5: 'text-5xl',
        text4: 'text-4xl',
        text3: 'text-3xl',
        text2: 'text-2xl',
        textXL: 'text-xl',
        textLG: 'text-lg',
        textBase: 'text-base',
        textSM: 'text-sm',
        textXS: 'text-xs',
      };
    }
  };

  const fontSize = getTextSize();

  if (isLoading) {
    return (
      <div className={`w-full max-w-7xl mx-auto p-6 flex items-center justify-center min-h-screen  ${
        highContrast
          ? 'bg-black'
          : 'bg-[#eae4d3]'
      }`}>
        <p className={`${fontSize.text2} ${
          highContrast
            ? 'text-white'
            : 'text-[#3e2723]'
        }`}>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className={`w-full p-6 min-h-screen ${fontSize.textBase} ${
      highContrast
        ? 'bg-black text-black'
        : 'bg-[#eae4d3] text-[#3e2723]'
    }`}>
      <div className="text-center mb-8">
        <h1 className={`${fontSize.text5} font-bold mb-2  ${
          highContrast
            ? 'text-white'
            : 'text-[#4e342e]'
        }`}>DRIVE-THRU MENU</h1>
        <p className={`${fontSize.textXL}  ${
          highContrast
            ? 'text-white'
            : 'text-[#3e2723]'
        }`}>Please Order When Ready</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {categories.map((category) => (
          <div key={category} className={`p-4 rounded-xl ${
            highContrast
              ? 'bg-black'
              : 'bg-[#d7bfa6]'
          }`}>
            <h2 className={`${fontSize.text2} font-bold mb-4 pb-2  border-b-2 ${
              highContrast
                ? 'text-white bg-black'
                : 'text-[#3e2723] border-[#3e2723]'
            }`}>
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
                      className={`rounded-xl p-3 transition-all duration-500 ease-in-out ${
                        highContrast
                          ? isActive
                            ? 'scale-105 border-2 border-white text-white bg-black'
                            : 'text-white bg-black border-transparent'
                          : isActive
                            ? 'shadow-lg scale-105 border-2 bg-#e7d3c1 border-[#3e2723] text-black'
                            : 'shadow-md hover:bg-green-50 bg-#fff border-transparent text-black'
                      }`}
                    >
                      <div className="flex flex-col mb-2">
                        <span className={`${fontSize.textLG} font-bold truncate ${
                          highContrast
                            ? 'text-white'
                            : 'text-[#3e2723]'
                        }`}>{item.name}</span>
                        <span className={`${fontSize.textLG} ${
                          highContrast
                            ? 'text-white'
                            : 'text-[#3e2723]'
                        }`}>${Number(item.price).toFixed(2)}</span>
                      </div>
                      
                      <div className={`transition-all duration-500 ${
                        isActive ? 'h-32' : 'h-20'
                      }`}>
                        <div className="h-20 rounded-lg mb-2">
                          <img
                            src={image(item.name)}
                            alt={item.name}
                            className="h-full object-cover rounded-lg"
                          />
                        </div>
                        {isActive && (
                          <p className={`${fontSize.textSM} mt-2 transition-opacity duration-500 line-clamp-2 ${
                            highContrast
                              ? 'text-white'
                              : 'text-[#3e2723]'
                          }`}>
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

      <div className={`text-center ${fontSize.textSM} pt-4 border-t-2 border-[#3e2723] ${
        highContrast
          ? 'border-white'
          : 'border-[#3e2723]'
      }`}>
        <p className={`${fontSize.textLG} text-[#3e2723] ${
          highContrast
            ? 'text-white'
            : 'text-[#3e2723]'
        }`}>Prices subject to change without notice</p>
        <p className={`${fontSize.textLG} text-[#3e2723] ${
          highContrast
            ? 'text-white'
            : 'text-[#3e2723]'
        }`}>Thank you for your order!</p>
      </div>
    </div>
  );
};

export default DriveThruMenu;