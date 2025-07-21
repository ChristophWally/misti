# Epic: Reflexive Verbs Implementation - GitHub Issues

## Project Structure

**Epic**: Reflexive Verbs Implementation  
**Repository**: misti-italian-learning  
**Project Board**: Reflexive Verbs Epic  
**Milestone**: v2.0 - Advanced Grammar Support

## Issue Organization

Each issue is tagged with:

- **Epic**: reflexive-verbs
- **Priority**: critical/high/medium/low
- **Phase**: implementation-order (1-6)
- **Story Points**: relative effort estimate (1-13 scale)
- **Type**: feature/technical/bug/research
- **Component**: database/ui/audio/srs/testing

## Epic Progress Tracking

**Epic Scope**: Reflexive Verbs Architecture Foundation  
**Overall Progress**: 0/16 issues completed (0%)

### Phase Completion Status

- [ ] **Phase 1**: Database Foundation (0/3 issues) - Target: Week 2
- [ ] **Phase 2**: Business Logic Core (0/4 issues) - Target: Week 4
- [ ] **Phase 3**: UI Foundation (0/4 issues) - Target: Week 6
- [ ] **Phase 4**: Testing & Polish (0/3 issues) - Target: Week 8

### Out of Scope (Future Epics)

- **SRS Epic**: Spaced repetition implementation, card generation, progress tracking
- **Audio Epic**: Premium audio generation, variant playback, TTS integration
- **Deck Management Epic**: Study session creation, deck analytics, review scheduling

### Key Milestones

- [ ] **Database schema deployed** with multiple translations support (End of Phase 1)
- [ ] **lavarsi fully functional** with context switching in UI (End of Phase 3)
- [ ] **Architecture validated** and ready for SRS/Audio epic integration (End of Phase 4)

-----

# Phase 1: Database Foundation 🗄️

**Epic Milestone**: Database Architecture Complete  
**Target**: Weeks 1-2  
**Dependencies**: None

## Component: Database Architecture

### Issue #1: Create Multiple Translations Schema

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:1` `story-points:8` `type:technical` `component:database`

**As a** developer  
**I want** to create the new database tables for word translations and form translation assignments  
**So that** we can support multiple translations per word with proper form assignment and display prioritization

**Acceptance Criteria:**

- [ ] `word_translations` table created with proper foreign key to existing `dictionary` table
- [ ] `form_translations` table created linking to existing `word_forms` and new `word_translations` tables  
- [ ] `user_form_translation_progress` table created extending existing `user_word_progress` pattern (placeholder for future SRS)
- [ ] All foreign key constraints properly configured with CASCADE deletes to `dictionary.id`
- [ ] `display_priority` column added for card ordering
- [ ] `context_metadata` JSONB field for usage context information
- [ ] Database migration script tested on development environment with existing 21 words + 432 forms

**Technical Implementation:**

```sql
-- WORD TRANSLATIONS: Multiple translations per word
CREATE TABLE word_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid NOT NULL REFERENCES dictionary(id) ON DELETE CASCADE,
  translation text NOT NULL, -- 'to speak', 'to talk', 'hello', 'goodbye'
  display_priority integer NOT NULL DEFAULT 1, -- 1 = primary/most common
  context_metadata jsonb DEFAULT '{}', -- {"usage": "formal", "situations": ["presentations", "interviews"]}
  usage_notes text, -- "Used in formal situations"
  created_at timestamp with time zone DEFAULT now()
);

-- FORM TRANSLATIONS: Assignment of forms to specific word translations
CREATE TABLE form_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES word_forms(id) ON DELETE CASCADE,
  word_translation_id uuid NOT NULL REFERENCES word_translations(id) ON DELETE CASCADE,
  translation text NOT NULL, -- 'I speak', 'he/she talks', etc.
  usage_examples jsonb DEFAULT '[]', -- [{"italian": "Parlo italiano", "english": "I speak Italian"}]
  assignment_method text DEFAULT 'automatic', -- 'automatic', 'manual', 'calculated-variant'
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(form_id, word_translation_id) -- One assignment per form per word translation
);

