
import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { Save, Settings, Store, Percent, MessageSquare, Phone, Image as ImageIcon } from 'lucide-react';

interface SettingsViewProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  isDarkMode: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ config, setConfig, isDarkMode }) => {
  const [formData, setFormData] = useState(config);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    // If the global config changes (e.g., from another browser tab), update the form
    setFormData(config);
  }, [config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseFloat(e.target.value);
    if (!isNaN(percentage)) {
      setFormData(prev => ({ ...prev, taxRate: percentage / 100 }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, storeLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setConfig(formData);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">App Settings</h1>
          <p className="text-slate-500">Customize your POS for your business needs.</p>
        </div>
      </div>

      <div className={`max-w-2xl mx-auto w-full p-8 rounded-[2rem] border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <label className="flex items-center gap-2 text-sm font-bold mb-2 text-slate-500">
              <ImageIcon size={16} />
              Store Logo
            </label>
            <div className="flex items-center gap-4">
              <label htmlFor="logo-upload" className={`cursor-pointer w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center text-center p-2 transition-colors ${isDarkMode ? 'border-slate-600 hover:border-emerald-500 hover:bg-slate-700/50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'}`}>
                <input id="logo-upload" type="file" className="hidden" onChange={handleLogoChange} accept="image/png, image/jpeg" />
                {formData.storeLogo ? (
                  <img src={formData.storeLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <ImageIcon size={24} />
                    <span className="text-xs font-semibold">Upload</span>
                  </div>
                )}
              </label>
              {formData.storeLogo && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, storeLogo: ''}))}
                  className={`px-4 py-2 rounded-xl font-bold text-sm text-rose-500 transition-colors ${isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-100'}`}
                >
                  Remove Logo
                </button>
              )}
            </div>
          </div>
          
          <SettingsField
            label="Store Name"
            icon={<Store />}
            isDarkMode={isDarkMode}
          >
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              className={`w-full form-input`}
            />
          </SettingsField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SettingsField label="Currency Symbol" icon={<span className="font-bold text-lg">{formData.currencySymbol}</span>} isDarkMode={isDarkMode}>
              <input
                type="text"
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleInputChange}
                className="w-full form-input"
                maxLength={2}
              />
            </SettingsField>
            <SettingsField label="Tax Rate" icon={<Percent />} isDarkMode={isDarkMode}>
              <div className="relative">
                <input
                  type="number"
                  name="taxRate"
                  value={(formData.taxRate * 100).toFixed(2)}
                  onChange={handleTaxChange}
                  className="w-full form-input pr-8"
                  step="0.01"
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>%</span>
              </div>
            </SettingsField>
          </div>

          <SettingsField label="Contact Phone" icon={<Phone />} isDarkMode={isDarkMode}>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              className="w-full form-input"
            />
          </SettingsField>
          
          <SettingsField label="Receipt Footer Message" icon={<MessageSquare />} isDarkMode={isDarkMode}>
            <textarea
              name="receiptFooterMessage"
              value={formData.receiptFooterMessage}
              onChange={handleInputChange}
              className="w-full form-input"
              rows={3}
            />
          </SettingsField>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="flex items-center justify-center gap-2 w-40 py-3 px-6 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-wait"
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsField: React.FC<{ label: string; icon: React.ReactNode; isDarkMode: boolean, children: React.ReactNode }> = ({ label, icon, isDarkMode, children }) => {
  const baseInputStyle = `px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all`;
  const darkModeStyle = `bg-slate-700 border-slate-600`;
  const lightModeStyle = `bg-slate-50 border-slate-200`;
  
  const childWithClassName = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
        const existingClassName = child.props.className || '';
        const newClassName = `${existingClassName} ${isDarkMode ? darkModeStyle : lightModeStyle}`;
        // Special handling for the div wrapper around the tax input
        if (child.type === 'div') {
            const input = child.props.children[0];
            const styledInput = React.cloneElement(input, { className: `${input.props.className} ${isDarkMode ? darkModeStyle : lightModeStyle}` });
            return React.cloneElement(child, child.props, styledInput, child.props.children[1]);
        }
        return React.cloneElement(child as React.ReactElement<any>, { className: newClassName });
    }
    return child;
  });

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold mb-2 text-slate-500">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
        {label}
      </label>
      {childWithClassName}
    </div>
  );
};


export default SettingsView;
