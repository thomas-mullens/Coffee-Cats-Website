import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CashierView = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showActive, setShowActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      fetchOrders(); // Regularly refresh orders
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [menuResponse, ordersResponse] = await Promise.all([
        axios.get('https://coffeecatsproject3-0okd.onrender.com/api/menu-items', { withCredentials: true }),
        axios.get('https://coffeecatsproject3-0okd.onrender.com/api/orders', { withCredentials: true })
      ]);
      setMenuItems(menuResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/api/orders', { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Cart Management Functions
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.name === item.name);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.name === item.name
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeOneFromCart = (itemName) => {
    const updatedCart = cart
      .map((item) => {
        if (item.name === itemName) {
          const newQuantity = item.quantity - 1;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      })
      .filter((item) => item !== null);
    setCart(updatedCart);
  };

  const removeAllFromCart = (itemName) => {
    setCart(cart.filter((item) => item.name !== itemName));
  };

  // Order Management Functions
  const submitOrder = async () => {
    try {
      await axios.post('https://coffeecatsproject3-0okd.onrender.com/api/orders', { 
        items: cart 
      }, { 
        withCredentials: true 
      });
      setCart([]);
      setOrderPlaced(true);
      fetchOrders();
      setTimeout(() => setOrderPlaced(false), 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  const toggleOrderActive = async (orderId, currentActive) => {
    try {
      await axios.put(
        `https://coffeecatsproject3-0okd.onrender.com/api/orders/${orderId}`,
        { isActive: !currentActive },
        { withCredentials: true }
      );
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`https://coffeecatsproject3-0okd.onrender.com/api/orders/${id}`, {
        withCredentials: true
      });
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Utility Functions
  const getBorderColor = (orderTime) => {
    const diffInMinutes = Math.floor((currentTime - new Date(orderTime)) / (1000 * 60));
    const maxMinutes = 30;
    const normalizedTime = Math.min(diffInMinutes / maxMinutes, 1);
    
    if (normalizedTime <= 0.5) {
      const green = 255;
      const red = Math.floor(255 * (normalizedTime * 2));
      return `rgb(${red}, ${green}, 0)`;
    } else {
      const factor = (normalizedTime - 0.5) * 2;
      const green = Math.floor(255 * (1 - factor));
      return `rgb(255, ${green}, 0)`;
    }
  };

  const getTimeDisplay = (orderTime) => {
    const diffInMinutes = Math.floor((currentTime - new Date(orderTime)) / (1000 * 60));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTotalOrderValue = (items) => {
    return items.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.name === item.menu_item);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0).toFixed(2);
  };

  const filteredOrders = orders.filter(order => order.isactive === showActive);

  return (
    <div className="h-screen flex">
      {/* Left Side - Order Creation */}
      <div className="w-1/2 p-4 border-r overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">New Order</h2>
        
        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {menuItems.map((item) => (
            <div 
              key={item.name}
              onClick={() => addToCart(item)}
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">${item.price}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
            </div>
          ))}
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-xl font-bold mb-4">Current Order</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">×{item.quantity}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addToCart(item)} className="p-1 bg-green-500 text-white rounded">+</button>
                    <button onClick={() => removeOneFromCart(item.name)} className="p-1 bg-yellow-500 text-white rounded">-</button>
                    <button onClick={() => removeAllFromCart(item.name)} className="p-1 bg-red-500 text-white rounded">×</button>
                  </div>
                </div>
              ))}
              <button 
                onClick={submitOrder} 
                className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4 hover:bg-blue-600"
              >
                Submit Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Order Management */}
      <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Order Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowActive(true)}
              className={`px-3 py-1 rounded ${showActive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Active
            </button>
            <button
              onClick={() => setShowActive(false)}
              className={`px-3 py-1 rounded ${!showActive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-lg shadow-sm"
              style={{
                border: showActive ? `4px solid ${getBorderColor(order.order_time)}` : '1px solid #e5e7eb',
              }}
            >
              <div className="flex justify-between">
                <span className="font-bold">Order #{order.id}</span>
                <span className="text-gray-500">{getTimeDisplay(order.order_time)}</span>
              </div>
              <div className="mt-2 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.menu_item} × {item.quantity}</span>
                    <span>${(menuItems.find(mi => mi.name === item.menu_item)?.price * item.quantity || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="font-bold">${getTotalOrderValue(order.items)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleOrderActive(order.id, order.isactive)}
                    className={`px-3 py-1 rounded text-white ${order.isactive ? 'bg-green-500' : 'bg-blue-500'}`}
                  >
                    {order.isactive ? 'Complete' : 'Reactivate'}
                  </button>
                  {!order.isactive && (
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Placed Popup */}
      {orderPlaced && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-green-600">Order successfully placed!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierView;