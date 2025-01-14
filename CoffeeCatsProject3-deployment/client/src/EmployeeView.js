import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderManagementView = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showActive, setShowActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
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

  const getOrderAge = (orderTime) => {
    const diffInMinutes = Math.floor((currentTime - new Date(orderTime)) / (1000 * 60));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return { hours, minutes, totalMinutes: diffInMinutes };
  };

  const getBorderColor = (orderTime) => {
    const { totalMinutes } = getOrderAge(orderTime);
    // Transition from green (0 minutes) to yellow (15 minutes) to red (30+ minutes)
    const maxMinutes = 30;
    const normalizedTime = Math.min(totalMinutes / maxMinutes, 1);
    
    if (normalizedTime <= 0.5) {
      // Green to Yellow (0 to 15 minutes)
      const green = 255;
      const red = Math.floor(255 * (normalizedTime * 2));
      return `rgb(${red}, ${green}, 0)`;
    } else {
      // Yellow to Red (15 to 30 minutes)
      const factor = (normalizedTime - 0.5) * 2;
      const green = Math.floor(255 * (1 - factor));
      return `rgb(255, ${green}, 0)`;
    }
  };

  const getTimeDisplay = (orderTime) => {
    const { hours, minutes } = getOrderAge(orderTime);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const filteredOrders = orders.filter(order => order.isactive === showActive);

  const getTotalOrderValue = (items) => {
    return items.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.name === item.menu_item);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Order Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowActive(true)}
              className={`px-4 py-2 rounded ${
                showActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Active Orders
            </button>
            <button
              onClick={() => setShowActive(false)}
              className={`px-4 py-2 rounded ${
                !showActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Completed Orders
            </button>
          </div>
        </div>
        
        <div className="space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">
                No {showActive ? 'active' : 'completed'} orders
              </p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id} 
                className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                style={{
                  border: showActive ? `4px solid ${getBorderColor(order.order_time)}` : '1px solid #e5e7eb',
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-lg font-semibold">Order #{order.id}</span>
                    <span className="ml-2 text-gray-500">
                      by {order.employee_name || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600">
                      {new Date(order.order_time).toLocaleString()}
                    </div>
                    {showActive && (
                      <div className="font-bold" style={{ color: getBorderColor(order.order_time) }}>
                        Time elapsed: {getTimeDisplay(order.order_time)}
                      </div>
                    )}
                    <div className="text-blue-600 font-semibold text-lg">
                      ${getTotalOrderValue(order.items)}
                    </div>
                  </div>
                </div>
                
                <ul className="mt-4 space-y-2 border-t border-b py-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="font-medium">{item.menu_item} × {item.quantity}</span>
                      <span className="text-gray-600">
                        ${(menuItems.find(mi => mi.name === item.menu_item)?.price * item.quantity || 0).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => toggleOrderActive(order.id, order.isactive)}
                    className={`${
                      order.isactive
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white px-4 py-2 rounded-md transition-colors`}
                  >
                    {order.isactive ? 'Complete Order' : 'Reactivate Order'}
                  </button>
                  {!order.isactive && (
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Delete Order
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagementView;