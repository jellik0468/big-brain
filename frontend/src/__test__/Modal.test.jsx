import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from "vitest";
import Modal from '../components/Modal';

describe('Modal component', () => {
  const modalText = 'This is modal content';
  
  it('should not render content when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}}>
      <p>{modalText}</p>
      </Modal>
    );

    // Should be in the DOM, but hidden (invisible class)
    const modal = screen.queryByText(modalText);
    expect(modal).toBeNull(); // Modal shouldn't render anything visible at all
  });
  
  it('should render children when open is true', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>{modalText}</p>
      </Modal>
    );

    const modalContent = screen.getByText(modalText);
    expect(modalContent).toBeTruthy(); // it exists
  });
  
  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>{modalText}</p>
      </Modal>
    );

    // Get the backdrop by going up from the content
    const backdrop = screen.getByText(modalText).parentElement?.parentElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  
  it('should NOT call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>{modalText}</p>
      </Modal>
    );

    const content = screen.getByText(modalText);
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });
  
  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>{modalText}</p>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});