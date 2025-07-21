# Epic: Reflexive Verbs Implementation - User Stories

## Project Structure

**Epic**: Reflexive Verbs Implementation  
**Repository**: misti-italian-learning  
**Project Board**: Reflexive Verbs Epic  
**Milestone**: v2.0 - Advanced Grammar Support

## Epic Overview

**Epic Goal**: Enable users to learn reflexive verb translations separately (direct vs. reciprocal vs. indirect reflexive) with independent spaced repetition tracking, using a translation-first architecture that mirrors how native speakers understand complex grammatical patterns.

**Epic Scope**: Translation-First Architecture Foundation  
**Overall Progress**: 0/12 user stories completed (0%)

### Phase Completion Status

- [ ] **Phase 1**: Database Foundation (0/4 stories) - Target: Week 2
- [ ] **Phase 2**: Business Logic Core (0/3 stories) - Target: Week 4
- [ ] **Phase 3**: UI Foundation (0/3 stories) - Target: Week 6
- [ ] **Phase 4**: Testing & Polish (0/2 stories) - Target: Week 8

### Out of Scope (Future Epics)

- **SRS Epic**: Spaced repetition implementation, card generation, progress tracking
- **Audio Epic**: Premium audio generation, variant playback, TTS integration
- **Deck Management Epic**: Study session creation, deck analytics, review scheduling

### Key Success Metrics

- [ ] **Translation assignment accuracy** of 90%+ for automatic matching
- [ ] **At least 6 words** demonstrate multiple translations (bello, bene, casa, ciao, grande, parlare)
- [ ] **All 432 existing forms** successfully migrated to new translation system
- [ ] **Architecture validated** and ready for SRS/Audio epic integration

-----

# Phase 1: Database Foundation 🗄️

**Epic Milestone**: Translation-First Database Architecture Complete  
**Target**: Weeks 1-2  
**Dependencies**: None

## Story 1: Create Translation-First Schema

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:1` `story-points:8` `type:technical` `component:database`

**As a** developer  
**I want** to create the new database tables for word translations and form translation assignments  
**So that** we can support multiple translations per word with proper form assignment and display prioritization

**Acceptance Criteria:**

- [x] `word_translations` table created with proper foreign key to existing `dictionary` table
- [x] `form_translations` table created linking to existing `word_forms` and new `word_translations` tables  
- [x] `user_form_translation_progress` table created extending existing `user_word_progress` pattern (placeholder for future SRS)
- [x] All foreign key constraints properly configured with CASCADE deletes to `dictionary.id`
- [x] `display_priority` column added for card ordering
- [x] `context_metadata` JSONB field for usage context information
- [x] Database migration script tested on development environment with existing 21 words + 432 forms

**Definition of Done:**

- [x] All three tables created with proper constraints and indexes
- [x] Migration script tested preserving all existing data
  - [x] Dictionary entries preserved (andare, parlare, casa, etc.)
  - [x] Word forms preserved (214 forms total: andare=107, parlare=107, casa=1)
  - [x] Relationships intact (dictionary ↔ word_forms working)
- [x] Integration confirmed with existing `word_audio_metadata` pattern
  - [x] Audio files working (it-IT-PalmiraNeural, it-IT-GiuseppeMultilingualNeural)
  - [x] Dictionary audio links preserved
  - [x] Word forms audio links preserved 
- [x] No breaking changes to existing `dictionary` or `word_forms` table structure

-----

## Story 2: Drop Incorrect Context-First Tables

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:1` `story-points:3` `type:technical` `component:database`

**As a** developer  
**I want** to safely remove the incorrectly designed context-first tables  
**So that** we can implement the correct translation-first architecture

**Acceptance Criteria:**

- [ ] `word_semantic_contexts` table dropped safely
- [ ] `form_translations` table dropped safely (old version)
- [ ] `user_form_translation_progress` table dropped safely (old version)
- [ ] No impact on existing `dictionary`, `word_forms`, or other core tables
- [ ] Rollback script created in case of issues
- [ ] Verification that no foreign key constraints remain

