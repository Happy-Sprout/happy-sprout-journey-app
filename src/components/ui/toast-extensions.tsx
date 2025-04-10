
import { toast as originalToast } from "@/hooks/use-toast";

// Extended toast function with additional variants
export function toast(props: Parameters<typeof originalToast>[0]) {
  return originalToast(props);
}

// Warning toast helper
export function warningToast({ title, description }: { title: string; description: string }) {
  return toast({
    title,
    description,
    variant: "default",
    className: "bg-amber-50 border-amber-200 text-amber-800"
  });
}

// Success toast helper
export function successToast({ title, description }: { title: string; description: string }) {
  return toast({
    title,
    description,
    variant: "default",
    className: "bg-green-50 border-green-200 text-green-800"
  });
}
