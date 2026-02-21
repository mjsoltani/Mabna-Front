import { useState } from 'react';
import ChangeHistoryModal from './ChangeHistoryModal';

function ChangeHistoryButton({
  entityType,
  entityId,
  entityTitle,
  variant = 'secondary',
  size = 'md',
  className = ''
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100'
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          inline-flex items-center gap-2 rounded-md font-medium transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        aria-label="مشاهده تاریخچه تغییرات"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>تاریخچه تغییرات</span>
      </button>

      <ChangeHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType={entityType}
        entityId={entityId}
        entityTitle={entityTitle}
      />
    </>
  );
}

export default ChangeHistoryButton;
