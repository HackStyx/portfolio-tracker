import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TextInput, NumberInput, Button } from '@tremor/react';
import axios from 'axios';

// Get API URL from environment variable, fallback to production URL if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

export default function AddStockModal({ open, setOpen, onStockAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    shares: '',
    buy_price: '',
    target_price: ''
  });

  // Log API URL and environment on component mount
  useEffect(() => {
    console.log('Environment:', import.meta.env.MODE);
    console.log('API Base URL:', API_BASE_URL);
    
    // Test API connection
    api.get('/health')
      .then(response => console.log('API Health Check:', response.data))
      .catch(error => console.error('API Health Check Failed:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.ticker || !formData.shares || !formData.buy_price) {
        throw new Error('Please fill in all required fields');
      }

      const requestData = {
        name: formData.name,
        ticker: formData.ticker.toUpperCase(),
        shares: parseFloat(formData.shares),
        buy_price: parseFloat(formData.buy_price),
        target_price: parseFloat(formData.target_price || formData.buy_price)
      };

      console.log('Making API request to:', `${API_BASE_URL}/stocks`);
      console.log('Request data:', requestData);

      const response = await api.post('/stocks', requestData);

      console.log('Stock added successfully:', response.data);
      
      setFormData({
        name: '',
        ticker: '',
        shares: '',
        buy_price: '',
        target_price: ''
      });
      setOpen(false);
      
      if (onStockAdded) {
        onStockAdded(response.data);
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        apiUrl: API_BASE_URL,
        mode: import.meta.env.MODE
      });
      setError(error.response?.data?.error || error.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        Add Stock
                      </Dialog.Title>
                      {error && (
                        <div className="mt-2 text-sm text-red-600">
                          {error}
                        </div>
                      )}
                      <div className="mt-6 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Company Name
                          </label>
                          <TextInput
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter company name"
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="ticker" className="block text-sm font-medium text-gray-700">
                            Stock Symbol
                          </label>
                          <TextInput
                            id="ticker"
                            name="ticker"
                            value={formData.ticker}
                            onChange={handleChange}
                            placeholder="Enter stock symbol (e.g., AAPL)"
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="shares" className="block text-sm font-medium text-gray-700">
                            Number of Shares
                          </label>
                          <NumberInput
                            id="shares"
                            name="shares"
                            value={formData.shares}
                            onChange={handleChange}
                            placeholder="Enter number of shares"
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="buy_price" className="block text-sm font-medium text-gray-700">
                            Buy Price
                          </label>
                          <NumberInput
                            id="buy_price"
                            name="buy_price"
                            value={formData.buy_price}
                            onChange={handleChange}
                            placeholder="Enter buy price"
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="target_price" className="block text-sm font-medium text-gray-700">
                            Target Price (Optional)
                          </label>
                          <NumberInput
                            id="target_price"
                            name="target_price"
                            value={formData.target_price}
                            onChange={handleChange}
                            placeholder="Enter target price"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full sm:w-auto sm:ml-3"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Stock'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 w-full sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 