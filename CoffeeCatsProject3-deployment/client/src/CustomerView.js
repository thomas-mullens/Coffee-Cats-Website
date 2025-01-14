import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { FaTrash, FaPlus, FaMinus, FaBlackTie } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
import Carousel from "react-spring-3d-carousel";
import { config } from '@react-spring/core'
import './customerView.css'; // Add a CSS file for styles

function importAllImages(requireContext) {
  let images = {};
  requireContext.keys().forEach((item) => { 
    images[item.replace('./', '')] = requireContext(item); 
  });
  return images;
}

const images = importAllImages(require.context('./images', false, /\.(jpg)$/)); //this only gets the jpg files. look up require.context for the other types of images but lets try to keep them jpg


const Card = ({ item, image, onAddToCart, onRemoveFromCart, onClick, isCenter, highContrast, textSize}) => {
  const CARDSIZE = 250 + 25 * (textSize-1);
  const CARDWIDTH = isCenter ? CARDSIZE * 2 + 25 * (textSize-1) : CARDSIZE * 2 + 25 * (textSize-1);
  const CARDBORDERRADIUS = CARDSIZE * 0.1;

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

  return (
    <div 
      onClick={onClick}
      className={`cardContainer border rounded-lg shadow-md transition duration-300 cursor-pointer ${
        highContrast
          ? 'bg-black border-white'
          : 'bg-white border-green-800 hover:bg-green-50'
      }`}
      style={{
        height: CARDSIZE,
        width: CARDWIDTH,
        borderRadius: CARDBORDERRADIUS,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        transform: isCenter ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.5s ease-in-out'
      }}
    >
      <div className="titleContainer w-full flex justify-between items-center mb-4">
        <div id="title" className={`${fontSize.text2} font-bold ${
          highContrast 
            ? 'text-white'
            : 'text-green-900'
        }`}>
          {item.name} {item.category === 'Food' && <span className={`${
            highContrast
              ? 'text-white'
              : 'text-red-500'
          }`}>🍴</span>}{item.category === 'Seasonal' && <span className={`${
            highContrast
              ? 'text-white'
              : 'text-red-500'
          }`}>🍁</span>} {item.category === 'Hot Drink' && <span className={`${
            highContrast
              ? 'text-white'
              : 'text-red-500'
          }`}>☕</span>} {item.category === 'Cold Drink' && <span className={`${
            highContrast
              ? 'text-white'
              : 'text-red-500'
          }`}>🥤</span>} {item.category === 'Both' && <span className={`${
            highContrast
              ? 'text-white'
              : 'text-red-500'
          }`}>☯</span>}
        </div>
        <div className={`font-semibold ${
          highContrast
            ? 'text-white'
            : 'text-green-700'
        }`}>
          ${item.price}
        </div>
      </div>

      <div 
        className="cardImgContainer mb-4"
        style={{
          height: CARDSIZE * 0.36,
          width: CARDWIDTH * 0.2,
          borderRadius: CARDBORDERRADIUS,
        }}
      >
        {image && (
          <img
            src={image}
            alt={item.name}
            style={{objectPosition: 'center', objectFit: 'cover', width: '100%', height: '100%'}}
          />
        )}
      </div>
      <div className="cardTextContainer text-center">
        <p className={`${
          highContrast
            ? 'text-white'
            : 'text-gray-600'
        }`}>{item.category}</p>
      </div>
      <div className="cardActionContainer flex justify-between w-full mt-4">
        <div className="flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
            className={` text-white px-3 py-1 rounded-full transition duration-300 mr-2 border ${
              highContrast
                ? 'bg-black border-white'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            <FaPlus/>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemoveFromCart(item.name); }}
            className={`text-white px-3 py-1 rounded-full transition duration-300 mr-2 border ${
              highContrast
                ? 'bg-black border-white'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            <FaMinus/>
          </button>
        </div>
      </div>
    </div>
  );
};


const CustomerView = ({ highContrast, textSize }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [goToSlide, setGoToSlide] = useState(0);
  const [offsetRadius] = useState(2);
  const [showCart, setShowCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmRemoveAll, setShowConfirmRemoveAll] = useState(false);
  const [shouldCycle, setShouldCycle] = useState(true);
  const [isCycling, setIsCycling] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState(null);

  const cycleTimeoutRef = useRef(null);
  const carouselIntervalRef = useRef(null);
  const isManualInteractionRef = useRef(false);


  // Fetch menu items and orders
  const [showTotalPrice, setShowTotalPrice] = useState(false);
  const isDragging = useRef(false);

// Modify fetch functions to handle empty states and errors
useEffect(() => {
  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/api/menu-items', {
        withCredentials: true,
        headers: {
          // Add any required authentication headers
          'Content-Type': 'application/json'
        }
      });
      
      // Add a check for empty data
      if (response.data && response.data.length > 0) {
        setMenuItems(response.data);
      } else {
        console.warn('No menu items found');
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Handle specific error cases
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/api/orders', { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.length > 0) {
        setOrders(response.data);
      } else {
        console.warn('No orders found');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access
      }
    }
  };

  fetchMenuItems();
  fetchOrders();
}, []);

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

