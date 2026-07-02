import React from "react";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  options = [],
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

      {type === "dropdown" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`input ${error ? "input-error" : ""} ${className}`}
          {...rest}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
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
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default Input;