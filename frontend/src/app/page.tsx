
'use client'

import React, { useState, useEffect, useReducer, createContext, useContext, Suspense } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, useQuery, useMutation, gql } from '@apollo/client';
import { OnrampSDK } from '@coinbase/cbpay-js';
import { 
  ShoppingCart, MapPin, Clock, Star, User, Search, Filter, Truck, Package, 
  CreditCard, Bell, Settings, Menu, X, Plus, Minus, CheckCircle, AlertCircle, 
  DollarSign, BarChart3, Users, Store, Navigation, Zap, Shield, TrendingUp, 
  Coins, Lock, Key, Database, Globe, ShieldCheck, Activity, Wallet, 
  PieChart, Award, Target, Heart, Leaf, Zap as Lightning, ArrowLeft, Sun, Moon
} from 'lucide-react';

// Types and Interfaces
interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
  };
}

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  verified: boolean;
  ethicalScore: number;
  categories: string[];
  menu: MenuItem[];
  licenseVerified: boolean;
  healthRating: number;
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  earnings: number;
  hoursWorked: number;
  completedOrders: number;
  vehicleType: string;
  benefits: string;
  guaranteedWage: number;
  blockchainWallet: string;
  complianceStatus: 'verified' | 'pending' | 'suspended';
  lastBackgroundCheck: Date;
  fbtBalance: number;
  stakedAmount: number;
}

interface Order {
  id: string;
  restaurant: string;
  items: string[];
  total: number;
  status: 'preparing' | 'in-transit' | 'delivered' | 'cancelled';
  estimatedTime: string;
  driver: string;
  driverRating: number;
  ethicalImpact: string;
  blockchainTx: string;
  temperatureLogs?: { time: Date; temp: number }[];
  securityChecks: { name: string; passed: boolean; timestamp: Date }[];
  aiRecommendation?: {
    suggestedItems: string[];
    estimatedPrepTime: number;
    optimalRoute: string;
  };
}

interface AppState {
  userRole: 'customer' | 'driver' | 'merchant' | 'admin';
  currentView: string;
  cart: { id: number; quantity: number; name: string; price: number; description: string }[];
  selectedRestaurant: Restaurant | null;
  authToken: string | null;
  userData: {
    id: string;
    name: string;
    email: string;
    walletAddress?: string;
    complianceStatus: string;
    fbtBalance?: number;
  } | null;
  securityAlerts: { id: string; message: string; severity: 'low' | 'medium' | 'high'; timestamp: Date }[];
  notifications: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; timestamp: Date }[];
  darkMode: boolean;
}

// Apollo Client Setup
const apolloClient = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL + '/graphql' || 'http://0.0.0.0:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: typeof window !== 'undefined' ? localStorage.getItem('auth-token') || '' : '',
  },
});

// Context for global state management
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<any>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  ws: WebSocket | null;
  onrampSDK: OnrampSDK | null;
} | undefined>(undefined);

