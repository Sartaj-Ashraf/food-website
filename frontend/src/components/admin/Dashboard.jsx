"use client"
import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, Package, Users, Clock, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [productData, setProductData] = useState({
    name: "Walnut Fudge",
    price: 50,
    stock: 450,
    todaySold: 205,
    revenue: 19500,
    lowStockThreshold: 10
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const salesData = [
    { day: 'Mon', sales: 18 },
    { day: 'Tue', sales: 25 },
    { day: 'Wed', sales: 22 },
    { day: 'Thu', sales: 28 },
    { day: 'Fri', sales: 35 },
    { day: 'Sat', sales: 42 },
    { day: 'Sun', sales: 23 }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bakery Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">{formatDate(currentTime)}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-gray-900">
                {formatTime(currentTime)}
              </div>
              <p className="text-sm text-gray-600">Current Time</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={IndianRupee}
            title="Today's Revenue"
            value={`₹${productData.revenue.toFixed(2)}`}
            subtitle={`${productData.todaySold} units sold`}
            color="green"
          />
          <StatCard
            icon={Package}
            title="Current Stock"
            value={productData.stock}
            subtitle={productData.stock <= productData.lowStockThreshold ? "Low stock!" : "In stock"}
            color={productData.stock <= productData.lowStockThreshold ? "red" : "blue"}
          />
          <StatCard
            icon={TrendingUp}
            title="Units Sold Today"
            value={productData.todaySold}
            subtitle="vs 18 yesterday"
            color="purple"
          />
          <StatCard
            icon={Users}
            title="Avg Daily Sales"
            value="27"
            subtitle="Last 7 days"
            color="indigo"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-amber-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900">{productData.name}</h4>
                  <p className="text-2xl font-bold text-green-600 mt-2"> ₹{productData.price}</p>
                </div>
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Current Stock</span>
                    <span className="font-medium">{productData.stock} units</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Sold Today</span>
                    <span className="font-medium">{productData.todaySold} units</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Revenue Today</span>
                    <span className="font-medium text-green-600"> ₹{productData.revenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {productData.stock <= productData.lowStockThreshold && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-red-800">Low Stock Alert</h4>
                    <p className="text-sm text-red-600 mt-1">
                      Only {productData.stock} units remaining. Consider restocking soon.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Sales</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Last 7 days
                </div>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {salesData.map((day, index) => (
                  <div key={day.day} className="flex items-center">
                    <div className="w-12 text-sm font-medium text-gray-600">
                      {day.day}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                          style={{ width: `${(day.sales / 45) * 100}%` }}
                        >
                          <span className="text-xs font-medium text-white">
                            {day.sales}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-900">
                    ₹{(day.sales * productData.price).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Units</p>
                    <p className="text-xl font-bold text-gray-900">
                      {salesData.reduce((sum, day) => sum + day.sales, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-xl font-bold text-green-600">
                    ₹{(salesData.reduce((sum, day) => sum + day.sales, 0) * productData.price).toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg/Day</p>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.round(salesData.reduce((sum, day) => sum + day.sales, 0) / 7)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;