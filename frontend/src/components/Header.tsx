import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary-600">
            WebView App
          </Link>
          <div className="flex space-x-2 sm:space-x-4">
            <Link 
              to="/" 
              className="text-sm sm:text-base text-gray-600 hover:text-primary-600 transition-colors px-2 py-1 rounded"
            >
              홈
            </Link>
            <Link 
              to="/about" 
              className="text-sm sm:text-base text-gray-600 hover:text-primary-600 transition-colors px-2 py-1 rounded"
            >
              소개
            </Link>
            <Link 
              to="/map-test" 
              className="text-sm sm:text-base text-gray-600 hover:text-primary-600 transition-colors px-2 py-1 rounded"
            >
              지도 테스트
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
