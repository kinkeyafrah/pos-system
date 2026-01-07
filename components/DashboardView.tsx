
import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Sparkles, TrendingUp, DollarSign, ShoppingBag, Users, ShoppingCart, CreditCard } from 'lucide-react';
import { Transaction, Product, UnitOfMeasure, CartItem, AppConfig } from '../types';
import { getInventoryInsights } from '../geminiService';
import ReceiptModal from './ReceiptModal';

interface DashboardViewProps {
  transactions: Transaction[];
  inventory: Product[];
  isDarkMode: boolean;
  config: AppConfig;
}

const DashboardView: React.FC<DashboardViewProps> = ({ transactions, inventory, isDarkMode, config }) => {
  const [aiInsight, setAiInsight] = useState<string | undefined>("Generating insights...");
  const [showTestReceipt, setShowTestReceipt] = useState(false);
  const [testTransaction, setTestTransaction] = useState<Transaction | null>(null);

  const { netSales, totalTransactions, avgBasket } = useMemo(() => {
    const totalSales = transactions.reduce((acc, t) => acc + t.total, 0);
    const numTransactions = transactions.length;
    const average = numTransactions > 0 ? totalSales / numTransactions : 0;
    return {
      netSales: totalSales,
      totalTransactions: numTransactions,
      avgBasket: average
    };
  }, [transactions]);
  
  const formatCurrency = (value: number) => {
    return `${config.currencySymbol}${value.toFixed(2)}`;
  };

  const handleTestPrint = () => {
    const sampleTransaction: Transaction = {
      id: 'TXN-TEST-123',
      timestamp: new Date().toISOString(),
      items: [
        {
          id: 'test-1',
          product: { id: '3', name: 'Whole Milk 1Gal', category: 'Dairy & Eggs', price: 4.29, uom: UnitOfMeasure.EACH, stock: 0, lowStockThreshold: 0, barcode: '10001', image: '' },
          quantity: 1,
        },
        {
          id: 'test-2',
          product: { id: '4', name: 'Sourdough Bread', category: 'Bakery', price: 5.50, uom: UnitOfMeasure.EACH, stock: 0, lowStockThreshold: 0, barcode: '20002', image: '' },
          quantity: 2,
        },
         {
          id: 'test-3',
          product: { id: '2', name: 'Red Apples', category: 'Produce', price: 2.99, uom: UnitOfMeasure.KG, stock: 0, lowStockThreshold: 0, barcode: '4015', image: '' },
          quantity: 1,
          weight: 0.5,
        },
      ],
      total: (4.29 + (5.50 * 2) + (2.99 * 0.5)) * (1 + config.taxRate),
      tax: (4.29 + (5.50 * 2) + (2.99 * 0.5)) * config.taxRate,
      paymentMethod: 'card',
      cashierId: 'CASHIER-TEST',
    };
    setTestTransaction(sampleTransaction);
    setShowTestReceipt(true);
  };

  useEffect(() => {
    const fetchInsight = async () => {
      const insight = await getInventoryInsights(transactions, inventory);
      setAiInsight(insight);
    };
    fetchInsight();
  }, [inventory, transactions]);

  const salesData = useMemo(() => {
    if (transactions.length === 0) {
      return [
        { name: 'Mon', sales: 4200 }, { name: 'Tue', sales: 3800 }, { name: 'Wed', sales: 5100 },
        { name: 'Thu', sales: 4600 }, { name: 'Fri', sales: 6800 }, { name: 'Sat', sales: 8200 },
        { name: 'Sun', sales: 7100 },
      ];
    }
    return [{ name: 'Today', sales: transactions.reduce((acc, t) => acc + t.total, 0) }];
  }, [transactions]);

  const topSellingProducts = useMemo(() => {
    if (transactions.length === 0) {
      return [
        { name: 'Ribeye Steak', sales: 1200 }, { name: 'Organic Bananas', sales: 950 },
        { name: 'Sourdough Bread', sales: 820 }, { name: 'Whole Milk', sales: 760 },
        { name: 'Red Apples', sales: 650 },
      ];
    }
    const productSales: { [key: string]: { name: string, sales: number } } = {};
    transactions.forEach(t => {
      t.items.forEach((item: CartItem) => {
        const saleValue = item.product.uom === UnitOfMeasure.KG ? item.product.price * (item.weight || 1) : item.product.price * item.quantity;
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = { name: item.product.name, sales: 0 };
        }
        productSales[item.product.id].sales += saleValue;
      });
    });
    return Object.values(productSales).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [transactions]);

  const paymentMethodData = useMemo(() => {
    if (transactions.length === 0) return [{ name: 'Card', value: 75 }, { name: 'Cash', value: 20 }, { name: 'Mobile', value: 5 }];
    const counts: Record<string, number> = { card: 0, cash: 0, mobile: 0, loyalty: 0 };
    transactions.forEach(t => { counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).filter(item => item.value > 0);
  }, [transactions]);

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <>
      <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black">Performance Dashboard</h1>
            <p className="text-slate-500">Real-time business health and sales analytics.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-black">
            <TrendingUp size={16} /> Live Data
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard isDarkMode={isDarkMode} label="Net Sales" value={formatCurrency(netSales)} change="+12.5%" isPositive={true} icon={<DollarSign className="text-emerald-500" />} />
          <MetricCard isDarkMode={isDarkMode} label="Transactions" value={totalTransactions.toString()} change="+8.2%" isPositive={true} icon={<ShoppingBag className="text-blue-500" />} />
          <MetricCard isDarkMode={isDarkMode} label="Average Basket" value={formatCurrency(avgBasket)} change="-2.1%" isPositive={false} icon={<TrendingUp className="text-amber-500" />} />
          <MetricCard isDarkMode={isDarkMode} label="Active Cashiers" value="4" change="+0" isPositive={true} icon={<Users className="text-purple-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 p-8 rounded-[2rem] border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">Weekly Sales Volume</h2>
              <select className={`px-4 py-2 rounded-xl text-sm font-bold border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: isDarkMode ? '#1e293b' : '#fff' }} cursor={{ stroke: '#10b981', strokeWidth: 2 }}/>
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`p-8 rounded-[2rem] border shadow-sm h-full flex flex-col ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="flex items-center gap-2 text-emerald-600 mb-4 font-black text-sm uppercase tracking-widest"><Sparkles size={18} /> Manager Assistant</div>
              <h3 className="text-2xl font-black mb-4 leading-tight">Smart Inventory Recommendations</h3>
              <div className={`text-sm leading-relaxed whitespace-pre-line flex-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{aiInsight}</div>
              <button className="mt-6 w-full py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">Generate Report</button>
              <button onClick={handleTestPrint} className="mt-2 w-full py-3 rounded-2xl bg-slate-700 text-white font-bold hover:bg-slate-800 transition-all no-print">Test Print Receipt</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`p-8 rounded-[2rem] border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-emerald-100 rounded-2xl"><ShoppingCart className="text-emerald-600" /></div><h2 className="text-xl font-black">Top Selling Products</h2></div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topSellingProducts} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} /><XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: isDarkMode ? '#1e293b' : '#fff' }} cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }}/>
                            <Bar dataKey="sales" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className={`p-8 rounded-[2rem] border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-blue-100 rounded-2xl"><CreditCard className="text-blue-600" /></div><h2 className="text-xl font-black">Payment Methods</h2></div>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60}>
                                {paymentMethodData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                             <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: isDarkMode ? '#1e293b' : '#fff' }} />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
      {showTestReceipt && testTransaction && (
        <ReceiptModal transaction={testTransaction} onClose={() => setShowTestReceipt(false)} isDarkMode={isDarkMode} config={config} />
      )}
    </>
  );
};

const MetricCard: React.FC<{ label: string; value: string; change: string; isPositive: boolean; icon: React.ReactNode; isDarkMode: boolean; }> = ({ label, value, change, isPositive, icon, isDarkMode }) => (
  <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>{icon}</div>
      <div className={`text-xs font-black px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{change}</div>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  </div>
);

export default DashboardView;
