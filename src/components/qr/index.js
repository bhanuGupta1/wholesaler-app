// This file makes it easier to import QR components

// Main components
export { default as QRManagementDashboard } from './QRManagementDashboard';
export { default as CompleteQRScanner } from './CompleteQRScanner';

// Fallback components
export {
  FallbackQRGenerator,
  FallbackQRScanner,
  SmartQRGenerator,
  SmartQRScanner,
  SmartQuickQRButton,
  SmartQRModal
} from './QRFallbackComponents';

// Original components (if libraries are available)
export { QRCodeGenerator, QuickQRButton, QRCodeModal } from './QRCodeDisplay';
export { default as QRCodeScanner } from './QRCodeScanner';