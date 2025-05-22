import { useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle as Warning } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', 'full'
  variant = 'default', // 'default', 'danger', 'success', 'warning', 'info'
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = '',
  overlayClassName = '',
  contentClassName = ''
}) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      firstElement?.focus();
      document.addEventListener('keydown', handleTab);

      return () => {
        document.removeEventListener('keydown', handleTab);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'max-w-xs';
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      case '3xl':
        return 'max-w-3xl';
      case '4xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-md';
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <Warning className="h-6 w-6 text-yellow-600" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />;
      default:
        return null;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          header: 'border-b border-red-200 bg-red-50',
          title: 'text-red-900',
          content: 'bg-white'
        };
      case 'success':
        return {
          header: 'border-b border-green-200 bg-green-50',
          title: 'text-green-900',
          content: 'bg-white'
        };
      case 'warning':
        return {
          header: 'border-b border-yellow-200 bg-yellow-50',
          title: 'text-yellow-900',
          content: 'bg-white'
        };
      case 'info':
        return {
          header: 'border-b border-blue-200 bg-blue-50',
          title: 'text-blue-900',
          content: 'bg-white'
        };
      default:
        return {
          header: 'border-b border-gray-200 bg-white',
          title: 'text-gray-900',
          content: 'bg-white'
        };
    }
  };

  const variantClasses = getVariantClasses();
  const icon = getVariantIcon();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        } ${overlayClassName}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative w-full ${getSizeClasses()} transform transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          } ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Modal content */}
          <div className={`rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 ${contentClassName}`}>
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`px-6 py-4 ${variantClasses.header}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {icon}
                    {title && (
                      <h3
                        id="modal-title"
                        className={`text-lg font-semibold ${variantClasses.title}`}
                      >
                        {title}
                      </h3>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className={`px-6 py-4 ${variantClasses.content}`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation Modal Component
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      footer={
        <div className="flex space-x-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : variant === 'success'
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}

// Alert Modal Component
export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  buttonText = 'OK'
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : variant === 'success'
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : variant === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {buttonText}
          </button>
        </div>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}

// Form Modal Component
export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  size = 'md',
  variant = 'default'
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size={size}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {children}
        </div>
        <div className="flex space-x-3 justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              submitText
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Image Modal Component
export function ImageModal({
  isOpen,
  onClose,
  src,
  alt,
  title
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="4xl"
      className="max-h-screen"
    >
      <div className="flex justify-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      </div>
    </Modal>
  );
}

// Loading Modal Component
export function LoadingModal({
  isOpen,
  message = 'Loading...',
  title = 'Please wait'
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing
      title={title}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-center">{message}</p>
      </div>
    </Modal>
  );
}