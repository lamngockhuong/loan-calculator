import { ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500/75 transition-opacity">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">{children}</div>
        <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Close
        </button>
      </div>
    </div>
  );
}