**Definition of Done:**

- [ ] All incorrect tables successfully removed
- [ ] Database in clean state for new schema implementation  
- [ ] No orphaned data or broken references
- [ ] System functions normally after table removal

-----

## Story 3: Migrate Existing Data with Translation Matching

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:1` `story-points:8` `type:technical` `component:database`

**As a** developer  
**I want** to migrate existing dictionary entries using intelligent translation matching logic  
**So that** current words gain multiple translations while preserving all existing form relationships

**Acceptance Criteria:**

- [ ] All 21 existing dictionary entries analyzed for multiple translations in English field
- [ ] Multiple translations split into separate `word_translations` entries:
  - `ciao` "hello, goodbye" → 2 word_translations with priorities 1,2
  - `parlare` "to speak, to talk" → 2 word_translations with priorities 1,2
  - `bello` "beautiful, handsome" → 2 word_translations with priorities 1,2
  - `casa` "house, home" → 2 word_translations with priorities 1,2
  - `grande` "big, large" → 2 word_translations with priorities 1,2
  - `bene` "well, good" → 2 word_translations with priorities 1,2
- [ ] Single-meaning words get single `word_translations` entry with priority 1
- [ ] All 432 existing `word_forms.translation` values migrated using **translation matching**:
  - Form "I speak" → assigned to word_translation "to speak" (priority 1)
  - Form "I talk" → would be assigned to word_translation "to talk" (priority 2) if it existed
- [ ] Context metadata populated based on translation analysis
- [ ] Translation assignment achieves 90%+ automatic matching success rate
- [ ] No data loss during migration

**Definition of Done:**

- [ ] At least 6 words have multiple `word_translations` (target: bello, bene, casa, ciao, grande, parlare)
- [ ] All 432 forms have `form_translations` entries with proper `word_translation_id` assignment
- [ ] Manual assignment needed for <10% of forms
- [ ] Priority ordering enables proper display in UI
- [ ] Migration preserves all existing functionality

-----

## Story 4: Create Reflexive Verb Test Data

**Labels**: `epic:reflexive-verbs` `priority:high` `phase:1` `story-points:5` `type:technical` `component:database`

**As a** developer  
**I want** to create comprehensive test data for "lavarsi" using the translation-first architecture  
**So that** we can test and demonstrate the multiple translations functionality with reflexive verb complexity

**Acceptance Criteria:**

- [ ] "lavarsi" entry created with appropriate reflexive tags
- [ ] Two word translations created:
  - Translation 1: "to wash oneself" (priority 1, direct reflexive)
  - Translation 2: "to wash each other" (priority 2, reciprocal) 
- [ ] Complete present tense conjugations created with proper translation assignment:
  - "mi lavo" → assigned to "to wash oneself" (only valid assignment)
  - "ci laviamo" → can be assigned to either translation (demonstrate choice)
  - "si lavano" → can be assigned to either translation
- [ ] Context metadata populated with usage information:
  - Direct: `{"usage": "direct-reflexive", "plurality": "any"}`
  - Reciprocal: `{"usage": "reciprocal", "plurality": "plural-only"}`
- [ ] Form assignment demonstrates translation matching logic
- [ ] Gender variants work with VariantCalculator integration
- [ ] Usage examples created for key translation distinctions

**Definition of Done:**

- [ ] "lavarsi" demonstrates multiple translation functionality
- [ ] Translation assignment logic handles reflexive complexity
- [ ] Context metadata enables appropriate form filtering
- [ ] Integration with existing VariantCalculator confirmed
- [ ] Architecture serves as template for other reflexive verbs
- [ ] Card display prioritization works correctly

-----

# Phase 2: Business Logic Core 🧠

**Epic Milestone**: Translation Management System Complete  
**Target**: Weeks 3-4  
**Dependencies**: Phase 1 complete

## Story 5: Implement Enhanced Dictionary System

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:2` `story-points:13` `type:feature` `component:business-logic`