-- SRS PROGRESS: Placeholder for future SRS Epic  
CREATE TABLE user_form_translation_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  form_translation_id uuid NOT NULL REFERENCES form_translations(id) ON DELETE CASCADE,
  deck_id uuid REFERENCES decks(id) ON DELETE SET NULL,
  
  -- SRS Algorithm fields (matches existing user_word_progress)
  difficulty_factor numeric DEFAULT 2.5,
  interval_days integer DEFAULT 1,
  repetitions integer DEFAULT 0,
  correct_streak integer DEFAULT 0,
  total_reviews integer DEFAULT 0,
  correct_reviews integer DEFAULT 0,
  last_reviewed timestamp with time zone,
  next_review timestamp with time zone,
  average_response_time numeric,
  difficulty_adjustments integer DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, form_translation_id, deck_id)
);
```

**Definition of Done:**

- [ ] All three tables created with proper constraints and indexes
- [ ] Migration script tested preserving all existing 21 dictionary entries and 432 word forms
- [ ] Integration confirmed with existing `word_audio_metadata` pattern
- [ ] No breaking changes to existing `dictionary` or `word_forms` table structure

-----

### Issue #2: Migrate Existing Dictionary Data with Translation Matching

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:1` `story-points:5` `type:technical` `component:database`

**As a** developer  
**I want** to migrate existing dictionary entries using translation matching logic  
**So that** current words gain multiple translations while preserving all existing form relationships

**Acceptance Criteria:**

- [ ] All 21 existing dictionary entries analyzed for multiple translations in English field
- [ ] Multiple translations split into separate `word_translations` entries:
  - `ciao` "hello, goodbye" → 2 word_translations with priorities 1,2
  - `parlare` "to speak, to talk" → 2 word_translations with priorities 1,2
  - `casa` "house, home" → 2 word_translations with priorities 1,2
  - etc.
- [ ] Single-meaning words get single `word_translations` entry with priority 1
- [ ] All 432 existing `word_forms.translation` values migrated using **translation matching**:
  - Form "I speak" → assigned to word_translation "to speak" (priority 1)
  - Form "I talk" → would be assigned to word_translation "to talk" (priority 2) if it existed
- [ ] Context metadata populated based on translation analysis
- [ ] No data loss during migration
- [ ] Rollback plan tested

**Translation Matching Logic:**

```sql
-- Migration Logic: Match form translations to word translations
-- Example: parlare has word_translations ["to speak", "to talk"]
-- Form "I speak" matches word_translation "to speak"
-- Form "I talk" matches word_translation "to talk"

WITH form_assignment AS (
  SELECT 
    wf.id as form_id,
    wf.translation as form_translation,
    wt.id as word_translation_id,
    wt.translation as word_translation,
    CASE 
      WHEN wf.translation ILIKE '%speak%' AND wt.translation ILIKE '%speak%' THEN 'match'
      WHEN wf.translation ILIKE '%talk%' AND wt.translation ILIKE '%talk%' THEN 'match'
      -- Add more matching rules...
      ELSE 'no-match'
    END as match_quality
  FROM word_forms wf
  JOIN word_translations wt ON wt.word_id = wf.word_id
  WHERE wf.translation IS NOT NULL
)
-- Forms get assigned to best matching word_translation
```

**Special Cases:**

- **Reflexive verbs**: Use existing tags system for context-specific forms
- **Compound tenses**: Inherit assignment from base form
- **Gender variants**: Use calculated-variant assignment method
- **Ambiguous forms**: Default to priority 1 (most common) translation

**Definition of Done:**

- [ ] At least 6 words have multiple `word_translations` (bello, bene, casa, ciao, grande, parlare)
- [ ] All 432 forms have `form_translations` entries with proper `word_translation_id` assignment
- [ ] Translation matching achieves 90%+ automatic assignment rate
- [ ] Manual assignment needed for <10% of forms
- [ ] Priority ordering enables proper display in UI

-----

### Issue #3: Create Reflexive Verb Test Data with Translation Focus

**Labels**: `epic:reflexive-verbs` `priority:high` `phase:1` `story-points:3` `type:technical` `component:database`

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
- [ ] Context metadata populated with usage information
- [ ] Form assignment demonstrates translation matching logic
- [ ] Gender variants work with VariantCalculator integration
- [ ] Usage examples created for key translation distinctions

**Test Data Architecture:**

```sql
-- lavarsi word translations
INSERT INTO word_translations (word_id, translation, display_priority, context_metadata) VALUES
(lavarsi_id, 'to wash oneself', 1, '{"usage": "direct-reflexive", "plurality": "any"}'),
(lavarsi_id, 'to wash each other', 2, '{"usage": "reciprocal", "plurality": "plural-only"}');

-- Form assignments using translation matching
-- "mi lavo" = "I wash myself" → matches "to wash oneself"
-- "ci laviamo" could be "we wash ourselves" OR "we wash each other" 
--   → demonstrates choice/context via tags or metadata
```

