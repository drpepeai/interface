import { useState } from "react";

export default function CheckboxContainer({ title, items, onSelect, selected }: { title: string, items: CheckboxItem[], onSelect: (item: string) => void, selected: string[] }) {
  return (
    <fieldset className="border-b border-t border-gray-200">
      <legend className="sr-only">{title}</legend>
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <Checkbox key={item.id} item={item} onSelect={onSelect} selected={selected} />
        ))}
      </div>
    </fieldset>
  )
}

interface CheckboxItem {
  label: string;
  description: string;
  id: string;
}

function Checkbox({ item, onSelect, selected }: { item: CheckboxItem, onSelect: (item: string) => void, selected: string[] }) {
  const [checked, setChecked] = useState(selected.includes(item.id));

  function handleSelect() {
    setChecked(!checked)
    onSelect(item.id);
  }

  return (
    <div className="relative flex gap-3 pb-4 pt-3.5">
      <div className="min-w-0 flex-1 text-sm/6">
        <label htmlFor={item.id} className="font-medium text-gray-900">
          {item.label}
        </label>
        <p id={item.id} className="text-gray-500">
          {item.description}
        </p>
      </div>
      <div className="flex h-6 shrink-0 items-center">
        <div className="group grid size-4 grid-cols-1">
          <input
            id={item.id}
            name={item.id}
            type="checkbox"
            aria-describedby={item.id}
            className={`col-start-1 row-start-1 appearance-none rounded border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto ${checked ? 'border-indigo-600 bg-indigo-600' : 'bg-white border-gray-300'}`}
            onChange={handleSelect}
          />
          <svg
            fill="none"
            viewBox="0 0 14 14"
            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
          >
            <path
              d="M3 8L6 11L11 3.5"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${checked ? 'opacity-100' : 'opacity-0'}`}
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