// Enhanced mock data with comprehensive features
const mockData = {
  restaurants: [
    {
      id: 1,
      name: "Artisan Pizza Co.",
      cuisine: "Italian",
      rating: 4.8,
      deliveryTime: "15-25 min",
      deliveryFee: 0,
      image: "🍕",
      verified: true,
      ethicalScore: 95,
      categories: ["Pizza", "Italian", "Vegetarian"],
      menu: [
        { 
          id: 1, 
          name: "Margherita Pizza", 
          price: 18.99, 
          description: "Fresh mozzarella, basil, tomato sauce", 
          category: "Pizza",
          allergens: ["dairy", "gluten"],
          nutritionalInfo: { calories: 850, protein: 35, carbs: 90 }
        },
        { 
          id: 2, 
          name: "Truffle Mushroom Pizza", 
          price: 24.99, 
          description: "Wild mushrooms, truffle oil, parmesan", 
          category: "Pizza",
          allergens: ["dairy", "gluten"],
          nutritionalInfo: { calories: 920, protein: 42, carbs: 95 }
        },
        { 
          id: 3, 
          name: "Caesar Salad", 
          price: 12.99, 
          description: "Romaine, parmesan, croutons, house dressing", 
          category: "Salads",
          allergens: ["dairy", "gluten"],
          nutritionalInfo: { calories: 320, protein: 18, carbs: 25 }
        }
      ],
      licenseVerified: true,
      healthRating: 4.7
    },
    {
      id: 2,
      name: "Green Bowl Cafe",
      cuisine: "Healthy",
      rating: 4.6,
      deliveryTime: "20-30 min",
      deliveryFee: 0,
      image: "🥗",
      verified: true,
      ethicalScore: 98,
      categories: ["Healthy", "Vegan", "Organic"],
      menu: [
        { 
          id: 4, 
          name: "Quinoa Power Bowl", 
          price: 16.99, 
          description: "Quinoa, avocado, chickpeas, tahini dressing", 
          category: "Bowls",
          allergens: ["sesame"],
          nutritionalInfo: { calories: 520, protein: 22, carbs: 68 }
        },
        { 
          id: 5, 
          name: "Acai Smoothie Bowl", 
          price: 14.99, 
          description: "Acai, berries, granola, coconut", 
          category: "Smoothies",
          allergens: ["coconut"],
          nutritionalInfo: { calories: 380, protein: 8, carbs: 72 }
        }
      ],
      licenseVerified: true,
      healthRating: 4.9
    },
    {
      id: 3,
      name: "Burger Haven",
      cuisine: "American",
      rating: 4.4,
      deliveryTime: "25-35 min",
      deliveryFee: 0,
      image: "🍔",
      verified: true,
      ethicalScore: 87,
      categories: ["Burgers", "American", "Fast Food"],
      menu: [
        { 
          id: 6, 
          name: "Classic Cheeseburger", 
          price: 13.99, 
          description: "Beef patty, cheese, lettuce, tomato, onion", 
          category: "Burgers",
          allergens: ["dairy", "gluten"],
          nutritionalInfo: { calories: 680, protein: 35, carbs: 45 }
        },
        { 
          id: 7, 
          name: "Truffle Fries", 
          price: 8.99, 
          description: "Hand-cut fries with truffle oil and parmesan", 
          category: "Sides",
          allergens: ["dairy"],
          nutritionalInfo: { calories: 420, protein: 8, carbs: 55 }
        }
      ],
      licenseVerified: true,
      healthRating: 4.2
    }
  ],
  orders: [
    {
      id: "FB001",
      restaurant: "Artisan Pizza Co.",
      items: ["Margherita Pizza", "Caesar Salad"],
      total: 31.98,
      status: "preparing" as const,
      estimatedTime: "15 min",
      driver: "Alex Chen",
      driverRating: 4.9,
      ethicalImpact: "Driver earned $8.50 above minimum wage",
      blockchainTx: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
      temperatureLogs: [
        { time: new Date(Date.now() - 30*60000), temp: 75 },
        { time: new Date(Date.now() - 15*60000), temp: 72 }
      ],
      securityChecks: [
        { name: "Driver Identity", passed: true, timestamp: new Date() },
        { name: "Package Integrity", passed: true, timestamp: new Date() },
        { name: "Temperature Control", passed: true, timestamp: new Date() }
      ],
      aiRecommendation: {
        suggestedItems: ["Garlic Bread", "Tiramisu"],
        estimatedPrepTime: 12,
        optimalRoute: "Via Downtown Express"
      }
    },
    {
      id: "FB002",
      restaurant: "Green Bowl Cafe",
      items: ["Quinoa Power Bowl"],
      total: 16.99,
      status: "delivered" as const,
      estimatedTime: "25 min",
      driver: "Sarah Lee",
      driverRating: 4.8,
      ethicalImpact: "Driver earned $5.20 above minimum wage",
      blockchainTx: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
      securityChecks: [
        { name: "Driver Identity", passed: true, timestamp: new Date() },
        { name: "Package Integrity", passed: true, timestamp: new Date() }
      ],
      aiRecommendation: {
        suggestedItems: ["Green Smoothie", "Chia Pudding"],
        estimatedPrepTime: 8,
        optimalRoute: "Via Green Route"
      }
    }
  ],
  drivers: [
    {
      id: "DRV001",
      name: "Alex Chen",
      rating: 4.9,
      earnings: 1847.50,
      hoursWorked: 32.5,
      completedOrders: 156,
      vehicleType: "EV Bike",
      benefits: "Health, Dental, Retirement",
      guaranteedWage: 18.50,
      blockchainWallet: "0xDriverAlexWalletAddress",
      complianceStatus: "verified" as const,
      lastBackgroundCheck: new Date(Date.now() - 30*24*60*60*1000),
      fbtBalance: 2500,
      stakedAmount: 1000
    },
    {
      id: "DRV002",
      name: "Sarah Lee",
      rating: 4.8,
      earnings: 1520.30,
      hoursWorked: 28.0,
      completedOrders: 120,
      vehicleType: "EV Car",
      benefits: "Health",
      guaranteedWage: 18.50,
      blockchainWallet: "0xDriverSarahWalletAddress",
      complianceStatus: "verified" as const,
      lastBackgroundCheck: new Date(Date.now() - 45*24*60*60*1000),
      fbtBalance: 1800,
      stakedAmount: 500
    }
  ]
};

