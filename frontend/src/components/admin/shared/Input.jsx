import React from "react";

export const Input = ({
  placeholder,
  type,
  name,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export const selectInput = ({
  placeholder,
  name,
  value,
  onChange,
  className,
  required,
  options,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const textareaInput = ({
  placeholder,
  name,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export const checkboxInput = ({
  placeholder,
  name,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="checkbox"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export const radioInput = ({
  placeholder,
  name,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="radio"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export const fileInput = ({
  placeholder,
  name,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="file"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export const dateInput = ({
  placeholder,
  name,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export const timeInput = ({
  placeholder,
  name,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="time"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export const rangeInput = ({
  placeholder,
  name,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <div>
      <label htmlFor={name}>{placeholder}</label>
      <input
        type="range"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};
