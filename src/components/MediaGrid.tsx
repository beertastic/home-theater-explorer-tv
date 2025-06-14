
import React from 'react';
import MediaCard from './MediaCard';
import MediaPagination from './MediaPagination';
import { MediaItem } from '@/types/media';

interface MediaGridProps {
  media: MediaItem[];
  onMediaSelect: (media: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  showDateAdded: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  activeFilter: string;
  mediaRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  focusedSection: string;
  navigationItems: any[];
  focusedIndex: number;
}

const MediaGrid = ({
  media,
  onMediaSelect,
  onToggleFavorite,
  showDateAdded,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  activeFilter,
  mediaRefs,
  focusedSection,
  navigationItems,
  focusedIndex
}: MediaGridProps) => {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {media.map((mediaItem, index) => (
          <MediaCard
            key={mediaItem.id}
            ref={(el) => mediaRefs.current[index] = el}
            media={mediaItem}
            onClick={() => onMediaSelect(mediaItem)}
            showDateAdded={showDateAdded}
            onToggleFavorite={onToggleFavorite}
            isFocused={focusedSection === 'media-grid' && navigationItems[focusedIndex]?.id === `media-${index}`}
          />
        ))}
      </div>

      <MediaPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      <div className="mt-8 text-center text-gray-400">
        Showing {totalItems} items
        {activeFilter === 'recently-added' && ' (sorted by date added)'}
        {activeFilter === 'in-progress' && ' (sorted by last watched)'}
      </div>
    </>
  );
};

export default MediaGrid;
