import React from "react";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = "",
  ...rest
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
        </label>
      )}

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`input ${error ? "input-error" : ""} ${className}`}
        {...rest}
      />

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default Input;