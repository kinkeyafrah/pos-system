import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users as UsersIcon, 
  Settings as SettingsIcon,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { ViewType, Product, CartItem, Transaction, UnitOfMeasure, AppConfig, UserAccount, UserRole } from './types';
import { INITIAL_PRODUCTS } from './constants';
import POSView from './components/POSView';
import InventoryView from './components/InventoryView';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import UsersView from './components/UsersView';

const DEFAULT_CONFIG: AppConfig = {
  storeName: 'FreshFlow',
  storeLogo: '',
  currencySymbol: '$',
  taxRate: 0.05,
  contactPhone: '(555) 123-4567',
  receiptFooterMessage: 'Thank you for shopping with us!',
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('pos');
  const [inventory, setInventory] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<CartItem[][]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedInventory = localStorage.getItem('freshflow_inventory');
    const savedTransactions = localStorage.getItem('freshflow_transactions');
    const savedConfig = localStorage.getItem('freshflow_config');
    const savedDarkMode = localStorage.getItem('freshflow_darkmode');
    const savedUsers = localStorage.getItem('freshflow_users');
    const savedCurrentUser = localStorage.getItem('freshflow_current_user');

    if (savedInventory) setInventory(JSON.parse(savedInventory));
    else setInventory(INITIAL_PRODUCTS);

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));

    setLoading(false);
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('freshflow_inventory', JSON.stringify(inventory));
    }
  }, [inventory, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('freshflow_transactions', JSON.stringify(transactions));
    }
  }, [transactions, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('freshflow_config', JSON.stringify(config));
    }
  }, [config, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('freshflow_darkmode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('freshflow_users', JSON.stringify(users));
    }
  }, [users, loading]);

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        localStorage.setItem('freshflow_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('freshflow_current_user');
      }
    }
  }, [currentUser, loading]);

  const addToCart = (product: Product, weight?: number) => {
    setCart(prev => {
      if (product.uom === UnitOfMeasure.KG) {
        return [...prev, { id: Date.now().toString(), product, quantity: 1, weight }];
      }
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item => item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: Date.now().toString(), product, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? item : { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const holdTransaction = () => {
    if (cart.length === 0) return;
    setHeldCarts(prev => [...prev, cart]);
    setCart([]);
  };

  const resumeTransaction = (index: number) => {
    const resumed = heldCarts[index];
    setHeldCarts(prev => prev.filter((_, i) => i !== index));
    setCart(resumed);
  };

  const deleteHeldTransaction = (index: number) => {
    setHeldCarts(prev => prev.filter((_, i) => i !== index));
  };

  const completeSale = (paymentMethod: Transaction['paymentMethod']) => {
    if (cart.length === 0) return;
    
    const subtotal = cart.reduce((acc, item) => {
      const price = item.product.uom === UnitOfMeasure.KG ? item.product.price * (item.weight || 1) : item.product.price * item.quantity;
      return acc + price;
    }, 0);
    const taxValue = subtotal * config.taxRate;
    
    const transactionId = `TXN-${Date.now()}`;
    const newTransaction: Transaction = {
      id: transactionId,
      timestamp: new Date().toISOString(),
      items: [...cart],
      total: subtotal + taxValue,
      tax: taxValue,
      paymentMethod,
      cashierId: currentUser ? currentUser.name : 'CASHIER-01'
    };

    // Update inventory stock locally
    setInventory(prev => prev.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem) {
        const reduction = cartItem.product.uom === UnitOfMeasure.KG ? (cartItem.weight || 0) : cartItem.quantity;
        return { ...p, stock: Math.max(0, p.stock - reduction) };
      }
      return p;
    }));

    setTransactions(prev => [newTransaction, ...prev]);
    setLastTransaction(newTransaction);
    setCart([]);
  };

  const startNewSale = () => {
    setCart([]);
    setLastTransaction(null);
  };

  const handleViewChange = (view: ViewType) => {
      setActiveView(view);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleLogin = (username: string, password: string) => {
    const normalized = username.toLowerCase();
    const match = users.find(user => user.username.toLowerCase() === normalized && user.password === password);
    if (!match) {
      return { success: false, message: 'Invalid username or password.' };
    }
    setCurrentUser(match);
    return { success: true, message: `Welcome back, ${match.name}!` };
  };

  const handleSignup = (payload: { name: string; username: string; role: UserRole; password: string }) => {
    if (!payload.name || !payload.username || !payload.password) {
      return { success: false, message: 'Please complete all fields.' };
    }
    if (users.some(user => user.username.toLowerCase() === payload.username.toLowerCase())) {
      return { success: false, message: 'That username is already in use.' };
    }
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: payload.name,
      username: payload.username,
      role: users.length === 0 ? 'admin' : payload.role,
      password: payload.password,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    return { success: true, message: 'Account created successfully.' };
  };

  const handleDemoLogin = () => {
    const demoUser: UserAccount = {
      id: 'demo-user',
      name: 'Demo Manager',
      username: 'demo',
      role: 'manager',
      password: 'demo',
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => (prev.some(user => user.id === demoUser.id) ? prev : [...prev, demoUser]));
    setCurrentUser(demoUser);
  };

  const handleAddUser = (payload: { name: string; username: string; role: UserRole; password: string }) => {
    if (users.some(user => user.username.toLowerCase() === payload.username.toLowerCase())) {
      return { success: false, message: 'Username already exists.' };
    }
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: payload.name,
      username: payload.username,
      role: payload.role,
      password: payload.password,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    return { success: true, message: 'Staff account saved successfully.' };
  };

  const handleUpdateUser = (id: string, updates: Partial<Pick<UserAccount, 'name' | 'role' | 'password'>>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : prev);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (currentUser?.id === id) return;
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-emerald-600">Loading System...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthView
        users={users}
        isDarkMode={isDarkMode}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onDemoLogin={handleDemoLogin}
      />
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-xl lg:static lg:translate-x-0`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            {config.storeLogo ? (
              <img src={config.storeLogo} alt={`${config.storeName} Logo`} className="w-9 h-9 rounded-lg object-contain" />
            ) : (
              <div className="bg-emerald-600 p-2 rounded-lg">
                <ShoppingCart className="text-white w-6 h-6" />
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight">{config.storeName} <span className="text-emerald-600">POS</span></h1>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarLink icon={<LayoutGrid />} label="Checkout" active={activeView === 'pos'} onClick={() => handleViewChange('pos')} isDarkMode={isDarkMode}/>
            <SidebarLink icon={<Package />} label="Inventory" active={activeView === 'inventory'} onClick={() => handleViewChange('inventory')} isDarkMode={isDarkMode}/>
            <SidebarLink icon={<BarChart3 />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => handleViewChange('dashboard')} isDarkMode={isDarkMode}/>
            <SidebarLink icon={<UsersIcon />} label="Staff" active={activeView === 'users'} onClick={() => handleViewChange('users')} isDarkMode={isDarkMode}/>
             <SidebarLink icon={<SettingsIcon />} label="Settings" active={activeView === 'settings'} onClick={() => handleViewChange('settings')} isDarkMode={isDarkMode}/>
          </nav>

          <div className="mt-auto space-y-4">
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <p className="text-xs uppercase tracking-widest text-emerald-500 font-semibold">Signed in as</p>
              <p className="text-sm font-bold mt-1">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.role.toUpperCase()} • {currentUser.username}</p>
              <button
                onClick={() => setCurrentUser(null)}
                className="mt-3 text-xs font-semibold text-rose-500 hover:text-rose-400"
              >
                Sign out
              </button>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold opacity-70 uppercase tracking-wider">Status: Offline Mode</span>
              </div>
              <p className="text-sm font-medium">Terminal #104</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`lg:hidden flex items-center justify-between p-4 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={24} /></button>
          <div className="font-bold text-emerald-600">{config.storeName}</div>
          <div className="w-6 h-6"></div>
        </header>

        <div className="flex-1 overflow-hidden p-4 md:p-6">
          {activeView === 'pos' && <POSView inventory={inventory} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} holdTransaction={holdTransaction} heldCarts={heldCarts} resumeTransaction={resumeTransaction} deleteHeldTransaction={deleteHeldTransaction} completeSale={completeSale} isDarkMode={isDarkMode} lastTransaction={lastTransaction} startNewSale={startNewSale} config={config} />}
          {activeView === 'inventory' && <InventoryView inventory={inventory} setInventory={setInventory} isDarkMode={isDarkMode} />}
          {activeView === 'dashboard' && <DashboardView transactions={transactions} inventory={inventory} isDarkMode={isDarkMode} config={config} />}
          {activeView === 'users' && currentUser && (
            <UsersView
              users={users}
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
          {activeView === 'settings' && <SettingsView config={config} setConfig={setConfig} isDarkMode={isDarkMode} />}
        </div>
      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; isDarkMode: boolean;}> = ({ icon, label, active, onClick, isDarkMode }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${ active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : isDarkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700' }`}>
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default App;
