import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiFilter, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const RestaurantPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState('Active');
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Grilled Salmon with Veggies',
      price: 25.45,
      rating: 4.7,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1605478371319-6f0d32a0fbd3',
    },
    {
      id: 2,
      name: 'Classic Caesar Salad',
      price: 12.99,
      rating: 4.5,
      category: 'Salad',
      image: 'https://images.unsplash.com/photo-1613145996405-55921258f254',
    },
    {
      id: 3,
      name: 'Beef Tenderloin Steak',
      price: 32.99,
      rating: 4.9,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1588167056540-27688f1e8e6e',
    },
    {
      id: 4,
      name: 'Vegetarian Pasta',
      price: 18.50,
      rating: 4.3,
      category: 'Pasta',
      image: 'https://images.unsplash.com/photo-1613141439111-f6c4fbe6dd5e',
    },
    {
      id: 5,
      name: 'Margherita Pizza',
      price: 14.99,
      rating: 4.6,
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1601924582975-4b3f4855fcb0',
    },
    {
      id: 6,
      name: 'Chocolate Lava Cake',
      price: 8.99,
      rating: 4.8,
      category: 'Dessert',
      image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f',
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: '#45868625542',
      name: 'Egg Omelette',
      price: 45.45,
      status: 'Active',
      address: '2715 Ash Dr. San Jose, South Dakota 83475',
      image: 'https://images.unsplash.com/photo-1604908177520-4720d273ba1d',
    },
    {
      id: '#45868625578',
      name: 'Sushi Platter',
      price: 25.45,
      status: 'Active',
      address: '6319 Elgin St. Celina, Delaware 10299',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
    },
    {
      id: '#45868625541',
      name: 'Egg Nuska',
      price: 6.45,
      status: 'Completed',
      address: '4140 Parker Rd. Allentown, New Mexico 31134',
      image: 'https://images.unsplash.com/photo-1600541533085-7aa1c9a11862',
    },
    {
      id: '#45868625421',
      name: 'Veg Pasta',
      price: 41.45,
      status: 'Canceled',
      address: '2118 Thorndike Cir. Syracuse, Connecticut',
      image: 'https://images.unsplash.com/photo-1613472249491-28e382a10861',
    },
  ]);

  const filterTabs = ['All', 'Pizza', 'Pasta', 'Salad', 'Main Course', 'Dessert'];

  useEffect(() => {
    // Filter menu items based on search query and active tab
    let filtered = menuItems;
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeTab !== 'All') {
      filtered = filtered.filter(item => item.category === activeTab);
    }
    
    setFilteredMenu(filtered);
    
    // Filter orders based on status
    const filteredOrders = orders.filter(order => 
      orderStatus === 'All' ? true : order.status === orderStatus
    );
    setFilteredOrders(filteredOrders);
  }, [searchQuery, activeTab, orderStatus, menuItems, orders]);

  const handleAddMenu = () => {
    // In a real app, this would open a modal or form
    alert('Add new menu item functionality would go here');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Restaurant Menu</h1>
            <p className="text-sm text-gray-500">Manage your menu items and categories</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-200 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-200">
                <option>Popular</option>
                <option>Newest</option>
                <option>Highest Rated</option>
              </select>
              
              <button 
                onClick={handleAddMenu}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <FiPlus size={16} />
                <span>Add Menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Menu Cards */}
        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    ⭐ {item.rating}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <span className="font-bold text-blue-600">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      Edit
                    </button>
                    <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
            <FiSearch className="text-gray-300 text-4xl mb-3" />
            <h3 className="text-lg font-medium text-gray-500">No menu items found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Orders Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
          <p className="text-sm text-gray-500">{filteredOrders.length} {orderStatus.toLowerCase()} orders</p>
        </div>
        
        <div className="flex gap-2 p-4 border-b border-gray-200 overflow-x-auto">
          {['All', 'Active', 'Completed', 'Canceled'].map((status) => (
            <button
              key={status}
              onClick={() => setOrderStatus(status)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                orderStatus === status
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-500">{order.id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Active' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'Completed' ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <img 
                    src={order.image} 
                    alt={order.name} 
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">{order.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{order.address}</p>
                    <p className="font-bold text-gray-800 mt-1">${order.price.toFixed(2)}</p>
                  </div>
                </div>
                
                {order.status === 'Active' && (
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Completed')}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 text-xs py-1.5 rounded hover:bg-green-100"
                    >
                      <FiCheckCircle size={14} /> Complete
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Canceled')}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 text-xs py-1.5 rounded hover:bg-red-100"
                    >
                      <FiXCircle size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <FiClock className="text-gray-300 text-3xl mb-2" />
              <p className="text-sm text-gray-500 text-center">No {orderStatus.toLowerCase()} orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;