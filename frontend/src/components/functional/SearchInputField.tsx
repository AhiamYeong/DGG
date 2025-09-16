import { useNavigate } from 'react-router-dom';

interface SearchInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear: () => void;
  icon?: 'search' | 'location';
  searchType?: 'origin' | 'destination' | 'waypoint';
}

export default function SearchInputField({
  value,
  onChange,
  placeholder,
  onClear,
  icon = 'search',
  searchType = 'origin'
}: SearchInputFieldProps) {
  const navigate = useNavigate();

  const handleInputClick = () => {
    // 검색 페이지로 이동하면서 검색 타입 전달
    navigate('/search', { 
      state: { 
        searchType,
        currentValue: value 
      } 
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter 키나 Space 키로도 검색 페이지 이동 가능
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInputClick();
    }
  };
  const iconSvg = icon === 'location' ? (
    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {iconSvg}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 bg-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-font cursor-pointer hover:border-primary transition-colors"
        readOnly
        tabIndex={0}
        aria-label={`${placeholder} - 클릭하여 검색`}
        role="button"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-2 flex items-center"
        >
          <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