**As a** user browsing the dictionary
**I want** to see all different translations of a word clearly separated with proper prioritization
**So that** I can understand the distinct translations and choose which ones to study

**Acceptance Criteria:**

- [ ] Dictionary panel shows multiple translations per word ordered by priority
- [ ] Each translation displays context metadata and usage notes
- [ ] Usage examples visible for each translation
- [ ] "Study This Translation" button per translation
- [ ] Translation-specific related words displayed (future enhancement)
- [ ] Loading performance under 200ms for complex words
- [ ] Search works across all translations, not just primary English field

**Technical Implementation:**

- [ ] `EnhancedDictionarySystem.loadWordsWithTranslations()` implemented
- [ ] `processTranslationsForDisplay()` handles prioritization and context parsing
- [ ] Integration with existing `word_audio_metadata` pattern maintained
- [ ] Caching layer implemented for performance

**Definition of Done:**

- [ ] Dictionary search returns words with all translations properly displayed
- [ ] Translation prioritization works correctly (primary first)
- [ ] Context metadata renders meaningfully in UI
- [ ] Performance benchmarks meet requirements (<200ms for complex queries)
- [ ] Integration with existing systems maintained

-----

## Story 6: Build Translation Assignment Engine

**Labels**: `epic:reflexive-verbs` `priority:high` `phase:2` `story-points:8` `type:technical` `component:business-logic`

**As a** developer
**I want** to create an intelligent system for assigning word forms to appropriate translations
**So that** form-to-translation matching can be automated and improved over time

**Acceptance Criteria:**

- [ ] `TranslationAssignmentEngine` class implemented with core matching algorithms
- [ ] Keyword matching works for basic cases ("I speak" → "to speak")
- [ ] Reflexive context matching handles complexity (reciprocal only for plural forms)
- [ ] Confidence scoring system provides assignment quality metrics
- [ ] Fallback logic assigns forms to primary translation when matching fails
- [ ] Special handling for calculated gender variants
- [ ] Assignment methods tracked ('automatic', 'manual', 'calculated-variant')

**Technical Implementation:**

- [ ] `findTranslationMatches()` implements semantic matching logic
- [ ] `checkReflexiveContext()` handles reflexive verb special cases
- [ ] `containsKeywords()` provides basic text matching
- [ ] Confidence threshold system prevents low-quality assignments
- [ ] Integration with existing `VariantCalculator` for gender variants

**Definition of Done:**

- [ ] Assignment engine achieves 90%+ automatic matching accuracy
- [ ] Reflexive verb forms correctly assigned based on plurality constraints
- [ ] Confidence scores provide meaningful assignment quality metrics
- [ ] Manual override capability for edge cases
- [ ] Unit tests validate matching logic accuracy

-----

## Story 7: Integrate Gender Variant Generation

**Labels**: `epic:reflexive-verbs` `priority:medium` `phase:2` `story-points:5` `type:technical` `component:business-logic`

**As a** language learner
**I want** reflexive verb forms to automatically show both masculine and feminine variants with correct translation assignments
**So that** I can practice gender agreement in compound tenses correctly across multiple translations

**Acceptance Criteria:**

- [ ] `VariantCalculator` correctly identifies reflexive compound forms needing gender variants
- [ ] Feminine variants generated using Italian morphological rules
- [ ] Generated variants inherit translation assignments from base forms
- [ ] All major participle patterns supported (-ato, -ito, -uto, irregular)
- [ ] Gender variants tagged as `assignment_method: 'calculated-variant'`
- [ ] Performance: variant generation under 50ms per verb

**Technical Implementation:**

- [ ] Integration between `VariantCalculator` and new translation system
- [ ] Generated variants get `form_translations` entries automatically
- [ ] Context metadata inheritance from base forms
- [ ] Proper handling of multiple translations per generated variant

**Definition of Done:**

- [ ] Gender variants display correctly in conjugation modal
- [ ] Generated variants show appropriate translations for selected translation
- [ ] Performance requirements met for variant generation
- [ ] Integration with existing morphological patterns maintained

