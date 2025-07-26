# Story A5: Search Suggestions & Smart Autocomplete

**Priority**: Medium-Low  
**Estimated Time**: 50-70 minutes  
**Dependencies**: Stories A0, A1 (for content and search foundation)

**As a** user typing in the search box  
**I want** intelligent suggestions and completions  
**So that** I can discover vocabulary faster and learn related words

### **Acceptance Criteria:**

#### **Smart Suggestions**

- [ ] **Real-time suggestions**: Dropdown appears after 2+ characters
- [ ] **Italian & English**: Suggest words matching in both languages
- [ ] **Fuzzy matching**: “cassa” suggests “casa”, “parlre” suggests “parlare”
- [ ] **Word type indicators**: Show VERB/NOUN/etc. badges in suggestions

#### **Advanced Features**

- [ ] **Recent searches**: Show 3-5 recent search terms
- [ ] **Related words**: Suggest words with similar meanings or tags
- [ ] **Completion prediction**: Complete partial words intelligently
- [ ] **Popular searches**: Show trending or common searches

#### **Interaction Design**

- [ ] **Keyboard navigation**: Arrow keys, Enter to select, Escape to close
- [ ] **Click selection**: Mouse/touch to select suggestions
- [ ] **Visual hierarchy**: Clear distinction between suggestion types
- [ ] **Performance**: Fast response time under 100ms

### **Technical Implementation:**

- Create `SearchSuggestions.js` component
- Implement fuzzy search algorithm for typo tolerance
- Add suggestion caching for performance
- Integrate with existing search debouncing system

-----