const showConfirmationMessage = (message) => {
  setConfirmMessage(message);
  setTimeout(() => {
    setConfirmMessage(null);
  }, 2000);
};

  // Cart Management Functions
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.name === item.name);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    showConfirmationMessage(`${item.name} added to cart`);
  };

  const removeOneFromCart = useCallback((itemName) => {
    setCart(prevCart => 
      prevCart
        .map((item) => {
          if (item.name === itemName) {
            const newQuantity = item.quantity - 1;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item) => item !== null)
    );
  }, []);

  const removeAllFromCart = useCallback((itemName) => {
    setCart(prevCart => prevCart.filter((item) => item.name !== itemName));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setShowConfirmRemoveAll(false);
  }, []);

  const submitOrder = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await axios.post('https://coffeecatsproject3-0okd.onrender.com/api/orders', { 
        items: cart 
      }, { 
        withCredentials: true 
      });
      setOrderPlaced(true);
      setCart([]);
      setTimeout(() => setOrderPlaced(false), 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [cart]);

  // Memoized filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      if (filter === 'All') return true;
      if (filter === 'Both') return item.category === 'Both';
      if (filter === 'Hot') return item.category === 'Hot Drink' || item.category === 'Both';
      if (filter === 'Cold') return item.category === 'Cold Drink' || item.category === 'Both';
      if (filter === 'Seasonal') return item.category === 'Seasonal';
      return false;
    });
  }, [menuItems, filter]);

  // // Fetch menu items and orders
  // useEffect(() => {
  //   const fetchMenuItems = async () => {
  //     try {
  //       const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/api/orders', { 
  //         withCredentials: true 
  //       });
  //       setOrders(response.data);
  //     } 
  //     catch (error) {
  //       console.error('Error fetching menu items:', error);
  //     }
  //   };
  //   fetchMenuItems();
  // }, []);

  // Cycling logic with useCallback to prevent unnecessary re-renders
  const startCycling = useCallback(() => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }

    carouselIntervalRef.current = setInterval(() => {
      if (!isManualInteractionRef.current) {
        setGoToSlide(prevSlide => (prevSlide + 1) % filteredMenuItems.length);
      }
    }, 3000);
  }, [filteredMenuItems.length]);

  const handleSlideClick = useCallback((index) => {
    isManualInteractionRef.current = true;
  
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }
    if (cycleTimeoutRef.current) {
      clearTimeout(cycleTimeoutRef.current);
    }
  
    setGoToSlide(index);
    setShouldCycle(false);
  
    cycleTimeoutRef.current = setTimeout(() => {
      isManualInteractionRef.current = false;
      setShouldCycle(true);
    }, 3000);
  }, []); // No dependencies needed if refs are used

  // Handle Category Click
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
    setFilter(category);
    
    // Reset slide to first item when category changes
    setGoToSlide(0);
    
    // Optional: trigger cycling through slides
    setShouldCycle(true);
    setTimeout(() => setShouldCycle(true), 100);
  }, []);

  // Carousel cycling effect
  useEffect(() => {
    if (shouldCycle && !isCycling) {
      startCycling();
    }

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
    };
  }, [shouldCycle, isCycling, startCycling]);


  const MemoizedCard = React.memo(Card);

  const getItemImage = useCallback((itemName) => {
    const formattedName = itemName.replace(/\s+/g, '_') + '.jpg';
    return images[formattedName] || null;
  }, []);
  

  const slides = useMemo(() => {
  
    if (filteredMenuItems.length === 0) {
      return []; // Return empty array if no items
    }
    
    return filteredMenuItems.map((item, index) => ({
      key: item.name,
      content: (
        <MemoizedCard 
          key={item.name}
          item={item} 
          image={getItemImage(item.name)}
          onAddToCart={addToCart}
          onRemoveFromCart={removeOneFromCart}
          onClick={() => handleSlideClick(index)}
          isCenter={index === goToSlide}
          highContrast={highContrast}
          textSize={textSize}
        />
      )
    }));
  }, [filteredMenuItems, goToSlide, addToCart, removeOneFromCart, handleSlideClick]);



  const CartButtons = () => {
    const totalItemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    return (
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
        <button
          onClick={() => setShowCart(!showCart)}
          className={`text-white p-3 rounded-full shadow-md transition duration-300 border ${
            highContrast
              ? 'bg-black border-white'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          <FiShoppingCart size={24} />
          {totalItemCount > 0 && (
            <span className={`absolute -top-2 -right-2 text-white rounded-full px-2 py-1 ${fontSize.textLG} border ${
              highContrast
                ? 'bg-black border-white'
                : 'bg-red-500 border-red-500'
            }`}>
              {totalItemCount}
            </span>
          )}
        </button>
        <p className={`font-bold ${
          highContrast
            ? 'text-white'
            : 'text-green-700'
        }`}>${totalPrice}</p>
      </div>
    );
  };

  return (
    
    <div className={`customer-view flex flex-col ${fontSize.textBase}`} style={{ backgroundColor: highContrast ? '#000000' : '#f1f3f5', color: highContrast ? '#ffffff' : '#3e2723', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div className={`menu-container flex justify-between items-center mb-6`}>
        <h2 className={`${fontSize.text4}`}
        style={{ fontWeight: 'bold', color: highContrast ? '#ffffff' : '#4e342e' }}>Menu</h2>
        <div className="filter-buttons flex gap-4">
          <button
            onClick={() => handleCategoryClick('All')}
            className={`filter-button px-6 py-3 rounded-full shadow-md transition duration-300 border ${
              highContrast 
                ? selectedCategory === 'All' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'
                : selectedCategory === 'All' ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleCategoryClick('Hot')}
            className={`filter-button px-6 py-3 rounded-full shadow-md transition duration-300 border ${
              highContrast 
                ? selectedCategory === 'Hot' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'
                : selectedCategory === 'Hot' ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Hot Drinks
          </button>
          <button
            onClick={() => handleCategoryClick('Cold')}
            className={`filter-button px-6 py-3 rounded-full shadow-md transition duration-300 border ${
              highContrast 
                ? selectedCategory === 'Cold' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'
                : selectedCategory === 'Cold' ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Cold Drinks
          </button>
          <button
            onClick={() => handleCategoryClick('Both')}
            className={`filter-button px-6 py-3 rounded-full shadow-md transition duration-300 border ${
              highContrast 
                ? selectedCategory === 'Both' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'
                : selectedCategory === 'Both' ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Both
          </button>
          <button
            onClick={() => handleCategoryClick('Seasonal')}
            className={`filter-button px-6 py-3 rounded-full shadow-md transition duration-300 border ${
              highContrast 
                ? selectedCategory === 'Seasonal' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'
                : selectedCategory === 'Seasonal' ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Seasonal
          </button>
        </div>

      </div>
      
    
      <div className="relative overflow-y-visible" style={{ minHeight: 'calc(100vh - 180px)', height: 'auto' }}>
        <CartButtons />

        {filteredMenuItems.length === 0 ? (
          <div className={`text-center mt-10 w-full ${fontSize.textBase} ${
            highContrast
              ? 'text-white'
              : 'text-gray-500'
          }`}>
            No menu items available
          </div>
        ) : (
          <>
            <div className="mb-8" style={{ width: '100%', height: '500px', position: 'relative' }}>
              <Carousel
                slides={slides}
                goToSlide={goToSlide}
                offsetRadius={offsetRadius}
                showNavigation={false}
                config={config.gentle}
                onClick={(index) => handleSlideClick(index)}
              />
            </div>

            <div className="menu-grid mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMenuItems.map((item) => (
                  <div 
                    key={item.name} 
                    className={`menu-item border p-4 rounded-lg transition duration-300 cursor-pointer ${
                      highContrast
                        ? 'bg-black border-white'
                        : 'bg-white border-green-800 hover:bg-green-50 shadow-md'
                    }`}
                    onClick={() => addToCart(item)}
                  >
                    <h3 className={`font-bold ${fontSize.textLG} ${highContrast ? 'text-white' : 'text-black'}`}>{item.name}</h3>
                    <p className={`${highContrast ? 'text-white' : 'text-green-700'}`}>${item.price}</p>
                    <p className={`${highContrast ? 'text-white' : 'text-gray-600'}`}>{item.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

    {confirmMessage && (
        <div 
          className={`fixed bottom-4 text-white p-4 rounded-lg shadow-lg transition-opacity duration-300 border ${
            highContrast
              ? 'bg-black border-white'
              : 'bg-green-500'
          }`}
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {confirmMessage}
        </div>
      )}

      {showCart && (
        <div className={`fixed right-0 top-0 h-full w-1/4 shadow-lg z-20 p-4 border ${
          highContrast
            ? 'bg-black'
            : 'bg-white'
        }`}>
          <h3 className={`${fontSize.textXL} font-bold mb-4`}>Your Cart</h3>
          {cart.map((item) => (
            <div key={item.name} className="flex items-center justify-between mb-2">
                <span className="flex-1">{item.name}</span>
                <div className="flex items-center space-x-2">
                    <button onClick={() => addToCart(item)} className={`rounded-full p-2 transition border ${
                      highContrast
                        ? 'bg-black border-white'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`} aria-label="Add one item">
                        <FaPlus />
                    </button>
                    <span className={`${fontSize.textLG}`}>{item.quantity}x</span>
                    <button onClick={() => removeOneFromCart(item.name)} className={`rounded-full p-2 transition border ${
                      highContrast
                        ? 'bg-black border-white'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`} aria-label="Remove one item">
                        <FaMinus />
                    </button>
                    <button onClick={() => removeAllFromCart(item.name)} className={`rounded-full p-2 text-white transition border ${
                      highContrast
                        ? 'bg-black border-white'
                        : 'bg-red-500 hover:bg-red-600'
                    }`} aria-label="Remove item">
                        <FaTrash />
                    </button>
                </div>
            </div>
          ))}
          
          {cart.length > 0 && (
            <div className="mt-4">
              <div className="text-right font-bold mb-2">
                Tax: ${(cart.reduce((total, item) => total + item.price * item.quantity, 0) * 0.0625).toFixed(2)}
              </div>
              <div className="text-right font-bold mb-2">
                Total: ${(cart.reduce((total, item) => total + item.price * item.quantity, 0) * 1.0625).toFixed(2)}
              </div>
              <button 
                onClick={submitOrder}
                disabled={isSubmitting}
                className={`w-full text-white py-2 rounded-full transition duration-300 border ${
                  highContrast
                    ? 'bg-black border-white'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
              <button 
                onClick={() => setShowConfirmRemoveAll(true)}
                className={`w-full text-white py-2 rounded-full transition duration-300 border ${
                  highContrast
                    ? 'bg-black border-white'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showConfirmRemoveAll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className={`p-6 rounded-lg border ${
            highContrast
              ? 'bg-black border-white'
              : 'bg-white'
          }`}>
            <p className="mb-4">Are you sure you want to remove all items from the cart?</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowConfirmRemoveAll(false)}
                className={`px-4 py-2 rounded-full transition duration-300 border ${
                  highContrast
                    ? 'bg-black border-white text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={clearCart}
                className={`px-4 py-2 rounded-full transition duration-300 border ${
                  highContrast
                    ? 'bg-black border-white'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}

      {orderPlaced && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className={`p-6 rounded-lg border ${
            highContrast
              ? 'bg-black border-white'
              : 'bg-white'
          }`}>
            <p className={`font-bold ${
              highContrast
                ? 'text-white'
                : 'text-green-600'
            }`}>Order placed successfully!</p>
          </div>
        </div>
      )}

      {showCart && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 background-overview z-10"
          onClick={() => setShowCart(false)}
        />
      )}
    </div>
  );
};

export default CustomerView;
