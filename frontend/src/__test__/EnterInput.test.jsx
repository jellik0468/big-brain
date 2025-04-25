/// <reference types="vitest" />
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnterInput from '../components/EnterInput';

describe('EnterInput component', () => {
  const labelText = 'Test Input';

  // Test that the component renders a label when provided
  it('renders with a label', () => {
    render(
      <EnterInput
        id="test"
        label={labelText}
        value=""
        onChange={() => {}}
      />
    );

    // Look for the label text, linked to the input via htmlFor / id
    expect(screen.getByLabelText(labelText)).toBeTruthy();
  });

  // Test that the input displays the correct initial value
  it('renders with the correct value', () => {
    render(
      <EnterInput
        id="test"
        label={labelText}
        value="Hello"
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText(labelText);
    expect(input.value).toBe('Hello');
  });

  // Test that the onChange handler is called when the user types
  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(
      <EnterInput
        id="test"
        label={labelText}
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(labelText);
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // Test that pressing Enter calls the onEnter callback
  it('calls onEnter when Enter key is pressed', () => {
    const handleEnter = vi.fn();
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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleEnter).toHaveBeenCalledTimes(1);
  });

  // Test that pressing Enter does NOT crash the component when onEnter is missing
  it('does not throw if onEnter is not provided', () => {
    render(
      <EnterInput
        id="test"
        label={labelText}
        value=""
        onChange={() => {}}
        // no onEnter
      />
    );

    const input = screen.getByLabelText(labelText);
    expect(() => {
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    }).not.toThrow();
  });
});
