// This button allows every to use it as prototype of a default basic button.

function Button({
  children,
  onClick,
  variant = 'default',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  const base = 'px-4 py-2 rounded-md font-medium transition cursor-pointer';
  
  const variants = {
    default: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    danger: 'bg-red-600 text-white hover:bg-red-900',
    outline: 'border border-gray-400 bg-sky-100 text-gray-900 hover:bg-gray-400',
    ghost: 'text-blue-700 hover:underline',
  };
  
  const combinedClassName = `${base} ${variants[variant]} 
  ${fullWidth ? 'w-full' : ''} ${className}`; 
  
  return (
    <button type={type} onClick={onClick} className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
  
export default Button;
  