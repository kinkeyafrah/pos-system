import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarcodeDetector } from 'barcode-detector';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Pause, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Scale,
  Sparkles,
  Barcode,
  ShoppingCart,
  X,
  ChevronUp,
  ClipboardList
} from 'lucide-react';
import { Product, CartItem, UnitOfMeasure, Transaction, AppConfig } from '../types';
import { CATEGORIES } from '../constants';
import { getSmartProductSuggestions } from '../geminiService';
import ReceiptModal from './ReceiptModal';
import HeldCartsModal from './HeldCartsModal';

interface POSViewProps {
  inventory: Product[];
  cart: CartItem[];
  addToCart: (product: Product, weight?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  holdTransaction: () => void;
  heldCarts: CartItem[][];
  resumeTransaction: (index: number) => void;
  deleteHeldTransaction: (index: number) => void;
  completeSale: (method: any) => void;
  isDarkMode: boolean;
  lastTransaction: Transaction | null;
  startNewSale: () => void;
  config: AppConfig;
}

const POSView: React.FC<POSViewProps> = ({
  inventory, cart, addToCart, removeFromCart, updateQuantity, 
  holdTransaction, heldCarts, resumeTransaction, deleteHeldTransaction,
  completeSale, isDarkMode, lastTransaction, startNewSale, config
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showWeightModal, setShowWeightModal] = useState<Product | null>(null);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [smartSuggestions, setSmartSuggestions] = useState<Product[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [isCartCollapsed, setIsCartCollapsed] = useState(true);
  const [showHeldCarts, setShowHeldCarts] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameId = useRef<number>();

  // Focus input on mount and whenever UI state changes back to "ready"
  useEffect(() => {
    if (!isScanning && !showWeightModal && !showHeldCarts && !lastTransaction) {
      // Small timeout to ensure DOM is ready and transitions finished
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScanning, showWeightModal, showHeldCarts, lastTransaction]);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsCartCollapsed(checkMobile());
  }, []);

  useEffect(() => {
    if (!isScanning) {
      return;
    }

    let stream: MediaStream | null = null;
    let detector: any = null;

    try {
      detector = new BarcodeDetector({
        formats: [
          'qr_code',
          'ean_13',
          'ean_8',
          'upc_a',
          'upc_e',
          'code_128',
          'code_39',
          'itf',
          'data_matrix'
        ]
      });
    } catch (e) {
      console.error("BarcodeDetector not supported", e);
      setScanStatus('error');
      setScanMessage('Device incompatible with scanner.');
      return;
    }
    
    const tick = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const codeData = barcodes[0].rawValue;
            const product = inventory.find(p => p.barcode === codeData);
            
            if (product) {
              addToCart(product);
              setScanStatus('success');
              setScanMessage(`${product.name} added!`);
              if (navigator.vibrate) navigator.vibrate(100);
              setTimeout(() => setIsScanning(false), 1000);
              return;
            } else {
              setScanStatus('error');
              setScanMessage(`Item not found: ${codeData}`);
              setTimeout(() => {
                if (isScanning) {
                  setScanStatus('idle');
                  setScanMessage('');
                  animationFrameId.current = requestAnimationFrame(tick);
                }
              }, 1500);
              return;
            }
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      }
      animationFrameId.current = requestAnimationFrame(tick);
    };

    const startScan = async () => {
      try {
        setScanStatus('idle');
        setScanMessage('');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          animationFrameId.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setScanStatus('error');
        setScanMessage('Camera access denied.');
      }
    };

    startScan();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, inventory, addToCart]);

  const filteredProducts = useMemo(() => {
    return inventory.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [inventory, activeCategory, search]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length > 2) {
        const results = await getSmartProductSuggestions(search, inventory);
        setSmartSuggestions(results);
      } else {
        setSmartSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, inventory]);

  const handleProductClick = (product: Product) => {
    if (product.uom === UnitOfMeasure.KG) {
      setShowWeightModal(product);
      setCurrentWeight(0);
    } else {
      addToCart(product);
    }
  };

  const handleWeightSubmit = () => {
    if (showWeightModal && currentWeight > 0) {
      addToCart(showWeightModal, currentWeight);
      setShowWeightModal(null);
    }
  };

  const handleScanToggle = () => {
    setIsScanning(!isScanning);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      // Hardware scanner support: try to match the exact barcode
      const product = inventory.find(p => p.barcode === search.trim());
      if (product) {
        handleProductClick(product);
        setSearch(''); // Clear search after successful scan
      }
    }
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => {
    const price = item.product.uom === UnitOfMeasure.KG
      ? item.product.price * (item.weight || 1)
      : item.product.price * item.quantity;
    return acc + price;
  }, 0), [cart]);
  
  const tax = useMemo(() => subtotal * config.taxRate, [subtotal, config.taxRate]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const getScannerBorderColor = () => {
    switch (scanStatus) {
      case 'success': return 'border-emerald-500';
      case 'error': return 'border-rose-500';
      default: return 'border-white/50';
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar pb-28 md:pb-0">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search items or scan barcode..."
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 focus:ring-emerald-500 focus:border-emerald-500' 
                    : 'bg-white border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <button 
              onClick={handleScanToggle}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                isScanning ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Barcode size={20} />
              <span className="hidden sm:inline">{isScanning ? 'Stop Scanning' : 'Scan'}</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                  activeCategory === cat 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 pr-2">
            {smartSuggestions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-emerald-500 font-semibold text-sm uppercase tracking-wider">
                  <Sparkles size={14} /> Smart Recommendations
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {smartSuggestions.map(p => (
                    <ProductCard key={p.id} product={p} onClick={() => handleProductClick(p)} isDarkMode={isDarkMode} config={config} />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => handleProductClick(p)} isDarkMode={isDarkMode} config={config} />
              ))}
            </div>
          </div>
        </div>

        <div className={`
          fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t
          md:static md:w-[400px] md:flex md:flex-col md:rounded-3xl md:shadow-xl md:border md:h-full
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          ${isCartCollapsed ? 'h-24' : 'h-[70vh]'}
        `}>
          <div
            className="p-4 md:p-6 flex justify-between items-center cursor-pointer md:cursor-default"
            onClick={() => { if (window.innerWidth < 768) setIsCartCollapsed(!isCartCollapsed); }}
          >
            <h2 className="text-xl font-bold flex items-center gap-2">
              Current Cart <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-sm">{cart.length}</span>
            </h2>
            <div className="flex items-center gap-4">
              <span className="font-black text-xl text-emerald-600">{config.currencySymbol}{total.toFixed(2)}</span>
              <ChevronUp className={`transition-transform md:hidden ${!isCartCollapsed ? 'rotate-180' : ''}`} />
            </div>
          </div>

          <div className={`flex-1 flex-col min-h-0 ${isCartCollapsed ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-6 pb-2 flex justify-between items-center">
              <div className="text-sm font-bold">Items</div>
              {heldCarts.length > 0 && (
                <button 
                  onClick={() => setShowHeldCarts(true)}
                  className="text-xs font-bold text-amber-500 uppercase tracking-widest hover:text-amber-600 flex items-center gap-1"
                >
                  <ClipboardList size={12} /> {heldCarts.length} Held
                </button>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-6">
                  <div className={`relative w-24 h-24 mb-4 flex items-center justify-center rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <ShoppingCart size={40} className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Your Cart is Empty</h3>
                  <p className="text-sm text-slate-500 mt-1">Tap a product or use the barcode scanner to begin a new sale.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border bg-slate-50">
                      <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className={`p-1 rounded text-slate-400 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><Minus size={14} /></button>
                        <span className="text-sm font-bold w-12 text-center">
                          {item.product.uom === UnitOfMeasure.KG ? `${item.weight}kg` : item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, 1)} className={`p-1 rounded text-slate-400 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><Plus size={14} /></button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end">
                      <span className="font-bold">
                        {config.currencySymbol}{((item.product.uom === UnitOfMeasure.KG ? (item.weight || 0) : item.quantity) * item.product.price).toFixed(2)}
                      </span>
                      <button onClick={() => removeFromCart(item.id)} className={`text-rose-500 p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'}`}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <div className="space-y-2 mb-6 text-sm font-medium">
                <div className="flex justify-between opacity-70">
                  <span>Subtotal</span>
                  <span>{config.currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between opacity-70">
                  <span>Tax ({(config.taxRate * 100).toFixed(0)}%)</span>
                  <span>{config.currencySymbol}{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black mt-2">
                  <span>Total</span>
                  <span className="text-emerald-600">{config.currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                 <button 
                  onClick={() => (window as any).clearTheCart()}
                  disabled={cart.length === 0}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-rose-500/40 text-rose-400 hover:enabled:bg-rose-500/10' : 'border-rose-300 text-rose-500 hover:enabled:bg-rose-50'}`}
                >
                  <Trash2 size={18} /> Clear
                </button>
                <button 
                  onClick={holdTransaction} 
                  disabled={cart.length === 0}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}
                >
                  <Pause size={18} /> Hold
                </button>
                <button 
                  onClick={() => completeSale('cash')} 
                  disabled={cart.length === 0}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Banknote size={18} /> Cash
                </button>
              </div>
              <button 
                onClick={() => completeSale('card')} 
                disabled={cart.length === 0}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard size={22} /> Pay Now
              </button>
            </div>
          </div>
        </div>

        {isScanning && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className={`absolute inset-0 border-8 ${getScannerBorderColor()} rounded-3xl pointer-events-none transition-colors duration-300 shadow-inner`} />
              <div className="absolute inset-[20%] border-2 border-dashed border-white/30 rounded-lg pointer-events-none" />
              <div className="absolute inset-[10%] pointer-events-none overflow-hidden rounded-xl">
                <div className="scan-line absolute h-1 w-full bg-emerald-500/80 shadow-[0_0_15px_2px] shadow-emerald-500" />
              </div>
            </div>
            <div className="mt-6 text-center h-12 flex items-center justify-center">
              <p className={`font-semibold text-lg transition-opacity ${scanStatus !== 'idle' ? 'opacity-0' : 'opacity-100 text-white'}`}>
                Position barcode or QR within the frame
              </p>
              <p className={`absolute inset-x-0 font-bold text-xl transition-opacity ${scanStatus === 'idle' ? 'opacity-0' : 'opacity-100'} ${scanStatus === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scanMessage}
              </p>
            </div>
            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-6 right-6 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
              aria-label="Close scanner"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {showWeightModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-black mb-2">Weight Scale (Metric)</h2>
              <p className="text-slate-500 mb-6">Place {showWeightModal.name} on the scale to fetch reading in kilograms.</p>
              <div className="flex flex-col items-center gap-6">
                <div className={`w-full p-8 rounded-2xl flex flex-col items-center border-4 border-dashed ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                  <Scale size={64} className="text-emerald-500 mb-4" />
                  <span className="text-5xl font-black text-emerald-600">{currentWeight.toFixed(2)} <span className="text-2xl text-slate-400">kg</span></span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.01" 
                  value={currentWeight} 
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <button 
                    onClick={() => setShowWeightModal(null)}
                    className={`py-4 rounded-2xl border font-bold transition-colors ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleWeightSubmit}
                    className="py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {lastTransaction && (
        <ReceiptModal 
          transaction={lastTransaction}
          onClose={startNewSale}
          isDarkMode={isDarkMode}
          config={config}
        />
      )}

      <HeldCartsModal 
        isOpen={showHeldCarts}
        onClose={() => setShowHeldCarts(false)}
        heldCarts={heldCarts}
        onResume={(index) => {
          resumeTransaction(index);
          setShowHeldCarts(false);
        }}
        onDelete={deleteHeldTransaction}
        isDarkMode={isDarkMode}
        config={config}
      />
    </>
  );
};

const ProductCard: React.FC<{ product: Product; onClick: () => void; isDarkMode: boolean; config: AppConfig }> = ({ product, onClick, isDarkMode, config }) => (
  <button 
    onClick={onClick}
    className={`group flex flex-col rounded-3xl overflow-hidden text-left transition-all active:scale-95 hover:shadow-xl border ${
      isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-emerald-500' : 'bg-white border-slate-100 hover:border-emerald-500'
    }`}
  >
    <div className="relative h-32 overflow-hidden bg-slate-100">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-black text-slate-900 shadow-sm">
        {config.currencySymbol}{product.price.toFixed(2)}/{product.uom}
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
      <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">{product.category}</p>
    </div>
  </button>
);

export default POSView;