
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCallback } from "react";

type Option = {
  value: string;
  label: string;
  description?: string;
};

interface MultipleCheckboxGroupProps {
  options: Option[];
  selectedValues: string[];
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

const MultipleCheckboxGroup = ({
  options,
  selectedValues,
  onChange,
  label,
  required = false,
}: MultipleCheckboxGroupProps) => {
  // Use useCallback to prevent recreating the function on each render
  const toggleOption = useCallback((value: string) => {
    onChange(value);
  }, [onChange]);

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium block text-left">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.value}
            className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition ${
              selectedValues.includes(option.value)
                ? "bg-sprout-purple/10 border-sprout-purple"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => toggleOption(option.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleOption(option.value);
              }
            }}
            aria-checked={selectedValues.includes(option.value)}
          >
            <div className="mt-1">
              <Checkbox
                id={`option-${option.value}`}
                checked={selectedValues.includes(option.value)}
                // Use an inline function that doesn't call setState directly
                onCheckedChange={() => toggleOption(option.value)}
              />
            </div>
            <div className="text-left">
              <Label htmlFor={`option-${option.value}`} className="font-medium cursor-pointer text-left">
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-gray-500 text-left">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultipleCheckboxGroup;