-----

# Phase 3: UI Foundation 🎨

**Epic Milestone**: Translation Selection Interface Complete  
**Target**: Weeks 5-6  
**Dependencies**: Phase 2 complete

## Story 8: Create Translation Selection Interface

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:3` `story-points:8` `type:feature` `component:ui`

**As a** language learner
**I want** to select between different translations while viewing conjugations
**So that** I can understand how the same forms have different translations based on meaning

**Acceptance Criteria:**

- [ ] `TranslationSelector` component shows available translations with priority indicators
- [ ] Primary translation clearly marked with visual indicator
- [ ] Context information (plurality restrictions, usage) displayed per translation
- [ ] Smooth transitions when switching between translations
- [ ] Translation selection persists within modal session
- [ ] Unavailable translations properly disabled (e.g., reciprocal for singular forms)
- [ ] Responsive design works on mobile devices

**UI Implementation:**

- [ ] Translation buttons with priority badges and context hints
- [ ] Clear visual hierarchy (primary vs secondary translations)
- [ ] Accessibility compliance (keyboard navigation, screen readers)
- [ ] Integration with existing modal design system

**Definition of Done:**

- [ ] Translation selection interface renders correctly for multi-translation words
- [ ] Primary/secondary translations visually distinguished
- [ ] Context restrictions properly enforced (plural-only for reciprocal)
- [ ] Mobile responsive design maintained
- [ ] Accessibility requirements met

-----

## Story 9: Enhance Conjugation Modal with Translation Logic

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:3` `story-points:13` `type:feature` `component:ui`

**As a** language learner
**I want** conjugation forms to show different translations based on my selected translation
**So that** I can practice specific meanings without confusion

**Acceptance Criteria:**

- [ ] Conjugation modal loads with all available translations for current verb
- [ ] Form translations update immediately when translation selection changes
- [ ] Forms unavailable for selected translation are properly handled
- [ ] Gender toggle integration works correctly with translation selection
- [ ] Audio playback continues to work correctly across translation switches
- [ ] Form grouping (singular/plural) respects translation constraints
- [ ] Performance: translation switching under 100ms

**Technical Implementation:**

- [ ] `getTranslationForSelectedTranslation()` handles form-to-translation lookup
- [ ] `getAvailableTranslations()` provides translation options for selector
- [ ] Integration with existing gender toggle and mood/tense selection
- [ ] Proper filtering of forms based on translation constraints

**Definition of Done:**

- [ ] Modal displays all available translations with proper selector interface
- [ ] Form translations update correctly when selection changes
- [ ] Gender variants work properly across translation switches
- [ ] Performance requirements met for translation switching
- [ ] Integration with existing modal functionality maintained

-----

## Story 10: Update Dictionary Panel for Multiple Translations

**Labels**: `epic:reflexive-verbs` `priority:high` `phase:3` `story-points:5` `type:feature` `component:ui`

**As a** user browsing the dictionary
**I want** to see each translation of a word as a separate, studyable unit with proper priority ordering
**So that** I can focus on learning specific translations that are most relevant to me

**Acceptance Criteria:**

- [ ] Word cards show expandable translations sections ordered by priority
- [ ] Each translation has its own "Study This Translation" button
- [ ] Context metadata displayed meaningfully (usage notes, plurality restrictions)
- [ ] Usage examples displayed per translation when available
- [ ] Translation-specific related words shown (placeholder for future)
- [ ] Visual hierarchy makes translations easily scannable
- [ ] Loading performance maintained with multiple translations

**UI Design:**

- [ ] Accordion-style or tabbed interface for multiple translations
- [ ] Clear visual separation between translations
- [ ] Priority indicators (primary vs secondary)
- [ ] Context hints and usage guidance

**Definition of Done:**

- [ ] Dictionary panel properly displays multiple translations per word
- [ ] Priority ordering works correctly (primary translation first)
- [ ] Context metadata renders meaningfully for users
- [ ] "Study This Translation" functionality ready for future SRS integration
- [ ] Performance maintained with expanded data display