// App state reducer with comprehensive actions
const appReducer = (state: AppState, action: any): AppState => {
  switch (action.type) {
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }]
      };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_SELECTED_RESTAURANT':
      return { ...state, selectedRestaurant: action.payload };
    case 'SET_AUTH_TOKEN':
      return { ...state, authToken: action.payload };
    case 'SET_USER_DATA':
      return { ...state, userData: action.payload };
    case 'ADD_SECURITY_ALERT':
      return {
        ...state,
        securityAlerts: [
          ...state.securityAlerts.slice(-9),
          action.payload
        ]
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications.slice(-9),
          action.payload
        ]
      };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    default:
      return state;
  }
};

// Main App Component
const FastBiteProApp = () => {
  const [state, dispatch] = useReducer(appReducer, {
    userRole: 'customer',
    currentView: 'home',
    cart: [],
    selectedRestaurant: null,
    authToken: typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null,
    userData: null,
    securityAlerts: [],
    notifications: [],
    darkMode: false
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onrampSDK, setOnrampSDK] = useState<OnrampSDK | null>(null);

  // Initialize Coinbase Onramp SDK
  useEffect(() => {
    const initOnramp = async () => {
      try {
        const sdk = new OnrampSDK({
          appId: process.env.NEXT_PUBLIC_COINBASE_APP_ID!,
          widgetParameters: {
            destinationWallets: [{ 
              address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!, 
              blockchains: ['base'] 
            }],
          },
        });
        setOnrampSDK(sdk);
      } catch (error) {
        console.error('Failed to initialize Onramp SDK:', error);
      }
    };
    initOnramp();
  }, []);

  // Dark mode detection and management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleDarkModeChange = (e: MediaQueryListEvent) => {
        if (!state.darkMode) {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      };

      if (darkModeQuery.matches) {
        document.documentElement.classList.add('dark');
      }

      darkModeQuery.addEventListener('change', handleDarkModeChange);
      return () => darkModeQuery.removeEventListener('change', handleDarkModeChange);
    }
  }, [state.darkMode]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://0.0.0.0:4000';
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setWs(websocket);
        
        const heartbeat = setInterval(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 30000);
        
        return () => clearInterval(heartbeat);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'security_alert') {
          dispatch({ 
            type: 'ADD_SECURITY_ALERT', 
            payload: {
              id: `alert-${Date.now()}`,
              message: data.message,
              severity: data.severity,
              timestamp: new Date()
            }
          });
        }
        
        if (data.type === 'order_update') {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: `notif-${Date.now()}`,
              message: `Order ${data.orderId} status: ${data.status}`,
              type: 'info',
              timestamp: new Date()
            }
          });
        }

        if (data.type === 'driver_update') {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: `notif-${Date.now()}`,
              message: data.message,
              type: 'success',
              timestamp: new Date()
            }
          });
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch({
          type: 'ADD_SECURITY_ALERT',
          payload: {
            id: `alert-${Date.now()}`,
            message: 'WebSocket connection error',
            severity: 'medium',
            timestamp: new Date()
          }
        });
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setWs(null);
      };

      return () => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.close();
        }
      };
    }
  }, []);

  // Auto-logout for regulatory compliance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let inactivityTimer: NodeJS.Timeout;
      
      const resetTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          if (state.authToken) {
            dispatch({ type: 'SET_AUTH_TOKEN', payload: null });
            dispatch({ type: 'SET_USER_DATA', payload: null });
            localStorage.removeItem('auth-token');
            dispatch({
              type: 'ADD_SECURITY_ALERT',
              payload: {
                id: `alert-${Date.now()}`,
                message: 'Automatically logged out due to inactivity',
                severity: 'low',
                timestamp: new Date()
              }
            });
          }
        }, 15 * 60 * 1000);
      };

      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });

      resetTimer();

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, resetTimer);
        });
        clearTimeout(inactivityTimer);
      };
    }
  }, [state.authToken]);

  const contextValue = {
    state,
    dispatch,
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    ws,
    onrampSDK
  };

  return (
    <ApolloProvider client={apolloClient}>
      <AppContext.Provider value={contextValue}>
        <div className={`min-h-screen transition-colors duration-300 ${
          state.darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
        }`}>
          <Suspense fallback={<LoadingSpinner />}>
            <SecurityAlertBar />
            <NotificationBar />
            <Header />
            <main className="pb-20">
              {state.currentView === 'home' && <HomeView />}
              {state.currentView === 'restaurant' && <RestaurantView />}
              {state.currentView === 'cart' && <CartView />}
              {state.currentView === 'orders' && <OrdersView />}
              {state.currentView === 'driver' && <DriverView />}
              {state.currentView === 'merchant' && <MerchantView />}
              {state.currentView === 'admin' && <AdminView />}
              {state.currentView === 'compliance' && <ComplianceDashboard />}
              {state.currentView === 'wallet' && <WalletView />}
              {state.currentView === 'dao' && <DAOView />}
            </main>
            <BottomNavigation />
            {showFilters && <FilterModal />}
          </Suspense>
        </div>
      </AppContext.Provider>
    </ApolloProvider>
  );
};

