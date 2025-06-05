import { useState } from "react";
import MultiSelectDropdown from "./MultiSelectDropdown";

const Filters = ({ filters, onFilterChange }) => {
    const [selectedSummaryType, setSelectedSummaryType] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [selectedChapters, setSelectedChapters] = useState([]);
      const handleChapterSelection = (selected) => {
    setSelectedChapters(selected);
  };

  return (
    <div className="mb-5">
          <h1 className="text-3xl font-bold mb-4">Filters:</h1>
          <div className='grid grid-cols-2 gap-2 mt-5'>
            <div className='flex flex-col h-full justify-center'>
              <p className="text-gray-800 text-lg font-semibold mb-2">Select a language for the summary:</p>
              <div className="flex items-center justify-around space-x-4">
                {[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español' },
                  { value: 'fr', label: 'Français' },
                ].map(lang => (
                  <div key={lang.value} className="flex items-center ml-2">
                    <input 
                      id={`language-${lang.value}`} 
                      type="radio" 
                      name="language" 
                      value={lang.value} 
                      className="w-5 h-5"
                      checked={selectedLanguage === lang.value}
                      onChange={() => setSelectedLanguage(lang.value)}
                    />
                    <label 
                      htmlFor={`language-${lang.value}`} 
                      className="ml-2 text-slate-950"
                    >
                      {lang.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex flex-col h-full justify-center'>
              <div className="w-full">
                <p className="text-gray-800 text-lg font-semibold mb-2">Select the type of summary:</p>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                id="summaryType"
                value={selectedSummaryType}
                onChange={(e) => setSelectedSummaryType(e.target.value)}
                >
                  <option value="">Choose a type</option>
                  <option value="flash">Flash Cards</option>
                  <option value="para">Paragraph</option>
                  <option value="point">Bullet Points</option>
                </select>
              </div>
            </div>
          </div>
          <div className="w-full mt-6">
            <p className="text-gray-800 text-lg mb-2">Select the chapters you want to summarize:</p>
            <MultiSelectDropdown
              options={['Introduction', 'Chapter 1', 'Chapter 2', 'Conclusion']}
              value={selectedChapters}
              onSelectionChange={handleChapterSelection}
            />
          </div>
        </div>
  );
}

export default Filters;