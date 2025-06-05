import React, { useState } from 'react';

// MultiSelectDropdown Component
function MultiSelectDropdown({ options, onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    const updatedSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updatedSelection);
    onSelectionChange(updatedSelection);
  };

  const handleRemove = (option) => {
    const updatedSelection = selectedOptions.filter((item) => item !== option);
    setSelectedOptions(updatedSelection);
    onSelectionChange(updatedSelection);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={toggleDropdown}
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-left flex items-center flex-wrap space-x-2 focus:outline-none focus:ring-2 focus:ring-red-600"
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <span
              key={option}
              className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded-full text-sm mr-2 mb-1"
            >
              {option}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown toggle when removing an option
                  handleRemove(option);
                }}
                className="ml-2 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-500">Select options</span>
        )}
        <span className="ml-auto">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg p-2">
          <div className="divide-y divide-gray-200">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleSelect(option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown