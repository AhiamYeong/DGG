import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import type { BookmarkRoute } from '@/types/bookmark';

interface EditBookmarkModalProps {
  isOpen: boolean;
  bookmark: BookmarkRoute | null;
  onClose: () => void;
  onSave: (bookmarkId: number, newName: string) => Promise<void>;
}

export default function EditBookmarkModal({
  isOpen,
  bookmark,
  onClose,
  onSave
}: EditBookmarkModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('EditBookmarkModal 렌더링:', { isOpen, bookmark });

  // 모달이 열릴 때마다 북마크 이름 초기화
  useEffect(() => {
    if (bookmark) {
      setName(bookmark.name);
    }
  }, [bookmark]);

  const handleSave = async () => {
    if (!bookmark || !name.trim()) return;

    setIsLoading(true);
    try {
      await onSave(bookmark.bookmarkRouteId, name.trim());
      onClose();
    } catch (error) {
      console.error('즐겨찾기 이름 수정 실패:', error);
      alert('즐겨찾기 이름 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !bookmark) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">즐겨찾기 편집</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {/* 경로 정보 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">경로</div>
            <div className="font-medium text-gray-800">
              {bookmark.departureName} → {bookmark.destinationName}
            </div>
          </div>

          {/* 이름 입력 */}
          <div className="mb-6">
            <label htmlFor="bookmark-name" className="block text-sm font-medium text-gray-700 mb-2">
              즐겨찾기 이름
            </label>
            <input
              id="bookmark-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="즐겨찾기 이름을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              className="flex-1"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
