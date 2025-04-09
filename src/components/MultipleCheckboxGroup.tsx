
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const toggleOption = (value: string) => {
    onChange(value);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium block">
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
          >
            <Checkbox
              id={`option-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => toggleOption(option.value)}
              className="mt-1"
            />
            <div>
              <Label htmlFor={`option-${option.value}`} className="font-medium cursor-pointer">
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-gray-500">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultipleCheckboxGroup;
