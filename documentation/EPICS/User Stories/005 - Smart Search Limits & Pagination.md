# Story A3: Smart Search Limits & Pagination

**Priority**: Medium  
**Estimated Time**: 35-45 minutes  
**Dependencies**: Story A0 (for content to paginate)

**As a** user browsing large vocabulary lists  
**I want** controlled loading with the option to see more results  
**So that** the interface stays fast while giving me access to comprehensive results

### **Acceptance Criteria:**

#### **Progressive Loading**

- [ ] **Default limit**: Show 20 words initially
- [ ] **Load more button**: “Load 20 more” expanding to 40, 60, 80, 100
- [ ] **Show all option**: For results under 100 total matches
- [ ] **Smooth insertion**: New results appear without layout jumping

#### **Progress Indication**

- [ ] **Results counter**: “Showing 20 of 67 results”
- [ ] **Loading states**: Button shows “Loading…” when fetching more
- [ ] **Total available**: Display total matches before filtering
- [ ] **Performance monitoring**: Track render time for large lists

#### **Smart Limits**

- [ ] **Context-aware limits**: Smaller limits for complex filters
- [ ] **Auto-expand**: Automatically load more if under 10 results
- [ ] **Memory management**: Efficient handling of 100+ rendered cards

### **Technical Implementation:**

- Add pagination state to `DictionaryPanel.js`
- Implement `loadMoreWords` function in `EnhancedDictionarySystem`
- Add result counting and progress display
- Optimize word card rendering for performance

-----

