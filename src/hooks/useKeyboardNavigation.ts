
import { useState, useEffect, useCallback } from 'react';

interface NavigationItem {
  id: string;
  element: HTMLElement;
  section: string;
}

export const useKeyboardNavigation = (items: NavigationItem[] = []) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedSection, setFocusedSection] = useState('');

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (items.length === 0) return;

    const currentSection = focusedSection || items[0]?.section;
    const sectionItems = items.filter(item => item.section === currentSection);
    const currentIndexInSection = sectionItems.findIndex(item => item.id === items[focusedIndex]?.id);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (currentSection === 'filters') {
          // Move from filters to search or media grid
          const mediaItems = items.filter(item => item.section === 'media-grid');
          if (mediaItems.length > 0) {
            const newIndex = items.findIndex(item => item.id === mediaItems[0].id);
            setFocusedIndex(newIndex);
            setFocusedSection('media-grid');
          }
        } else if (currentSection === 'media-grid') {
          // Move down in grid (assuming 6 columns)
          const nextRowIndex = currentIndexInSection + 6;
          if (nextRowIndex < sectionItems.length) {
            const newIndex = items.findIndex(item => item.id === sectionItems[nextRowIndex].id);
            setFocusedIndex(newIndex);
          }
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (currentSection === 'media-grid') {
          const prevRowIndex = currentIndexInSection - 6;
          if (prevRowIndex >= 0) {
            const newIndex = items.findIndex(item => item.id === sectionItems[prevRowIndex].id);
            setFocusedIndex(newIndex);
          } else {
            // Move to filters
            const filterItems = items.filter(item => item.section === 'filters');
            if (filterItems.length > 0) {
              const newIndex = items.findIndex(item => item.id === filterItems[0].id);
              setFocusedIndex(newIndex);
              setFocusedSection('filters');
            }
          }
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (currentIndexInSection > 0) {
          const newIndex = items.findIndex(item => item.id === sectionItems[currentIndexInSection - 1].id);
          setFocusedIndex(newIndex);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (currentIndexInSection < sectionItems.length - 1) {
          const newIndex = items.findIndex(item => item.id === sectionItems[currentIndexInSection + 1].id);
          setFocusedIndex(newIndex);
        }
        break;

      case 'Enter':
        event.preventDefault();
        const focusedElement = items[focusedIndex]?.element;
        if (focusedElement) {
          focusedElement.click();
        }
        break;

      case 'Escape':
        event.preventDefault();
        // This will be handled by parent components for closing modals
        break;
    }
  }, [items, focusedIndex, focusedSection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (items.length > 0 && focusedIndex < items.length) {
      const focusedItem = items[focusedIndex];
      if (focusedItem?.element) {
        focusedItem.element.focus();
        setFocusedSection(focusedItem.section);
      }
    }
  }, [focusedIndex, items]);

  return {
    focusedIndex,
    setFocusedIndex,
    focusedSection,
    setFocusedSection
  };
};
