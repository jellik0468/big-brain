import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnterInput from '../components/EnterInput';

describe('EnterInput component', () => {
  const labelText = 'Test Input'; // Label text used across tests

  // Test: Check if the component renders a label properly
  it('renders with a label', () => {
    render(
      <EnterInput
        id="test"
        label={labelText}
        value=""
        onChange={() => {}}
      />
    );

    // Expect the label to correctly connect to the input field
    expect(screen.getByLabelText(labelText)).toBeTruthy();
  });

  // Test: Check if the input displays the correct initial value
  it('renders with the correct value', () => {
    render(
      <EnterInput
        id="test"
        label={labelText}
        value="Hello"
        onChange={() => {}}
      />
    );

    // Find the input field by label and check its value
    const input = screen.getByLabelText(labelText);
    expect(input.value).toBe('Hello');
  });

  // Test: Verify that typing triggers the onChange handler
  it('calls onChange when typing', () => {
    const handleChange = vi.fn(); // Mock function for onChange
    render(
      <EnterInput
        id="test"
        label={labelText}
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(labelText);
    fireEvent.change(input, { target: { value: 'abc' } }); // Simulate typing
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // Test: Verify that pressing Enter triggers the onEnter handler
  it('calls onEnter when Enter key is pressed', () => {
    const handleEnter = vi.fn(); // Mock function for onEnter
    render(
      <EnterInput
        id="test"
        label={labelText}
        value=""
        onChange={() => {}}
        onEnter={handleEnter}
      />
    );

    const input = screen.getByLabelText(labelText);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' }); // Simulate pressing Enter
    expect(handleEnter).toHaveBeenCalledTimes(1);
  });

  // Test: Ensure that pressing Enter does not crash even without onEnter prop
  it('does not throw if onEnter is not provided', () => {
    render(
      <EnterInput
        id="test"
        label={labelText}
        value=""
        onChange={() => {}}
        // no onEnter provided
      />
    );

    const input = screen.getByLabelText(labelText);

    // Ensure no errors are thrown when pressing Enter without onEnter handler
    expect(() => {
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    }).not.toThrow();
  });
});