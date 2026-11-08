import React from "react";
import { useAutocomplete } from "../hooks/useAutocomplete";

function LocationField({ id, label, placeholder, value, onTextChange, onSelect, className = "" }) {
  const { suggestions, search, clear } = useAutocomplete();
  const open = suggestions.length > 0;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-gray-700 font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        className={`w-full mt-1 p-3 border border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none ${
          open ? "rounded-t-xl" : "rounded-xl"
        }`}
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
      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="border border-gray-300 border-t-0 mb-4 py-1 px-2 rounded-b-xl shadow-md bg-white max-h-48 overflow-auto text-left"
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
              className="p-3 hover:bg-gray-100 cursor-pointer rounded-lg"
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationField;