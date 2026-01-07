
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpDown, 
  AlertTriangle, 
  Calendar, 
  Box, 
  Search,
  Filter,
  Download,
  Printer,
  X,
  ImageIcon,
  Pencil
} from 'lucide-react';
import { Product, UnitOfMeasure } from '../types';
import { CATEGORIES } from '../constants';

// AddProductModal component defined within InventoryView file
const AddProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Product, 'id' | 'color'>, idToUpdate?: string) => void;
  isDarkMode: boolean;
  productToEdit: Product | null;
}> = ({ isOpen, onClose, onSave, isDarkMode, productToEdit }) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [uom, setUom] = useState<UnitOfMeasure>(UnitOfMeasure.EACH);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name);
        setBarcode(productToEdit.barcode);
        setCategory(productToEdit.category);
        setPrice(productToEdit.price.toString());
        setStock(productToEdit.stock.toString());
        setUom(productToEdit.uom);
        setImagePreview(productToEdit.image || null);
      } else {
        // Reset form for "Add New"
        setName('');
        setBarcode('');
        setCategory(CATEGORIES[1]);
        setPrice('');
        setStock('');
        setUom(UnitOfMeasure.EACH);
        setImagePreview(null);
      }
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !barcode) return;
    const dataToSave = {
      name,
      barcode,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      uom,
      image: imagePreview ?? undefined,
      lowStockThreshold: productToEdit?.lowStockThreshold || 10,
      expiryDate: productToEdit?.expiryDate,
    };
    onSave(dataToSave, productToEdit?.id);
  };
  
  const modalTitle = productToEdit ? "Edit Product" : "Add New Product";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <h2 className="text-xl font-black">{modalTitle}</h2>
          <button onClick={onClose} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 mb-4">
              <div className="sm:w-1/3">
                <label htmlFor="product-image-upload" className={`cursor-pointer w-full aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center text-center p-2 transition-colors ${isDarkMode ? 'border-slate-600 hover:border-emerald-500 hover:bg-slate-700/50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'}`}>
                    <input id="product-image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg" />
                    {imagePreview ? (
                        <div className="relative w-full h-full group">
                            <img src={imagePreview} alt="Product Preview" className="w-full h-full object-cover rounded-xl" />
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); setImagePreview(null); }}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-all opacity-0 group-hover:opacity-100"
                              aria-label="Remove image"
                            >
                              <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            <ImageIcon size={32} />
                            <span className="text-sm font-semibold">Upload Image</span>
                        </div>
                    )}
                </label>
              </div>
              <div className="flex-1 space-y-4">
                  <input type="text" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`} />
                  <input type="text" placeholder="Barcode / PLU" value={barcode} onChange={e => setBarcode(e.target.value)} required className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`} />
                  <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={uom} onChange={e => setUom(e.target.value as UnitOfMeasure)} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                    {Object.values(UnitOfMeasure).map(unit => <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>)}
                  </select>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`} />
            <input type="number" placeholder="Initial Stock" value={stock} onChange={e => setStock(e.target.value)} required min="0" className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`} />
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className={`px-6 py-3 rounded-xl font-bold ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>Cancel</button>
            <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface InventoryViewProps {
  inventory: Product[];
  setInventory: React.Dispatch<React.SetStateAction<Product[]>>;
  isDarkMode: boolean;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, setInventory, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLowStockFilterActive, setIsLowStockFilterActive] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return inventory.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
      const matchesLowStock = !isLowStockFilterActive || (p.stock < p.lowStockThreshold);
      return matchesSearch && matchesLowStock;
    });
  }, [inventory, searchTerm, isLowStockFilterActive]);

  const handleAddNewClick = () => {
    setProductToEdit(null);
    setIsAddModalOpen(true);
  };
  
  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsAddModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = (data: Omit<Product, 'id' | 'color'>, idToUpdate?: string) => {
    if (idToUpdate) {
      // Update
      setInventory(prev => prev.map(p => (p.id === idToUpdate ? { ...p, ...data } : p)));
    } else {
      // Create new
      const newProduct: Product = {
        ...data,
        id: `prod_${Date.now()}`,
        image: data.image || `https://picsum.photos/seed/${data.name}/200`,
      };
      setInventory(prev => [newProduct, ...prev]);
    }
    handleCloseModal();
  };
  
  const handleExportCSV = () => {
    const headers = "Name,Category,Stock,Price";
    const rows = filtered.map(p => `"${p.name}",${p.category},${p.stock},${p.price.toFixed(2)}`).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "inventory_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintLabels = () => {
    const labelHtml = filtered.map(p => `
      <div style="border: 2px solid #000; padding: 1rem; width: 15rem; height: 8rem; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; margin: 0.5rem; font-family: sans-serif;">
        <h3 style="font-size: 1.1rem; font-weight: bold; margin: 0; line-height: 1.2; max-height: 2.4rem; overflow: hidden;">${p.name}</h3>
        <p style="font-size: 2.5rem; font-weight: 800; margin: 0; text-align: right;">$${p.price.toFixed(2)}</p>
        <div style="height: 2rem; background: repeating-linear-gradient(to right, #000, #000 2px, #fff 2px, #fff 4px); border: 1px solid #ccc;"></div>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print labels.');
      return;
    }

    printWindow.document.write(`
        <html>
            <head>
                <title>Print Labels</title>
                <style>
                    body { margin: 0; padding: 1rem; background: white; }
                    .labels-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 0.5rem; }
                </style>
            </head>
            <body>
                <div class="labels-grid">${labelHtml}</div>
                <script>
                    window.onload = () => {
                        setTimeout(() => {
                            window.focus();
                            window.print();
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black">Inventory Tracking</h1>
            <p className="text-slate-500">Manage your products, stock levels, and supply orders.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white border border-slate-200 font-bold hover:bg-slate-50 transition-colors">
              <Download size={18} /> Export
            </button>
            <button onClick={handleAddNewClick} className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
              <Plus size={18} /> New Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <StatsCard icon={<Box className="text-blue-500" />} label="Total SKUs" value={inventory.length.toString()} isDarkMode={isDarkMode} />
          <StatsCard icon={<AlertTriangle className="text-amber-500" />} label="Low Stock Items" value={inventory.filter(p => p.stock < p.lowStockThreshold).length.toString()} isDarkMode={isDarkMode} />
          <StatsCard icon={<Calendar className="text-rose-500" />} label="Expiring Soon" value={inventory.filter(p => p.expiryDate).length.toString()} isDarkMode={isDarkMode} />
          <StatsCard icon={<ArrowUpDown className="text-emerald-500" />} label="Inventory Value" value={`$${inventory.reduce((acc, p) => acc + (p.stock * p.price), 0).toFixed(0)}`} isDarkMode={isDarkMode} />
        </div>

        <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Filter by name or barcode..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setIsLowStockFilterActive(!isLowStockFilterActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${
                  isLowStockFilterActive
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    : isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Filter size={16} /> Low Stock
              </button>
              <button onClick={handlePrintLabels} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <Printer size={16} /> Print Labels
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500 bg-slate-900' : 'text-slate-400 bg-slate-50'}`}>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stock Level</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {filtered.map(p => (
                  <tr key={p.id} className={`${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-emerald-50/30'} transition-colors group`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                          <img src={p.image} className="w-full h-full object-cover bg-white" alt={p.name} />
                        </div>
                        <div>
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs text-slate-500 font-medium">#{p.barcode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-black px-2 py-1 rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-24 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <div 
                            className={`h-full rounded-full ${p.stock < p.lowStockThreshold ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (p.stock / (p.lowStockThreshold*5)) * 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${p.stock < p.lowStockThreshold ? (isDarkMode ? 'text-rose-400' : 'text-rose-600') : ''}`}>
                          {p.stock} <span className="text-slate-400 font-medium">{p.uom}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">${p.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEditClick(p)} className={`py-2 px-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${isDarkMode ? 'text-slate-400 hover:text-white group-hover:bg-slate-700' : 'text-slate-400 hover:text-emerald-600 group-hover:bg-emerald-50'}`}>
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddProductModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        isDarkMode={isDarkMode}
        productToEdit={productToEdit}
      />
    </>
  );
};

const StatsCard: React.FC<{ icon: React.ReactNode; label: string; value: string; isDarkMode: boolean }> = ({ icon, label, value, isDarkMode }) => (
  <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
    <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  </div>
);

export default InventoryView;
