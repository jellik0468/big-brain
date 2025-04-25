// Component for input field that build input

function EnterInput({
  id,
  type = 'text',
  value,
  onChange,
  onEnter,
  label,
  required = true,
  placeholder,
  ...props
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter?.();
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <div className="mt-2">
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1
            -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          {...props}
        />
      </div>
    </div>
  );
}

export default EnterInput;