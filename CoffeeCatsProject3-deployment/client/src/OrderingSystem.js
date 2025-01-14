// frontend/src/components/OrderingSystem.js
import React, { useState, useEffect } from 'react'; // part of react's state management system
import axios from 'axios';                          // for making HTTP requests to the backend

const OrderingSystem = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/api/menu-items', {
        withCredentials: true 
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/api/orders', { 
        withCredentials: true 
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

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

  const removeFromCart = (itemName) => {
    setCart(cart.filter(item => item.name !== itemName));
  };

  const submitOrder = async () => {
    try {
      await axios.post('https://coffeecatsproject3-0okd.onrender.com/api/orders', { 
        items: cart 
      }, { 
        withCredentials: true 
      });
      setCart([]);
      fetchOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div>
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <div key={item.name} className="border p-4 rounded shadow">
              <h3 className="font-bold">{item.name}</h3>
              <p>${item.price}</p>
              <p className="text-gray-600">{item.category}</p>
              <button
                onClick={() => addToCart(item)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Cart</h2>
        {cart.map((item) => (
          <div key={item.name} className="border p-4 rounded mb-2 flex justify-between">
            <div>
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button
              onClick={() => removeFromCart(item.name)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Remove
            </button>
          </div>
        ))}
        {cart.length > 0 && (
          <button
            onClick={submitOrder}
            className="w-full bg-green-500 text-white px-4 py-2 rounded mt-4"
          >
            Submit Order
          </button>
        )}

        <h2 className="text-xl font-bold mt-8 mb-4">Order History</h2>
        {orders.map((order) => (
          <div key={order.id} className="border p-4 rounded mb-2">
            <p className="font-bold">Order #{order.id}</p>
            <p>Date: {new Date(order.order_time).toLocaleString()}</p>
            <div className="mt-2">
              {order.items.map((item, index) => (
                <div key={index} className="text-sm">
                  {item.quantity}x {item.menu_item} - ${(item.price * item.quantity).toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderingSystem;