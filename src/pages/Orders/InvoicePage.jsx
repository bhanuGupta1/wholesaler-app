import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const invoiceRef = useRef(null);

const handlePrint = () => {
  const printContents = invoiceRef.current.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload();
   return <div className="mb-6 flex justify-between items-center">
  <Link to={`/orders/${id}`} className="text-indigo-600 hover:text-indigo-900">
    ← Back to Order
  </Link>
  <button
    onClick={handlePrint}
    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    Print Invoice
  </button>
  <table className="min-w-full divide-y divide-gray-200 mb-8">
  <thead>
    <tr>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    {items.map((item) => (
      <tr key={item.id}>
        <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
        </td>
        <td className="px-4 py-4 text-right text-sm text-gray-500">${item.price?.toFixed(2)}</td>
        <td className="px-4 py-4 text-right text-sm text-gray-500">{item.quantity}</td>
        <td className="px-4 py-4 text-right text-sm text-gray-900">
          ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    ))}
  </tbody>
</table>
<div className="flex justify-end">
  <div className="w-64">
    <div className="flex justify-between py-2 border-t">
      <span className="font-medium">Subtotal:</span>
      <span>${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
    </div>
    <div className="flex justify-between py-2">
      <span className="font-medium">Tax:</span>
      <span>$0.00</span>
    </div>
    <div className="flex justify-between py-2 font-bold text-lg border-t">
      <span>Total:</span>
      <span>${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
    </div>
  </div>
</div>

</div>;

};
