import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/MyButton';
import { vi } from 'vitest';

describe('Button component', () => {
  
  // Test: It should render children text correctly
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    // Expect the text "Click Me" to be visible in the document
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  // Test: It should call onClick handler when clicked
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn(); // create a mock function
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText('Click Me')); // simulate a click
    expect(handleClick).toHaveBeenCalledTimes(1); // expect the handler to be called once
  });

  // Test: It should apply the correct class based on the "variant" prop
  it('applies the correct variant class', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    // Expect the button to have the primary color class
    expect(container.firstChild).toHaveClass('bg-blue-600');
  });

  // Test: It should apply "w-full" class when fullWidth prop is true
  it('applies fullWidth class when fullWidth prop is true', () => {
    const { container } = render(<Button fullWidth>Full Width</Button>);
    // Expect the button to have full width class
    expect(container.firstChild).toHaveClass('w-full');
  });

  // Test: It should have type="button" by default
  it('uses button as default type', () => {
    render(<Button>Submit</Button>);
    // Expect the rendered button to have type="button"
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  // Test: It should allow setting a custom type attribute
  it('can set custom type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    // Expect the rendered button to have type="submit"
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});