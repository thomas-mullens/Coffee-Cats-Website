import React, { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';

const ManagerAnalytics = memo(({ orders = [], menuItems = [] }) => {
  const analytics = useMemo(() => {
    if (!orders?.length || !menuItems?.length) {
      return {
        revenueData: [],
        popularItems: [],
        categoryData: [],
        hourlyData: [],
        productUsage: [],
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0
      };
    }

    // Create a map of menu item details
    const menuItemDetails = Object.fromEntries(
      menuItems.map(item => [item.name, { price: Number(item.price), category: item.category }])
    );

    // Initialize data structures
    const revenueByDay = {};
    const itemPopularity = {};
    const categoryRevenue = {};
    const hourlyRevenue = Array(24).fill(0);
    const productUsageMap = {};

    let totalRevenue = 0;

    // Process orders
    orders.forEach(order => {
      if (!order?.items?.length) return;
      
      const orderDate = new Date(order.order_time);
      const date = orderDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      const hour = orderDate.getHours();

      let orderTotal = 0;
      
      // Safely process each item in the order
      order.items.forEach(item => {
        // Skip if item or menu_item is null/undefined
        if (!item || !item.menu_item) return;

        const itemDetails = menuItemDetails[item.menu_item] || { price: 0, category: 'Unknown' };
        const quantity = Number(item.quantity) || 0;
        const itemTotal = itemDetails.price * quantity;
        
        // Only process valid items
        if (quantity > 0) {
          itemPopularity[item.menu_item] = (itemPopularity[item.menu_item] || 0) + quantity;
          categoryRevenue[itemDetails.category] = (categoryRevenue[itemDetails.category] || 0) + itemTotal;
          
          // Split menu item name and take first word as base ingredient
          // Only process if menu_item is a non-empty string
          if (typeof item.menu_item === 'string' && item.menu_item.trim()) {
            const baseIngredient = item.menu_item.split(' ')[0];
            if (baseIngredient) {
              productUsageMap[baseIngredient] = (productUsageMap[baseIngredient] || 0) + quantity;
            }
          }
          
          orderTotal += itemTotal;
        }
      });

      if (orderTotal > 0) {
        revenueByDay[date] = (revenueByDay[date] || 0) + orderTotal;
        hourlyRevenue[hour] += orderTotal;
        totalRevenue += orderTotal;
      }
    });

    return {
      revenueData: Object.entries(revenueByDay)
        .map(([date, revenue]) => ({
          date,
          revenue: Number(revenue.toFixed(2))
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7),
      popularItems: Object.entries(itemPopularity)
        .map(([name, quantity]) => ({
          name: name.length > 15 ? name.substring(0, 12) + '...' : name,
          quantity
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5),
      categoryData: Object.entries(categoryRevenue)
        .map(([category, revenue]) => ({
          category,
          revenue: Number(revenue.toFixed(2))
        }))
        .sort((a, b) => b.revenue - a.revenue),
      hourlyData: hourlyRevenue.map((revenue, hour) => ({
        hour: `${hour}:00`,
        revenue: Number(revenue.toFixed(2))
      })),
      productUsage: Object.entries(productUsageMap)
        .map(([product, quantity]) => ({
          product,
          quantity
        }))
        .sort((a, b) => b.quantity - a.quantity),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      averageOrderValue: orders.length ? Number((totalRevenue / orders.length).toFixed(2)) : 0
    };
  }, [orders, menuItems]);

  if (!orders?.length || !menuItems?.length) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">No data available for analytics</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 w-full">
      <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold">${analytics.totalRevenue}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-2xl font-bold">{analytics.totalOrders}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
          <p className="text-2xl font-bold">${analytics.averageOrderValue}</p>
        </div>
      </div>

      {/* Main Reports - Full Width */}
      <div className="space-y-4">
        {/* X Report */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">X Report - Daily Revenue Trends</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Y Report */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Y Report - Category Performance</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Z Report */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Z Report - Hourly Revenue Distribution</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Charts - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Popular Items */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Top 5 Popular Items</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.popularItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10B981" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Usage */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Product Usage Analysis</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.productUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="product"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#6366F1" name="Units Used" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ManagerAnalytics;