import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManagerAnalytics from './ManagerAnalytics';

const ManagerView = () => {
  const [employees, setEmployees] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newEmployee, setNewEmployee] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });
  const [showActive, setShowActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empResponse, menuResponse, ordersResponse] = await Promise.all([
        axios.get('https://coffeecatsproject3-0okd.onrender.com/api/employees', { withCredentials: true }),
        axios.get('https://coffeecatsproject3-0okd.onrender.com/api/menu-items', { withCredentials: true }),
        axios.get('https://coffeecatsproject3-0okd.onrender.com/api/orders', { withCredentials: true })
      ]);
      setEmployees(empResponse.data);
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

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/api/employees', { withCredentials: true });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/api/menu-items', { withCredentials: true });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://coffeecatsproject3-0okd.onrender.com/api/employees', 
        { name: newEmployee }, 
        { withCredentials: true }
      );
      setNewEmployee('');
      // Only fetch employees after adding one
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://coffeecatsproject3-0okd.onrender.com/api/menu-items', 
        newItem, 
        { withCredentials: true }
      );
      setNewItem({ name: '', price: '', category: '' });
      // Only fetch menu items after adding one
      fetchMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`https://coffeecatsproject3-0okd.onrender.com/api/employees/${id}`, {
        withCredentials: true
      });
      // Only fetch employees after deleting one
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const deleteMenuItem = async (name) => {
    try {
      await axios.delete(`https://coffeecatsproject3-0okd.onrender.com/api/menu-items/${name}`, {
        withCredentials: true
      });
      // Only fetch menu items after deleting one
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const toggleOrderActive = async (orderId, currentActive) => {
    try {
      await axios.put(
        `https://coffeecatsproject3-0okd.onrender.com/api/orders/${orderId}`,
        { isActive: !currentActive },
        { withCredentials: true }
      );
      // Only fetch orders after updating one
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
      // Only fetch orders after deleting one
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Filter orders based on isActive boolean
  const filteredOrders = orders.filter(order => order.isactive === showActive);

  const getTotalOrderValue = (items) => {
    return items.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.name === item.menu_item);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0).toFixed(2);
  };

  return (
    <div className="grid grid-cols-3 gap-6 p-4">
      {/* Orders Column */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Orders</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowActive(true)}
              className={`px-3 py-1 rounded text-sm ${
                showActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setShowActive(false)}
              className={`px-3 py-1 rounded text-sm ${
                !showActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No {showActive ? 'active' : 'completed'} orders
            </p>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="border p-3 rounded bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">Order #{order.id}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      by {order.employee_name || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-600">
                      {new Date(order.order_time).toLocaleString()}
                    </div>
                    <div className="text-blue-600 font-semibold">
                      ${getTotalOrderValue(order.items)}
                    </div>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-gray-700 flex justify-between">
                      <span>{item.menu_item} x{item.quantity}</span>
                      <span className="text-gray-500">
                        ${(menuItems.find(mi => mi.name === item.menu_item)?.price * item.quantity || 0).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => toggleOrderActive(order.id, order.isactive)}
                    className={`${
                      order.isactive
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white px-3 py-1 rounded text-sm`}
                  >
                    {order.isactive ? 'Complete' : 'Reactivate'}
                  </button>
                  {!order.isactive && (
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Employees Column */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Employees</h3>
        <form onSubmit={addEmployee} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmployee}
              onChange={(e) => setNewEmployee(e.target.value)}
              placeholder="Employee Name"
              className="border p-2 rounded flex-grow text-sm"
            />
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
              Add
            </button>
          </div>
        </form>
        <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {employees.map(emp => (
            <div key={emp.id} className="flex justify-between items-center border p-2 rounded">
              <span className="text-sm">{emp.name}</span>
              <button
                onClick={() => deleteEmployee(emp.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items Column */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Menu Items</h3>
        <form onSubmit={addMenuItem} className="space-y-2">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            placeholder="Item Name"
            className="border p-2 rounded block w-full text-sm"
          />
          <input
            type="number"
            step="0.01"
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
            placeholder="Price"
            className="border p-2 rounded block w-full text-sm"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            className="border p-2 rounded block w-full text-sm"
          >
            <option value="">Select Category</option>
            <option value="Hot Drink">Hot Drink</option>
            <option value="Iced Drink">Iced Drink</option>
            <option value="Food">Food</option>
            <option value="Seasonal">Seasonal</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 w-full text-sm">
            Add Menu Item
          </button>
        </form>
        <div className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto">
          {menuItems.map(item => (
            <div key={item.name} className="flex justify-between items-center border p-2 rounded">
              <div className="text-sm">
                <span className="font-bold">{item.name}</span>
                <span className="mx-2">${item.price}</span>
                <span className="text-gray-500">{item.category}</span>
              </div>
              <button
                onClick={() => deleteMenuItem(item.name)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <ManagerAnalytics 
          orders={orders} 
          menuItems={menuItems} 
        />
      </div>
    </div>
  );
};

export default ManagerView;