**Special Reflexive Handling:**

- Use existing `tags` system to mark reciprocal-capable forms
- Singular forms (mi, ti, si) → only "to wash oneself" translation
- Plural forms (ci, vi, si) → can use either translation based on context
- Context switching in UI will filter translations by form appropriateness

**Definition of Done:**

- [ ] "lavarsi" demonstrates multiple translation functionality
- [ ] Translation assignment logic handles reflexive complexity
- [ ] Context metadata enables appropriate form filtering
- [ ] Integration with existing VariantCalculator confirmed
- [ ] Architecture serves as template for other reflexive verbs
- [ ] Card display prioritization works correctly

### Story 1.2: Migrate Existing Dictionary Data

**Priority**: Critical | **Points**: 5 | **Type**: Technical

**As a** developer
**I want** to migrate existing dictionary entries to the new schema structure
**So that** current words continue to work while gaining multiple translation capabilities

**Acceptance Criteria:**

- [ ] All existing dictionary entries preserved
- [ ] Default semantic context created for each existing word
- [ ] Existing translations moved to form_translations table
- [ ] No data loss during migration
- [ ] Rollback plan tested and documented

**Migration Strategy:**

- Create default context with type “primary-meaning”
- Preserve existing English translations as base_translation
- Maintain all existing word_forms relationships

-----

### Story 1.3: Create Reflexive Verb Test Data

**Priority**: High | **Points**: 3 | **Type**: Technical

**As a** developer
**I want** to create comprehensive test data for “lavarsi” with multiple contexts
**So that** we can test and demonstrate the multiple meanings functionality

**Acceptance Criteria:**

- [ ] “lavarsi” entry with both direct-reflexive and reciprocal contexts
- [ ] Complete present tense conjugations for both meanings
- [ ] Sample usage examples for each context
- [ ] Related words linked to appropriate contexts
- [ ] Audio metadata placeholders created

**Test Data Requirements:**

- Include forms: mi lavo, ti lavi, si lava, ci laviamo, vi lavate, si lavano
- Two semantic contexts: “Wash Oneself” and “Wash Each Other”
- Context-specific translations for each form
- Meaningful usage examples in Italian and English

-----

# Phase 2: Business Logic Core 🧠

## Epic: Word Management System

### Story 2.1: Load Words with Multiple Contexts

**Priority**: Critical | **Points**: 8 | **Type**: Feature

**As a** user browsing the dictionary
**I want** to see all different meanings of a word clearly separated
**So that** I can understand the distinct contexts and choose which ones to study

**Acceptance Criteria:**

- [ ] Dictionary panel shows multiple meanings per word
- [ ] Each meaning displays context name and base translation
- [ ] Usage examples visible for each context
- [ ] “Study This Meaning” button per context
- [ ] Context-specific related words displayed
- [ ] Loading performance under 200ms for complex words

**UI Mockup Reference:**

```
🏠 lavarsi
Multiple Meanings:
1️⃣ to wash oneself (Direct) - "Mi lavo le mani"
2️⃣ to wash each other (Reciprocal) - "Ci laviamo a vicenda"
```

-----

### Story 2.2: Generate Gender Variants for Reflexive Verbs

**Priority**: High | **Points**: 13 | **Type**: Technical

**As a** language learner
**I want** reflexive verb forms to automatically show both masculine and feminine variants
**So that** I can practice gender agreement in compound tenses correctly

**Acceptance Criteria:**

- [ ] VariantCalculator correctly identifies reflexive compound forms
- [ ] Feminine variants generated using Italian morphological rules
- [ ] Variants inherit same semantic contexts as base forms
- [ ] All major participle patterns supported (-ato, -ito, -uto, irregular)
- [ ] Gender variants tagged as calculated rather than stored
- [ ] Performance: variant generation under 50ms per verb

**Morphological Patterns to Support:**

- Regular: lavato → lavata, lavati, lavate
- Irregular: fatto → fatta, fatti, fatte
- Complex: “mi sono lavato” → “mi sono lavata”

-----

### Story 2.3: Context-Specific Word Relationships

**Priority**: Medium | **Points**: 5 | **Type**: Feature

**As a** language learner
**I want** to see related words that are specific to each meaning
**So that** I can build vocabulary around specific contexts rather than getting confused

**Acceptance Criteria:**