-----

# Phase 4: Testing & Polish ✨

**Epic Milestone**: Reflexive Verbs Architecture Complete  
**Target**: Weeks 7-8  
**Dependencies**: Phases 1-3 complete

## Story 11: Comprehensive Translation Assignment Testing

**Labels**: `epic:reflexive-verbs` `priority:high` `phase:4` `story-points:8` `type:technical` `component:testing`

**As a** developer
**I want** comprehensive tests for translation assignment accuracy and reflexive verb handling
**So that** the system correctly assigns forms to translations with high confidence

**Acceptance Criteria:**

- [ ] Unit tests for all major translation matching patterns
- [ ] Integration tests for reflexive verb complexity (reciprocal constraints)
- [ ] Validation against known correct assignments for migrated data
- [ ] Performance tests for assignment engine with large datasets
- [ ] Edge case handling (ambiguous translations, missing forms)
- [ ] Automated testing in CI/CD pipeline

**Test Coverage:**

- [ ] Basic keyword matching ("I speak" → "to speak")
- [ ] Reflexive context constraints (reciprocal requires plural)
- [ ] Fallback logic to primary translation
- [ ] Confidence scoring accuracy
- [ ] Gender variant assignment inheritance

**Definition of Done:**

- [ ] Test suite achieves 95%+ code coverage for assignment logic
- [ ] All reflexive verb test cases pass with expected assignments
- [ ] Performance benchmarks validate assignment speed requirements
- [ ] Edge cases handled gracefully with appropriate fallbacks
- [ ] CI/CD integration ensures ongoing quality

-----

## Story 12: User Experience Polish and Performance Optimization

**Labels**: `epic:reflexive-verbs` `priority:medium` `phase:4` `story-points:5` `type:feature` `component:ui`

**As a** language learner
**I want** smooth, intuitive interactions when switching between translations and viewing forms
**So that** I can focus on learning rather than wrestling with the interface

**Acceptance Criteria:**

- [ ] Smooth animations for translation switching (under 100ms)
- [ ] Loading states for all async operations
- [ ] Responsive design across screen sizes (mobile, tablet, desktop)
- [ ] Keyboard navigation support for translation selection
- [ ] Clear visual feedback for all interactions
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Performance optimization for complex words with many forms

**Polish Areas:**

- [ ] Translation transition animations
- [ ] Button hover states and feedback
- [ ] Loading skeletons for complex queries
- [ ] Error handling with helpful messages
- [ ] Mobile-optimized touch interactions

**Definition of Done:**

- [ ] Translation switching feels fluid and responsive
- [ ] Loading states provide clear feedback during async operations
- [ ] Mobile experience equals desktop functionality
- [ ] Accessibility requirements fully met
- [ ] Performance benchmarks achieved across all device types

-----

# Epic Definition of Done

The Reflexive Verbs Epic is considered complete when:

- [ ] All 12 user stories completed with acceptance criteria met
- [ ] Translation-first architecture fully implemented and tested
- [ ] At least 6 words demonstrate multiple translations functionality
- [ ] 90%+ automatic translation assignment accuracy achieved
- [ ] All existing functionality preserved during migration
- [ ] Performance requirements met (<200ms complex queries, <100ms switching)
- [ ] Architecture documented and ready for future SRS/Audio epic integration
- [ ] User testing validates improved learning experience

## Future Epic Integration Points

**SRS Epic Dependencies:**
- [ ] `user_form_translation_progress` table structure validated
- [ ] Form+translation combination tracking architecture proven
- [ ] Card generation logic ready for translation-specific cards

**Audio Epic Dependencies:**  
- [ ] Audio playback integration with translation selection confirmed
- [ ] Form variant audio generation compatible with new system
- [ ] Translation-aware audio preference handling ready

This epic establishes the foundational translation-first architecture that enables Misti to handle the genuine linguistic complexity of Italian while maintaining pedagogical effectiveness through intelligent spaced repetition.
