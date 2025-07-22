import React from "react";
import "./FloatingLabelInput.css";

const FloatingLabelInput = ({ label, id, className, ...props }) => {
  return (
    <div className="floating-label-input-container">
      <label htmlFor={id} className="floating-label">
        {label}
      </label>
      <input id={id} className={`floating-input${className ? ' ' + className : ''}`} {...props} />
    </div>
  );
};

export default FloatingLabelInput; 