- [ ] Related words display only for current context
- [ ] Link types shown (synonym, antonym, related-concept, etc.)
- [ ] Clicking related word opens in same context if available
- [ ] Link resolution performance under 100ms
- [ ] Graceful handling of missing linked words

**Example Implementation:**

- “lavarsi” (wash oneself) → shows “sapone” (soap), “asciugamano” (towel)
- “lavarsi” (wash each other) → shows “aiutarsi” (help each other), “insieme” (together)

-----

## Epic: Form Generation System

### Story 2.4: Infinitive Construction Generation

**Priority**: High | **Points**: 8 | **Type**: Technical

**As a** language learner
**I want** to see infinitive forms with attached pronouns (lavarmi, lavarti, etc.)
**So that** I can practice using reflexive verbs with modal verbs and prepositions

**Acceptance Criteria:**

- [ ] Generate all infinitive + pronoun combinations (lavarmi, lavarti, lavarci, etc.)
- [ ] Include base infinitive (lavarsi) in the list
- [ ] Store as infinitive mood forms in existing schema
- [ ] Apply same multiple translation logic to infinitive forms
- [ ] Handle form collisions (lavarsi appears twice with different meanings)

**Forms to Generate:**

- Base: lavarsi (general infinitive)
- Personal: lavarmi, lavarti, lavarsi (3rd), lavarci, lavarvi, lavarsi (loro)
- Each gets appropriate context translations

-----

# Phase 3: UI Foundation 🎨

## Epic: Conjugation Modal Enhancement

### Story 3.1: Context Switching Interface

**Priority**: Critical | **Points**: 13 | **Type**: Feature

**As a** language learner
**I want** to switch between different meanings while viewing conjugations
**So that** I can understand how the same forms have different translations

**Acceptance Criteria:**

- [ ] Context dropdown showing available meanings for current verb
- [ ] Translations update immediately when context changes
- [ ] Context selection persists within modal session
- [ ] Smooth transitions between contexts (no jarring reloads)
- [ ] Context unavailable for certain forms (reciprocal + singular) properly handled
- [ ] Audio continues to work correctly across context switches

**UI Behavior:**

- Context dropdown shows: “Direct: wash oneself” and “Reciprocal: wash each other”
- Form “ci laviamo” shows “we wash ourselves” vs “we wash each other”
- Singular forms disabled/grayed when reciprocal context selected

-----

### Story 3.2: Gender Toggle Integration

**Priority**: High | **Points**: 8 | **Type**: Feature

**As a** language learner
**I want** to toggle between masculine and feminine forms for reflexive verbs
**So that** I can practice correct gender agreement in compound tenses

**Acceptance Criteria:**

- [ ] Gender toggle (♂/♀) appears for reflexive verbs with compound tenses
- [ ] Toggle disabled/grayed when not applicable (simple tenses)
- [ ] Form text updates dynamically: “sono andato” ↔ “sono andata”
- [ ] Color coding reflects gender selection (blue for masculine, pink for feminine)
- [ ] Audio plays correct gender variant when available
- [ ] Toggle state resets appropriately when changing tenses

**Visual Design:**

- Elegant toggle buttons with gender symbols
- Clear visual feedback for enabled/disabled states
- Color coordination with form text

-----

### Story 3.3: Audio Integration with Context Awareness

**Priority**: High | **Points**: 5 | **Type**: Feature

**As a** language learner
**I want** audio playback to work correctly regardless of which context I’m viewing
**So that** I can hear proper pronunciation while learning different meanings

**Acceptance Criteria:**

- [ ] Audio plays form text regardless of selected context
- [ ] Premium audio indicator (gold border) displays correctly
- [ ] TTS fallback works when premium audio unavailable
- [ ] Audio preference (form-only vs with-pronoun) respected
- [ ] No audio errors when switching contexts rapidly
- [ ] Loading states handled gracefully

**Technical Implementation:**

- Audio plays “ci laviamo” regardless of whether translation shows “wash ourselves” or “wash each other”
- Context selection affects translation display only, not pronunciation

-----

## Epic: Dictionary Enhancement

### Story 3.4: Multiple Meanings Display

**Priority**: High | **Points**: 8 | **Type**: Feature

**As a** user browsing the dictionary
**I want** to see each meaning of a word as a separate, studyable unit
**So that** I can focus on learning specific meanings that are most relevant to me

**Acceptance Criteria:**

- [ ] Word cards show expandable meanings sections
- [ ] Each meaning has its own “Study This Meaning” button
- [ ] Context names are clear and user-friendly
- [ ] Usage examples displayed for each meaning
- [ ] Related words shown per context, not globally
- [ ] Visual hierarchy makes meanings easily scannable

