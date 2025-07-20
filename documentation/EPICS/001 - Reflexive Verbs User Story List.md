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

You're absolutely right! Looking at your document, you need to overwrite **Issue #1: Create Multiple Translations Schema**.

Here's the exact text to replace that section:

---

### Issue #1: Create Multiple Translations Schema

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:1` `story-points:8` `type:technical` `component:database`

**As a** developer  
**I want** to create the new database tables for semantic contexts and form translations  
**So that** we can support multiple meanings per reflexive verbs while preserving existing data

**Acceptance Criteria:**

- [ ] `word_semantic_contexts` table created with proper foreign key to existing `dictionary` table
- [ ] `form_translations` table created linking to existing `word_forms` and new `word_semantic_contexts` tables  
- [ ] `user_form_translation_progress` table created extending existing `user_word_progress` pattern
- [ ] All foreign key constraints properly configured with CASCADE deletes to `dictionary.id`
- [ ] GIN indexes created on JSONB fields for performance (`context_links`, `usage_examples`)
- [ ] Integration with existing `word_audio_metadata` source_table/source_id pattern verified
- [ ] Database migration script tested on development environment with existing 21 words + 432 forms

**Technical Implementation:**

```sql
-- SEMANTIC CONTEXTS: Multiple meanings per word
CREATE TABLE word_semantic_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid NOT NULL REFERENCES dictionary(id) ON DELETE CASCADE,
  context_type text NOT NULL, -- 'direct-reflexive', 'reciprocal', 'indirect-reflexive'
  context_name text NOT NULL, -- 'Wash Oneself', 'Wash Each Other'  
  base_translation text NOT NULL, -- 'to wash oneself', 'to wash each other'
  semantic_tags text[] DEFAULT '{}', -- ['self-directed', 'body-care']
  frequency_rank integer DEFAULT 1, -- 1 = most common meaning
  context_links jsonb DEFAULT '[]', -- [{"word_id": "uuid", "link_type": "synonym"}]
  created_at timestamp with time zone DEFAULT now()
);

-- FORM TRANSLATIONS: Context-specific translations for existing word_forms
CREATE TABLE form_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES word_forms(id) ON DELETE CASCADE,
  semantic_context_id uuid NOT NULL REFERENCES word_semantic_contexts(id) ON DELETE CASCADE,
  translation text NOT NULL, -- 'we wash ourselves' vs 'we wash each other'
  usage_examples jsonb DEFAULT '[]', -- [{"italian": "Ci laviamo", "english": "We wash ourselves"}]
  context_notes text, -- Additional pedagogical explanations
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(form_id, semantic_context_id) -- One translation per form per context
);

-- SRS PROGRESS: Extends existing pattern to track per form+context combination  
CREATE TABLE user_form_translation_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- Matches existing user_word_progress pattern
  form_translation_id uuid NOT NULL REFERENCES form_translations(id) ON DELETE CASCADE,
  deck_id uuid REFERENCES decks(id) ON DELETE SET NULL, -- Optional deck association
  
  -- SRS Algorithm fields (matches existing user_word_progress exactly)
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

- [ ] Code reviewed and approved
- [ ] Migration script tested preserving all existing 21 dictionary entries and 432 word forms
- [ ] All foreign key constraints validated (CASCADE from dictionary.id works correctly)
- [ ] Performance benchmarks meet requirements (<100ms for complex context queries)
- [ ] Integration confirmed with existing `word_audio_metadata.source_table = 'word_forms'` pattern
- [ ] No breaking changes to existing `dictionary` or `word_forms` table structure
-----

### Issue #2: Migrate Existing Dictionary Data

**Labels**: `epic:reflexive-verbs` `priority:critical` `phase:1` `story-points:5` `type:technical` `component:database`

**As a** developer  
**I want** to migrate existing dictionary entries (21 words, 432 forms) to the new schema structure  
**So that** current words continue to work while gaining multiple translation capabilities

**Acceptance Criteria:**

- [ ] All 21 existing dictionary entries preserved without data loss
- [ ] Default semantic context created for each existing word with `context_type = 'primary-meaning'`
- [ ] All 432 existing word_forms.translation values migrated to new form_translations table
- [ ] Each existing form linked to its word's default semantic context
- [ ] Extensive conjugation data for "parlare" and "andare" (160+ forms) preserved correctly
- [ ] Existing word_audio_metadata relationships maintained (2 current records)
- [ ] Existing word_relationships preserved (2 current records)
- [ ] Migration script includes rollback plan tested on development environment
- [ ] No downtime during migration process

