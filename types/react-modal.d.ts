declare module 'react-modal' {
    import * as React from 'react';
  
    interface ModalProps {
      isOpen: boolean;
      onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
      contentLabel: string;
      className?: string | object;
      overlayClassName?: string | object;
      appElement?: HTMLElement | {};
      onAfterOpen?: () => void;
      onAfterClose?: () => void;
      ariaHideApp?: boolean;
      closeTimeoutMS?: number;
      style?: {
        content?: object;
        overlay?: object;
      };
      shouldFocusAfterRender?: boolean;
      shouldCloseOnOverlayClick?: boolean;
      shouldCloseOnEsc?: boolean;
      shouldReturnFocusAfterClose?: boolean;
      parentSelector?: () => HTMLElement;
      aria?: {
        [key: string]: string;
      };
      role?: string;
      contentRef?: (instance: HTMLDivElement) => void;
      overlayRef?: (instance: HTMLDivElement) => void;
      id?: string;
      testId?: string;
      portalClassName?: string;
      children?: React.ReactNode;  // Add this line
    }
  
    interface Modal extends React.FC<ModalProps> {
      setAppElement(element: string | HTMLElement): void;
    }
  
    const Modal: Modal;
    export default Modal;
  }
  