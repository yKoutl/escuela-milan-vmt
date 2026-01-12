import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Notification({ notification }) {
  if (!notification) return null;
  
  return (
    <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-xl text-white font-bold transition-all transform duration-300 flex items-center ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {notification.type === 'error' ? <AlertCircle className="mr-2 h-5 w-5"/> : <CheckCircle className="mr-2 h-5 w-5"/>}
      {notification.message}
    </div>
  );
}
