# Story A1: Instant Search Feedback & Highlighting

**Priority**: High  
**Estimated Time**: 30-40 minutes  
**Dependencies**: Story A0 (for more content to search)

**As a** user searching for words  
**I want** immediate visual feedback and highlighted search terms  
**So that** I can quickly see matching content and understand search results

### **Acceptance Criteria:**

#### **Search Term Highlighting**

- [ ] **Italian text highlighting**: Bold or colored background for matching text in word.italian
- [ ] **English translation highlighting**: Highlight matches in all translations
- [ ] **Case-insensitive matching**: “Casa” matches “casa”
- [ ] **Partial word matching**: “parl” highlights “parlare”

#### **Search Status & Feedback**

- [ ] **Search counter**: Display “Showing 12 of 24 results”
- [ ] **Active search indicator**: Visual indicator when search is active
- [ ] **Clear search button**: X button to clear search when text present
- [ ] **Empty search state**: Clear instructions when search box is empty

#### **Performance & UX**

- [ ] **Smooth transitions**: Fade in/out when results change
- [ ] **Search persistence**: Maintain search when switching filters
- [ ] **Loading state**: Show searching indicator during debounce period

### **Technical Implementation:**

- Enhance existing `handleSearchChange` in `DictionaryPanel.js`
- Add search highlighting utility function
- Update `WordCard.js` to accept and display highlighted text
- Implement search state management

-----

