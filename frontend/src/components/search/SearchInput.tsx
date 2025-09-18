import { useNavigate } from 'react-router-dom';
import { LocationInput } from '../ui/Input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear: () => void;
  icon?: 'search' | 'location';
  searchType?: 'origin' | 'destination' | 'waypoint';
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  onClear,
  searchType = 'origin'
}: SearchInputProps) {
  const navigate = useNavigate();

  const handleSearch = () => {
    // 검색 페이지로 이동하면서 검색 타입 전달
    navigate('/search', { 
      state: { 
        searchType,
        currentValue: value 
      } 
    });
  };

  // LocationInput을 사용하여 코드 간소화
  return (
    <LocationInput
      type={searchType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onSearch={handleSearch}
      onClear={onClear}
      showClear={!!value}
      placeholder={placeholder}
    />
  );
}