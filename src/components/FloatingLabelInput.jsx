import React, { useState, useRef, useEffect } from "react";
import "./FloatingLabelInput.css";

const FloatingLabelInput = ({ label, id, className, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasValue(!!inputRef.current.value);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
  };

  useEffect(() => {
    setHasValue(!!inputRef.current.value);
  }, []);

  const displayLabel = isFocused || hasValue ? label.split(' (')[0] : label;

  return (
    <div className="floating-label-input-container">
      <input
        id={id}
        ref={inputRef}
        className={`floating-input${className ? ' ' + className : ''}`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
      <label
        htmlFor={id}
        className={`floating-label${isFocused || hasValue ? ' active' : ''}`}
      >
        {displayLabel}
      </label>
    </div>
  );
};

export default FloatingLabelInput;
