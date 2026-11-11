import React from "react";
import { useAutocomplete } from "../hooks/useAutocomplete";
import { FaMapMarkerAlt } from "react-icons/fa";

function LocationField({
  id,
  label,
  placeholder,
  value,
  onTextChange,
  onSelect,
  className = "",
  badgeColor = "bg-blue-600",
  rightAction = null,
}) {
  const { suggestions, search, clear } = useAutocomplete();
  const open = suggestions.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          {label}
        </label>
        {rightAction}
      </div>

      <div className="relative flex items-center">
        <span
          className={`w-2.5 h-2.5 rounded-full ${badgeColor} absolute left-3.5 pointer-events-none ring-4 ring-slate-100`}
        />
        <input
          id={id}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          className="w-full pl-9 pr-3.5 py-2.5 text-sm font-medium bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-lg outline-none transition-all placeholder:text-slate-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onTextChange(e.target.value);
            search(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") clear();
          }}
          onBlur={clear}
        />
      </div>

      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-50 border border-slate-200 py-1.5 px-1.5 rounded-xl shadow-xl bg-white max-h-56 overflow-auto text-left divide-y divide-slate-100"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.label}-${i}`}
              role="option"
              aria-selected="false"
              // onMouseDown fires before the input's blur, so the pick isn't lost.
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(s);
                clear();
              }}
              className="px-3 py-2.5 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-medium cursor-pointer rounded-lg flex items-center gap-2.5 transition-colors group"
            >
              <FaMapMarkerAlt className="text-slate-400 group-hover:text-amber-400 shrink-0" />
              <span className="truncate">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationField;