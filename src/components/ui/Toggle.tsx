interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-crimson"
      />
      {label}
    </label>
  );
}
