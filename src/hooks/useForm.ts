import { useState, useCallback, ChangeEvent } from 'react';
import { ValidationResult, validateField, FieldValidation } from '../utils/validation';

export interface FormField extends FieldValidation {
  name: string;
  value: string;
  touched: boolean;
  error: string;
}

interface FormConfig {
  [key: string]: Omit<FormField, 'touched' | 'error'>;
}

interface UseFormResult {
  fields: { [key: string]: FormField };
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (name: string) => void;
  setFieldValue: (name: string, value: string) => void;
  resetForm: () => void;
  isValid: boolean;
  isDirty: boolean;
}

export const useForm = (config: FormConfig): UseFormResult => {
  const initialFields = Object.entries(config).reduce((acc, [name, field]) => {
    acc[name] = {
      ...field,
      touched: false,
      error: ''
    };
    return acc;
  }, {} as { [key: string]: FormField });

  const [fields, setFields] = useState(initialFields);

  const validateFormField = useCallback((name: string, value: string): ValidationResult => {
    const field = config[name];
    return validateField({
      value,
      required: field.required,
      minLength: field.minLength,
      maxLength: field.maxLength,
      pattern: field.pattern,
      customValidator: field.customValidator
    });
  }, [config]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const validation = validateFormField(name, value);
    
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: prev[name].touched ? validation.error : '',
      }
    }));
  }, [validateFormField]);

  const handleBlur = useCallback((name: string) => {
    const field = fields[name];
    const validation = validateFormField(name, field.value);
    
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error: validation.error
      }
    }));
  }, [fields, validateFormField]);

  const setFieldValue = useCallback((name: string, value: string) => {
    const validation = validateFormField(name, value);
    
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        touched: true,
        error: validation.error
      }
    }));
  }, [validateFormField]);

  const resetForm = useCallback(() => {
    setFields(initialFields);
  }, [initialFields]);

  const isValid = Object.values(fields).every(
    field => (!field.required || field.value) && !field.error
  );

  const isDirty = Object.values(fields).some(
    field => field.touched && field.value !== config[field.name].value
  );

  return {
    fields,
    handleChange,
    handleBlur,
    setFieldValue,
    resetForm,
    isValid,
    isDirty
  };
}; 