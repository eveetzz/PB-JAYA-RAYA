const controlClass =
  'w-full h-10 px-3 text-sm bg-white border border-line rounded text-ink placeholder:text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 disabled:bg-surface disabled:text-muted';

export function SectionLabel({ children }) {
  return (
    <span className="font-bold text-sm text-[#b80012] tracking-wide">
      {children}
    </span>
  );
}

export function Field({ label, required = false, children }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <label className="text-xs font-semibold text-[#5f5e5e]">
        {label} {required && <span className="text-[#b80012]">*</span>}
      </label>
      {children}
    </div>
  );
}

export function InputBox({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  name,
}) {
  return (
    <input
      name={name}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={controlClass}
    />
  );
}

export function DateBox({ value, onChange, disabled = false }) {
  return (
    <input
      type="date"
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
      className={controlClass}
    />
  );
}

export function YearBox({ value, onChange, disabled = false }) {
  return (
    <input
      type="number"
      min="1900"
      max={new Date().getFullYear()}
      value={value ?? ''}
      onChange={onChange}
      placeholder="2012"
      disabled={disabled}
      className={controlClass}
    />
  );
}

export function SelectBox({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  disabled = false,
}) {
  const normalized =
    options.length && typeof options[0] === 'string'
      ? options.map((option) => ({ value: option, label: option }))
      : options;

  return (
    <select
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
      className={controlClass}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {normalized.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}