
import React, { useState, useRef, useEffect } from 'react';

interface DeviceSelectorProps {
  availableDevices: string[];
  selectedDevices: string[];
  onChange: (selected: string[]) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ availableDevices, selectedDevices, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (device: string) => {
    const newSelection = selectedDevices.includes(device)
      ? selectedDevices.filter((d) => d !== device)
      : [...selectedDevices, device];
    onChange(newSelection);
  };

  return (
    <div className="relative font-sans" ref={wrapperRef}>
       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Devices</label>
      <button
        type="button"
        className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center flex-wrap gap-1">
          {selectedDevices.length > 0 ? (
            selectedDevices.map(device => (
              <span key={device} className="inline-block bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-100 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {device}
              </span>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Select one or more devices...</span>
          )}
        </span>
        <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg z-10">
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {availableDevices.map((device) => (
              <li
                key={device}
                className="text-gray-900 dark:text-gray-200 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-primary-100 dark:hover:bg-primary-800"
                onClick={() => handleSelect(device)}
              >
                <span className={`block truncate ${selectedDevices.includes(device) ? 'font-semibold' : 'font-normal'}`}>
                  {device}
                </span>
                {selectedDevices.includes(device) && (
                  <span className="text-primary-600 absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DeviceSelector;
