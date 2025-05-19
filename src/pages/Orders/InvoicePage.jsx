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
</div>;
};
