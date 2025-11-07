import React, { useEffect, useMemo, useState } from 'react';
import { api, getBaseUrl } from '../../api/client';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('');

  const swaggerUrl = useMemo(() => `${getBaseUrl()}/swagger/index.html`, []);

  const loadPayments = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      if (forceRefresh) {
        api.clearCache();
      }
      
      const data = await api.get('/api/PaymentFille');
      setPayments(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      setError(e?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);
  

  const handleStatusChange = async (payment, newStatus) => {
    try {
      const paymentUpdateBody = { status: newStatus };
      await api.put(`/api/PaymentFille/${payment.id}`, paymentUpdateBody);
      
      if (newStatus === 1) {
        try {
          const enrollmentBody = {
            date: new Date().toISOString(),
            userId: Number(payment.userId),
            courseId: Number(payment.courseId)
          };
          await api.post('/api/Enrollment', enrollmentBody);
        } catch (enrollmentErr) {
         
        }
      }
      
      await loadPayments();
    } catch (err) {
      alert(err?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusValue = typeof status === 'number' ? status : 0;
    const configs = {
      0: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      1: { label: 'Approved', classes: 'bg-green-100 text-green-800 border-green-200' }
    };
    const config = configs[statusValue] || configs[0];
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
   
    if (filePath.startsWith('http')) return filePath;
 
    return `${getBaseUrl()}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
  };

  // Image modal component
  const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div className="relative max-w-4xl max-h-full">
          <img 
            src={imageUrl}
            alt="Payment Proof"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl shadow-sm">
          <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Existing Payments</h2>
             
           
              </div>
              <button
                onClick={() => loadPayments(true)}
                className="w-full sm:w-auto text-sm text-sky-400 hover:text-sky-600 font-medium transition-colors text-left sm:text-right"
              >
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="m-3 sm:m-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">Loading…</div>
          ) : payments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-500 text-sm">No payments found.</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-gray-200">
                {payments.map((payment, idx) => {
                  const currentStatus = typeof payment.status === 'number' ? payment.status : (typeof payment.state === 'number' ? payment.state : 0);
                  return (
                    <div key={payment.id || idx} className="p-4 space-y-3 bg-white hover:bg-gray-50">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500">Payment ID</span>
                          <span className="text-sm font-semibold text-gray-900">{payment.id ?? '-'}</span>
                        </div>
                        {getStatusBadge(currentStatus)}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 block mb-1">User ID</span>
                          <span className="text-sm text-gray-900">{payment.userId ?? '-'}</span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500 block mb-1">Course ID</span>
                          <span className="text-sm text-gray-900">{payment.courseId ?? '-'}</span>
                        </div>

                        {(payment.url || payment.file) && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 block mb-1">Payment Proof</span>
                            <button 
                              onClick={() => {
                                const fileUrl = getFileUrl(payment.url || payment.file);
                                setSelectedImage(fileUrl);
                              }}
                              className="text-sm text-sky-400 hover:text-sky-600 break-all inline-block"
                            >
                              View Payment Proof →
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 space-y-2">
                        <label className="text-xs font-medium text-gray-500 block">Update Status</label>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(payment, Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>Pending</option>
                          <option value={1}>Approved</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">URL</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">User ID</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Course ID</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment, idx) => {
                      const currentStatus = typeof payment.status === 'number' ? payment.status : (typeof payment.state === 'number' ? payment.state : 0);
                      return (
                        <tr key={payment.id || idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{payment.id ?? '-'}</td>
                          <td className="px-4 py-3">
                            {(payment.url || payment.file) ? (
                              <button 
                                onClick={() => {
                                  const fileUrl = getFileUrl(payment.url || payment.file);
                                  setSelectedImage(fileUrl);
                                }}
                                className="text-sky-400 hover:text-sky-600 break-all"
                              >
                                View Proof
                              </button>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{payment.userId ?? '-'}</td>
                          <td className="px-4 py-3 text-gray-700">{payment.courseId ?? '-'}</td>
                          <td className="px-4 py-3">
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(payment, Number(e.target.value))}
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={0}>Pending</option>
                              <option value={1}>Approved</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => loadPayments(true)}
                              className="text-sky-400 hover:text-sky-600 font-medium transition-colors"
                            >
                              Reload
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Image Modal */}
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};

export default Payments;