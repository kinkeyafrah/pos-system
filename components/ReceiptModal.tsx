
import React from 'react';
import { ShoppingCart, Printer, X } from 'lucide-react';
import { Transaction, UnitOfMeasure, AppConfig } from '../types';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
  isDarkMode: boolean;
  config: AppConfig;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose, isDarkMode, config }) => {
  const subtotal = transaction.total - transaction.tax;

  const printReceipt = () => {
    const receiptElement = document.getElementById('printable-receipt');
    if (!receiptElement) return;

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) {
      alert('Please allow popups to print receipts.');
      return;
    }

    const contentToPrint = receiptElement.innerHTML;

    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt - ${transaction.id}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                    @media print {
                        body, html { width: 100%; margin: 0; padding: 0; }
                    }
                </style>
            </head>
            <body class="p-8 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}">
                <div class="max-w-sm mx-auto text-center">
                    ${contentToPrint}
                </div>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300 receipt-modal-wrapper">
      <div className="w-full max-w-sm mx-auto">
        <div className={`receipt-container rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
          <div id="printable-receipt" className="p-8 text-center">
            {config.storeLogo ? (
              <>
                <img src={config.storeLogo} alt={`${config.storeName} Logo`} className="w-24 h-auto max-h-16 mx-auto mb-2 object-contain" />
                <h1 className="text-xl font-bold tracking-tight">{config.storeName}</h1>
              </>
            ) : (
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="bg-emerald-600 p-2 rounded-lg inline-block">
                  <ShoppingCart className="text-white w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">{config.storeName}</h1>
              </div>
            )}
            <p className="text-xs text-slate-500">123 Market St, Mogadishu</p>
            <p className="text-xs text-slate-500">{config.contactPhone}</p>

            <div className="my-6 border-t border-b border-dashed py-4 space-y-2 text-left">
              {transaction.items.map(item => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <p className="font-bold">{item.product.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.product.uom === UnitOfMeasure.KG
                        ? `${item.weight?.toFixed(2)}kg @ ${config.currencySymbol}${item.product.price.toFixed(2)}/kg`
                        : `${item.quantity} x ${config.currencySymbol}${item.product.price.toFixed(2)}`}
                    </p>
                  </div>
                  <p className="font-bold w-16 text-right">
                    {config.currencySymbol}{((item.product.uom === UnitOfMeasure.KG ? (item.weight || 0) : item.quantity) * item.product.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-sm text-right font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>{config.currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax ({(config.taxRate * 100).toFixed(0)}%):</span>
                <span>{config.currencySymbol}{transaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black mt-2">
                <span>Total:</span>
                <span className="text-emerald-600">{config.currencySymbol}{transaction.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed text-xs text-slate-500 text-center">
              <p>Transaction ID: {transaction.id}</p>
              <p>Date: {new Date(transaction.timestamp).toLocaleString()}</p>
              <p className="font-bold mt-4">{config.receiptFooterMessage}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 no-print">
            <button
              onClick={printReceipt}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-700 text-white font-bold hover:bg-slate-800 transition-colors"
            >
              <Printer size={18} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all"
            >
              Start New Sale
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
