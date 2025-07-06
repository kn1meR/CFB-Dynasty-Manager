import { toast } from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'loading';

interface NotificationOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

const defaultOptions: NotificationOptions = {
  duration: 2000,
  position: 'top-right'
};

export const notify = (
  message: string,
  type: NotificationType = 'success',
  options: NotificationOptions = {}
) => {
  const mergedOptions = { ...defaultOptions, ...options };

  switch (type) {
    case 'success':
      return toast.success(message, mergedOptions);
    case 'error':
      return toast.error(message, mergedOptions);
    case 'loading':
      return toast.loading(message, mergedOptions);
    default:
      return toast(message, mergedOptions);
  }
};

export const notifySuccess = (message: string, options?: NotificationOptions) => {
  return notify(message, 'success', options);
};

export const notifyError = (message: string, options?: NotificationOptions) => {
  return notify(message, 'error', options);
};

export const notifyLoading = (message: string, options?: NotificationOptions) => {
  return notify(message, 'loading', options);
};

// Common notification messages
export const MESSAGES = {
  SAVE_SUCCESS: 'Changes saved successfully',
  SAVE_ERROR: 'Failed to save changes',
  DELETE_SUCCESS: 'Item deleted successfully',
  DELETE_ERROR: 'Failed to delete item',
  UPDATE_SUCCESS: 'Update successful',
  UPDATE_ERROR: 'Update failed',
  ADD_SUCCESS: 'Item added successfully',
  ADD_ERROR: 'Failed to add item',
  GENERIC_ERROR: 'An error occurred. Please try again.',
  LOADING: 'Processing...',
  LOAD_ERROR: 'Error Loading!'
} as const;
