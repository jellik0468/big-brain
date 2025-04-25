import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from "vitest";
import Modal from '../components/Modal';

describe('Modal component', () => {
  const modalText = 'This is modal content'; // text inside modal

  // Test: Modal should not render any content when `open` is false
  it('should not render content when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>{modalText}</p>
      </Modal>
    );

    // Try to find the modal text; expect it NOT to exist
    const modal = screen.queryByText(modalText);
    expect(modal).toBeNull(); // Modal should not be visible at all
  });

  // Test: Modal should render its children when `open` is true
  it('should render children when open is true', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>{modalText}</p>
      </Modal>
    );

    // The modal content should be in the document
    const modalContent = screen.getByText(modalText);
    expect(modalContent).toBeTruthy(); // Modal content should exist
  });

  // Test: Clicking the backdrop should call `onClose`
  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn(); // create mock function for onClose
    render(
      <Modal open={true} onClose={onClose}>
        <p>{modalText}</p>
      </Modal>
    );

    // Find the backdrop by traversing up from the modal content
    const backdrop = screen.getByText(modalText).parentElement?.parentElement;
    fireEvent.click(backdrop); // simulate clicking the backdrop
    expect(onClose).toHaveBeenCalledTimes(1); // onClose should be called once
  });

  // Test: Clicking inside the modal content should NOT call `onClose`
  it('should NOT call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>{modalText}</p>
      </Modal>
    );

    const content = screen.getByText(modalText);
    fireEvent.click(content); // simulate clicking inside modal
    expect(onClose).not.toHaveBeenCalled(); // onClose should NOT be called
  });

  // Test: Clicking the close button should call `onClose`
  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>{modalText}</p>
      </Modal>
    );

    // Find the close button by its role and name
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton); // simulate clicking close button
    expect(onClose).toHaveBeenCalledTimes(1); // onClose should be called
  });

});