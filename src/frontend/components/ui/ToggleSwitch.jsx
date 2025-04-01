export default function ToggleSwitch({ label, checked, onChange, id }) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onChange({ target: { checked: !checked } })}
        className={`${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`${
            checked ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
        ></span>
      </button>
    </div>
  );
}
