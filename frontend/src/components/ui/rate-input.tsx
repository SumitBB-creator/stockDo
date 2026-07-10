import * as React from "react"
import { Input } from "@/components/ui/input"

export const RateInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onValueChange?: (value: number) => void;
    value?: number | string;
  }
>(({ className, onValueChange, value, onChange, onBlur, ...props }, ref) => {
  const formatInitial = (val: any) => {
    if (val !== undefined && val !== null && val !== '') {
      return Number(val).toFixed(2);
    }
    return "";
  };

  const [displayValue, setDisplayValue] = React.useState<string>(formatInitial(value));

  // Sync prop value to local display string without interfering with typing
  React.useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      // Avoid overwriting a valid typed string (like "70.") if it's numerically equivalent to `value`
      if (parseFloat(value as string) !== parseFloat(displayValue)) {
        setDisplayValue(Number(value).toFixed(2));
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
    
    // Pass standard onChange event if provided (useful for react-hook-form)
    if (onChange) {
      onChange(e);
    }
    
    // Optional utility callback
    if (onValueChange) {
      const parsed = parseFloat(e.target.value);
      onValueChange(isNaN(parsed) ? 0 : parsed);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (displayValue) {
      const parsed = parseFloat(displayValue);
      if (!isNaN(parsed)) {
        const formatted = parsed.toFixed(2);
        setDisplayValue(formatted);
        
        // Emulate an onChange event to push the formatted string back to the form state
        // React-hook-form will receive this and (if using parseFloat in its own onChange) re-evaluate.
        if (onChange) {
            const simulatedEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: formatted
                }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(simulatedEvent);
        }
      }
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <Input
      type="number"
      step="0.01"
      className={className}
      ref={ref}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  )
})
RateInput.displayName = "RateInput"