**Interaction Design:**

- Accordion-style expansion for meanings
- Clear visual separation between contexts
- Consistent iconography for different meaning types

-----

# Phase 4: Testing & Polish ✨

**Epic Milestone**: Reflexive Verbs Architecture Complete  
**Target**: Weeks 7-8  
**Dependencies**: Phases 1-3 complete

## Component: Quality Assurance

### Issue #13: Morphological Accuracy Testing

**Labels**: `epic:reflexive-verbs` `priority:high` `phase:4` `story-points:8` `type:technical` `component:testing`

**As a** developer
**I want** comprehensive tests for Italian reflexive verb morphology
**So that** gender variant generation is linguistically accurate

**Acceptance Criteria:**

- [ ] Unit tests for all major participle patterns
- [ ] Integration tests for reflexive verb processing
- [ ] Validation against authoritative Italian grammar sources
- [ ] Performance tests for variant generation
- [ ] Edge case handling (irregular verbs, archaic forms)
- [ ] Automated testing in CI/CD pipeline

**Test Coverage:**

- Regular patterns: -ato, -ito, -uto transformations
- Irregular patterns: fatto, preso, visto, etc.
- Complex compounds: reflexive + gender + person combinations

-----

### Issue #14: Context Switching UX Polish

**Labels**: `epic:reflexive-verbs` `priority:medium` `phase:4` `story-points:5` `type:feature` `component:ui`

**As a** language learner
**I want** smooth, intuitive interactions when switching between verb contexts
**So that** I can focus on learning rather than wrestling with the interface

**Acceptance Criteria:**

- [ ] Smooth animations for context switching
- [ ] Loading states for all async operations
- [ ] Responsive design across screen sizes
- [ ] Keyboard navigation support
- [ ] Clear visual feedback for all interactions
- [ ] Accessibility compliance (WCAG 2.1 AA)

**Polish Areas:**

- Context transition animations
- Button hover states and feedback
- Loading skeletons for complex queries
- Error handling with helpful messages

-----

### Issue #15: Performance Optimization

**Labels**: `epic:reflexive-verbs` `priority:medium` `phase:4` `story-points:5` `type:technical` `component:database`

**As a** user of the application
**I want** fast response times when browsing reflexive verbs and contexts
**So that** learning feels fluid and responsive

**Acceptance Criteria:**

- [ ] Complex word+context queries under 200ms
- [ ] Database query optimization with proper indexing
- [ ] Caching strategy for frequently accessed words
- [ ] Performance monitoring and alerting
- [ ] Load testing for concurrent users
- [ ] Memory usage optimization for variant generation

**Optimization Targets:**

- Dictionary search: <100ms average
- Conjugation modal loading: <150ms
- Context switching: <50ms
- Gender variant generation: <25ms per verb

-----

### Issue #16: Epic Documentation & Handoff

**Labels**: `epic:reflexive-verbs` `priority:medium` `phase:4` `story-points:3` `type:technical` `component:testing`

**As a** future developer working on SRS/Audio epics
**I want** comprehensive documentation of the reflexive verbs architecture
**So that** I can integrate with the system effectively

**Acceptance Criteria:**

- [ ] API documentation for all new endpoints
- [ ] Database schema documentation with examples
- [ ] Component integration guides
- [ ] Performance benchmarks documented
- [ ] Known limitations and future considerations documented
- [ ] Migration guides for expanding to other verb types

-----

# Future Epics: SRS & Audio Integration 🚀

## Epic: Spaced Repetition System

**Estimated Start**: After Reflexive Verbs Epic completion  
**Dependencies**: Reflexive Verbs architecture, user authentication

**Scope**:

- Context-aware card generation from form_translations
- Individual progress tracking per semantic context
- Smart deck management with context selection
- Review scheduling algorithm implementation

-----

## Epic: Premium Audio System

**Estimated Start**: Parallel with or after SRS Epic  
**Dependencies**: Reflexive Verbs architecture, Azure TTS integration

**Scope**:

- Multi-variant audio generation for reflexive verbs
- Gender-aware audio playback
- OPUS format optimization
- Context-aware audio management

-----

# Definition of Done

Each issue is considered complete when:

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Unit tests written and passing
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Performance requirements met
- [ ] No accessibility regressions
- [ ] Deployed to staging environment
- [ ] Ready for integration with future SRS/Audio epics