// Security Alert Bar Component
const SecurityAlertBar = () => {
  const { state } = useContext(AppContext)!;
  
  if (state.securityAlerts.length === 0) return null;
  
  const latestAlert = state.securityAlerts[state.securityAlerts.length - 1];
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-2 text-center text-sm font-medium transition-all duration-300 ${
      latestAlert.severity === 'high' ? 'bg-red-500 text-white' :
      latestAlert.severity === 'medium' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <ShieldCheck className="h-4 w-4 mr-2" />
        <span>{latestAlert.message}</span>
      </div>
    </div>
  );
};

// Notification Bar Component
const NotificationBar = () => {
  const { state, dispatch } = useContext(AppContext)!;
  
  if (state.notifications.length === 0) return null;
  
  return (
    <div className="fixed top-12 right-4 z-40 space-y-2 max-w-sm">
      {state.notifications.slice(-3).map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg shadow-lg border transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-sm">{notification.message}</span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id })}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Enhanced Header Component
const Header = () => {
  const { state, dispatch } = useContext(AppContext)!;
  const cartTotal = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Lightning className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">FastBite Pro</span>
              <div className="flex items-center">
                <Lock className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 ml-1">Secured</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>Miami, FL</span>
            </div>

            <button
              onClick={() => {
                dispatch({ type: 'TOGGLE_DARK_MODE' });
                if (typeof document !== 'undefined') {
                  document.documentElement.classList.toggle('dark');
                }
              }}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {state.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'wallet' })}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Wallet className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'cart' })}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartTotal > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartTotal}
                  </span>
                )}
              </button>
            </div>

            <RoleSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Role Selector Component