**Migration Strategy:**

```sql
-- Step 1: Create default contexts for all existing words
INSERT INTO word_semantic_contexts (word_id, context_type, context_name, base_translation, frequency_rank)
SELECT 
  id,
  'primary-meaning',
  CASE word_type
    WHEN 'VERB' THEN 'Primary Usage'
    WHEN 'NOUN' THEN 'Common Meaning'
    WHEN 'ADJECTIVE' THEN 'Standard Form'
    WHEN 'ADVERB' THEN 'Basic Usage'
  END,
  english, -- Use existing english field as base_translation
  1 -- Primary meaning gets rank 1
FROM dictionary;

-- Step 2: Migrate all word_forms.translation to form_translations
INSERT INTO form_translations (form_id, semantic_context_id, translation)
SELECT 
  wf.id,
  wsc.id,
  COALESCE(wf.translation, wf.form_text) -- Use translation if exists, fallback to form_text
FROM word_forms wf
JOIN word_semantic_contexts wsc ON wsc.word_id = wf.word_id
WHERE wsc.context_type = 'primary-meaning';

-- Step 3: Verify migration completeness
-- All 432 forms should have form_translations entries
```

**Definition of Done:**

- [ ] Pre-migration backup created and verified
- [ ] All 432 word forms have corresponding form_translations entries
- [ ] All 21 words have primary semantic contexts created
- [ ] Data integrity verified: no orphaned records
- [ ] Performance tests confirm <200ms query times post-migration
- [ ] Rollback script tested and documented

-----

### Issue #3: Create Reflexive Verb Test Data

**Labels**: `epic:reflexive-verbs` `priority:high` `phase:1` `story-points:3` `type:technical` `component:database`

**As a** developer  
**I want** to create comprehensive test data for "lavarsi" with multiple semantic contexts  
**So that** we can test and demonstrate the multiple meanings functionality

**Acceptance Criteria:**

- [ ] "lavarsi" entry created with reflexive-verb tags
- [ ] Two semantic contexts created:
  - Direct reflexive: "Wash Oneself" (`context_type: 'direct-reflexive'`)
  - Reciprocal: "Wash Each Other" (`context_type: 'reciprocal'`)
- [ ] Complete present indicative conjugations (6 forms) created for lavarsi
- [ ] Context-specific translations for each form in both meanings:
  - "ci laviamo" → "we wash ourselves" (direct) vs "we wash each other" (reciprocal)
  - "si lavano" → "they wash themselves" (direct) vs "they wash each other" (reciprocal)
- [ ] Usage examples created for key forms demonstrating context differences
- [ ] Audio metadata placeholders created following existing pattern
- [ ] Related word links created (sapone, asciugamano for direct; insieme, aiutarsi for reciprocal)

**Test Data Structure:**

```sql
-- Dictionary entry
INSERT INTO dictionary (italian, english, word_type, tags) VALUES
('lavarsi', 'to wash', 'VERB', ARRAY[
  'reflexive-verb', 'are-conjugation', 'essere-auxiliary', 
  'both-transitivity', 'freq-top1000', 'CEFR-A2'
]);

-- Semantic contexts  
INSERT INTO word_semantic_contexts (word_id, context_type, context_name, base_translation, semantic_tags) VALUES
(lavarsi_id, 'direct-reflexive', 'Wash Oneself', 'to wash oneself', ARRAY['self-directed', 'personal-care']),
(lavarsi_id, 'reciprocal', 'Wash Each Other', 'to wash each other', ARRAY['mutual-action', 'cooperative']);

-- Sample key forms with dual translations
-- "ci laviamo" with both meanings
-- "si lavano" with both meanings  
-- "mi lavo" (only direct - singular can't be reciprocal)
```

**Context-Specific Examples:**

- **Direct Reflexive**: "Mi lavo le mani prima di mangiare" → "I wash my hands before eating"
- **Reciprocal**: "Ci laviamo a vicenda dopo il lavoro" → "We wash each other after work"
- **Usage Notes**: Reciprocal meaning requires plural subject (noi, voi, loro only)

**Definition of Done:**

- [ ] "lavarsi" fully functional in dictionary search
- [ ] Context switching works in conjugation modal
- [ ] Gender variants generate correctly for compound tenses
- [ ] Related words display per context appropriately
- [ ] Integration with existing VariantCalculator confirmed
- [ ] Test data serves as template for additional reflexive verbs
-----

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