const RoleSelector = () => {
  const { state, dispatch } = useContext(AppContext)!;

  const roles = [
    { key: 'customer', label: 'Customer', icon: User },
    { key: 'driver', label: 'Driver', icon: Truck, compliance: state.userData?.complianceStatus },
    { key: 'merchant', label: 'Merchant', icon: Store },
    { key: 'admin', label: 'Admin', icon: Settings },
    { key: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { key: 'dao', label: 'DAO', icon: Users }
  ];

  return (
    <div className="relative">
      <select
        value={state.userRole}
        onChange={(e) => {
          dispatch({ type: 'SET_USER_ROLE', payload: e.target.value });
          dispatch({ type: 'SET_CURRENT_VIEW', payload: e.target.value === 'customer' ? 'home' : e.target.value });
        }}
        className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:text-white transition-colors duration-300"
      >
        {roles.map(role => (
          <option key={role.key} value={role.key}>
            {role.label} 
            {role.compliance && (
              <span className="ml-1">
                {role.compliance === 'verified' ? '✓' : '⚠️'}
              </span>
            )}
          </option>
        ))}
      </select>
    </div>
  );
};

// Home View Component (Enhanced)
const HomeView = () => {
  const { searchQuery, setSearchQuery, setShowFilters, state } = useContext(AppContext)!;
  const [filteredRestaurants, setFilteredRestaurants] = useState(mockData.restaurants);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let filtered = mockData.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(restaurant =>
        restaurant.categories.includes(selectedCategory)
      );
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCategory]);

  const categories = ['all', 'Italian', 'Healthy', 'American', 'Pizza', 'Vegan', 'Fast Food'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">FastBite Pro</h1>
        <p className="text-lg opacity-90 mb-4">Ethical, Fast, Transparent Food Delivery</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>Blockchain Verified</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lightning className="h-4 w-4" />
            <span>AI-Optimized Routes</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Driver-First Model</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>Ethical Impact</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6 flex items-start transition-colors duration-300">
        <ShieldCheck className="h-6 w-6 text-blue-600 mt-1 mr-3" />
        <div>
          <h3 className="font-bold text-blue-800 dark:text-blue-200">Regulatory Compliance</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            All transactions are recorded on blockchain with end-to-end encryption
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 text-base"
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          value="98%"
          label="Ethical Score"
          color="green"
        />
        <StatCard
          icon={Clock}
          value="12m"
          label="Avg Delivery"
          color="blue"
        />
        <StatCard
          icon={Coins}
          value="$0"
          label="Delivery Fees"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            No restaurants found matching your criteria
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

// Continue with the rest of the components...
// [Due to length constraints, I'll continue with the remaining components in the next response]

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
  </div>
);

// Placeholder components (will be implemented in next response)
const StatCard = ({ icon: Icon, value, label, color }: any) => {
  const colorClasses = {
    green: 'text-green-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <Icon className={`h-8 w-8 ${colorClasses[color]} mx-auto mb-2`} />
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
};

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const { dispatch } = useContext(AppContext)!;

  const handleClick = () => {
    dispatch({ type: 'SET_SELECTED_RESTAURANT', payload: restaurant });
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'restaurant' });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-105"
    >
      <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-6xl">
        {restaurant.image}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{restaurant.name}</h3>
          {restaurant.verified && (
            <Shield className="h-4 w-4 text-green-500" title="Verified Partner" />
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{restaurant.cuisine}</p>
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="font-medium text-gray-900 dark:text-white">{restaurant.rating}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="text-green-600 font-medium">
            {restaurant.deliveryFee === 0 ? 'Free Delivery' : `$${restaurant.deliveryFee}`}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ethical Score: {restaurant.ethicalScore}%
          </div>
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <Shield className="h-3 w-3" />
            <span>Blockchain Verified</span>
          </div>
        </div>
        <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
          <Heart className="h-3 w-3" />
          <span>Health Rating: {restaurant.healthRating}/5</span>
        </div>
      </div>
    </div>
  );
};

// Placeholder components that need to be implemented
const RestaurantView = () => <div>Restaurant View - To be implemented</div>;
const CartView = () => <div>Cart View - To be implemented</div>;
const OrdersView = () => <div>Orders View - To be implemented</div>;
const DriverView = () => <div>Driver View - To be implemented</div>;
const MerchantView = () => <div>Merchant View - To be implemented</div>;
const AdminView = () => <div>Admin View - To be implemented</div>;
const ComplianceDashboard = () => <div>Compliance Dashboard - To be implemented</div>;
const WalletView = () => <div>Wallet View - To be implemented</div>;
const DAOView = () => <div>DAO View - To be implemented</div>;
const BottomNavigation = () => <div>Bottom Navigation - To be implemented</div>;
const FilterModal = () => <div>Filter Modal - To be implemented</div>;

export default FastBiteProApp;
