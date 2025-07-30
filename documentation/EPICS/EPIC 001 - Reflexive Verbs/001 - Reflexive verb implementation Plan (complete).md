# Epic: Reflexive Verbs Implementation - Technical Project Plan (Corrected)

## Executive Summary

This document outlines the complete implementation plan for Misti's **Reflexive Verbs Epic**, which introduces **multiple translations architecture** and **translation-first design**. While focused on reflexive verbs (lavarsi, comprarsi, incontrarsi), this epic establishes the foundational architecture that will support multiple meanings across all Italian word types.

**Epic Goal**: Enable users to learn word translations separately (direct vs. reciprocal vs. indirect reflexive) with independent spaced repetition tracking, providing pedagogically sound language learning that mirrors how native speakers understand these complex grammatical patterns.

**GitHub Project**: This document serves as the living technical specification for the Reflexive Verbs implementation epic and will be updated as development progresses.

The core innovation is our **translation-first system**, which recognizes that Italian words have multiple distinct translations that should be learned separately. This approach mirrors how native speakers actually understand language: not as word-to-word mappings, but as translation-dependent meaning relationships.

## Epic Scope & Deliverables

**Primary Scope**: Reflexive Verbs with Multiple Translations Architecture

- ✅ Direct Reflexive: "Mi lavo" = "I wash myself" 
- ✅ Reciprocal: "Ci laviamo" = "We wash each other"
- ✅ Indirect Reflexive: "Mi compro" = "I buy for myself"

**Target Verbs for Implementation**:

1. **lavarsi** (primary test case) - direct + reciprocal translations
2. **comprarsi** (validation case) - indirect reflexive translation
3. **incontrarsi** (edge case) - primarily reciprocal translation

**Architecture Foundation**: This epic creates the foundational architecture for:

- Multiple translations per word (universal polysemy support)
- Translation-based display prioritization
- Form-level translation assignment  
- Context metadata for usage guidance
- Form-level translation multiplicity

**Out of Scope** (Future Epics):

- Spaced Repetition System implementation
- Premium Audio generation and playback
- Deck management and card creation
- Progress tracking and analytics

-----

## Architectural Philosophy & Design Reasoning

### The Multiple Translations Challenge

Italian presents unique challenges for language learners because many words carry multiple translations that change based on grammatical context. The word "lavarsi" exemplifies this complexity:

- **Direct Reflexive**: "Mi lavo" = "I wash myself" (action performed on oneself)
- **Reciprocal**: "Ci laviamo" = "We wash each other" (mutual action between subjects)

Traditional language learning approaches treat these as the same word with context-dependent meanings, leading to confusion and incomplete understanding. Our architecture treats them as separate **translations** that happen to share the same grammatical forms.

### Why Translation-First Design Matters Pedagogically

Research in second language acquisition shows that learners build more robust vocabulary when they understand distinct translations separately rather than trying to memorize multiple meanings simultaneously. Our spaced repetition system leverages this by tracking mastery of each translation independently.

For example, a user might achieve 85% confidence with "lavarsi = wash oneself" while still struggling with the reciprocal translation at 40% confidence. Traditional systems would show average progress, masking this important distinction.

### Universal Architecture Design

While our discussion focuses on reflexive verbs, the architecture we're building applies universally across Italian. The noun "piano" demonstrates this:

- **Musical Translation**: "piano" = "piano" (the instrument)
- **Architectural Translation**: "piano" = "floor/level" (in buildings)  
- **Planning Translation**: "piano" = "plan/scheme" (abstract concept)

Each translation has different usage contexts, different related words, and different learning priorities. Our translation-first system handles this naturally.

-----

## Database Architecture

### Core Schema Design

Our database structure reflects linguistic reality rather than forcing Italian into English-centric patterns. Here's the foundational schema:

```sql
-- FOUNDATION: Base word storage (unchanged)
CREATE TABLE dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  italian text NOT NULL,
  english text NOT NULL, -- Primary/most common translation only (for backward compatibility)
  word_type text NOT NULL, -- 'VERB', 'NOUN', 'ADJECTIVE', 'ADVERB'
  tags text[], -- Grammatical properties ['reflexive-verb', 'essere-auxiliary']
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- TRANSLATION LAYER: Multiple translations per word (NEW)
CREATE TABLE word_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid NOT NULL REFERENCES dictionary(id) ON DELETE CASCADE,
  translation text NOT NULL, -- 'to wash oneself', 'to wash each other'
  display_priority integer NOT NULL DEFAULT 1, -- 1 = primary/most common for UI display
  context_metadata jsonb DEFAULT '{}', -- {"usage": "reciprocal", "plurality": "plural-only"}
  usage_notes text, -- "Used when subjects perform action on each other"
  frequency_estimate numeric DEFAULT 0.5, -- Statistical frequency of this translation
  created_at timestamp DEFAULT now()
);

-- GRAMMATICAL LAYER: All word forms (unchanged from existing)
CREATE TABLE word_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid REFERENCES dictionary(id) ON DELETE CASCADE,
  form_text text NOT NULL, -- 'mi lavo', 'ci laviamo', 'lavarsi'
  form_type text NOT NULL, -- 'conjugation', 'plural', 'irregular'
  
  -- Conjugation-specific fields (existing)
  form_mood text, -- 'indicativo', 'congiuntivo', 'infinito'
  form_tense text, -- 'presente', 'passato-prossimo'
  form_person text, -- 'io', 'tu', 'noi' (null for infinitives)
  form_number text, -- 'singolare', 'plurale'
  
  -- Grammatical metadata (existing)
  auxiliary_type text, -- 'avere', 'essere'
  tags text[], -- ['io', 'mi', 'compound', 'irregular']
  phonetic_form text, -- IPA or simplified pronunciation
  audio_metadata_id uuid, -- Link to premium audio when available
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- ASSIGNMENT LAYER: Forms assigned to specific translations (NEW)
CREATE TABLE form_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES word_forms(id) ON DELETE CASCADE,
  word_translation_id uuid NOT NULL REFERENCES word_translations(id) ON DELETE CASCADE,
  translation text NOT NULL, -- 'we wash ourselves', 'we wash each other' 
  usage_examples jsonb DEFAULT '[]', -- [{"italian": "Ci laviamo prima di cena", "english": "We wash ourselves before dinner"}]
  assignment_method text DEFAULT 'automatic', -- 'automatic', 'manual', 'calculated-variant'
  confidence_score numeric DEFAULT 1.0, -- How confident we are in this assignment
  created_at timestamp DEFAULT now(),
  
  UNIQUE(form_id, word_translation_id) -- One assignment per form per translation
);

-- SRS INTEGRATION: Progress tracking per form+translation (NEW - placeholder for future)
CREATE TABLE user_form_translation_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  form_translation_id uuid NOT NULL REFERENCES form_translations(id) ON DELETE CASCADE,
  deck_id uuid REFERENCES decks(id) ON DELETE SET NULL,
  
  -- Spaced Repetition Algorithm fields
  difficulty_factor numeric DEFAULT 2.5,
  interval_days integer DEFAULT 1,
  repetitions integer DEFAULT 0,
  correct_streak integer DEFAULT 0,
  total_reviews integer DEFAULT 0,
  correct_reviews integer DEFAULT 0,
  last_reviewed timestamp,
  next_review timestamp,
  average_response_time numeric,
  
  -- Metadata
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id, form_translation_id, deck_id)
);
```

### Key Design Decisions Explained

**Why separate word_translations from dictionary?**
This enables the same word to have multiple distinct translations with different priorities, usage contexts, and frequency estimates. "lavarsi" can have both "to wash oneself" and "to wash each other" as separate, trackable translations.

**Why store context_metadata as JSONB rather than separate columns?**
Context information is diverse and optional. Some translations need plurality restrictions ("plural-only" for reciprocal), others need register information ("formal", "colloquial"), others need semantic domains ("body-care", "social-interaction"). JSONB provides flexibility without schema bloat.

**Why track progress per form_translation rather than per word or per translation?**
This enables the core pedagogical innovation: users can master "ci laviamo = we wash ourselves" while still learning "ci laviamo = we wash each other." Each form+translation combination gets its own spaced repetition schedule.

-----

## Business Logic Implementation

### Enhanced Dictionary System

The EnhancedDictionarySystem class orchestrates the complex interactions between words, translations, forms, and assignments:

```javascript
// lib/enhanced-dictionary-system.js
export class EnhancedDictionarySystem {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.cache = new Map();
  }

  /**
   * Load words with all translations and form assignments
   * This is the core method that brings together our entire architecture
   */
  async loadWordsWithTranslations(searchTerm = '', filters = {}) {
    try {
      // Base query gets words with all related data
      let query = this.supabase
        .from('dictionary')
        .select(`
          id,
          italian,
          english,
          word_type,
          tags,
          created_at,
          word_translations(
            id,
            translation,
            display_priority,
            context_metadata,
            usage_notes,
            frequency_estimate
          ),
          word_forms(
            id,
            form_text,
            form_type,
            form_mood,
            form_tense,
            form_person,
            form_number,
            tags,
            form_translations(
              id,
              translation,
              usage_examples,
              assignment_method,
              confidence_score,
              word_translation_id
            )
          )
        `)
        .order('italian', { ascending: true });

      // Apply search and filtering
      if (searchTerm) {
        query = query.or(`italian.ilike.%${searchTerm}%,english.ilike.%${searchTerm}%`);
      }

      if (filters.wordType) {
        query = query.eq('word_type', filters.wordType);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data: words, error } = await query.limit(20);
      if (error) throw error;

      // Process and enhance the loaded data
      return await Promise.all(words.map(word => this.enhanceWordWithTranslations(word)));
    } catch (error) {
      console.error('Error loading words with translations:', error);
      throw error;
    }
  }

  /**
   * Enhanced word processing that handles multiple translations and generates
   * missing gender variants using our VariantCalculator
   */
  async enhanceWordWithTranslations(word) {
    const enhanced = { ...word };

    // Generate articles for nouns (existing logic)
    if (word.word_type === 'NOUN') {
      enhanced.articles = this.generateArticles(word);
    }

    // Process translations for display with priority ordering
    enhanced.processedTranslations = this.processTranslationsForDisplay(word.word_translations);

    // Generate missing gender variants for reflexive verbs
    if (word.tags?.includes('reflexive-verb')) {
      enhanced.word_forms = this.generateGenderVariants(word.word_forms, word.tags);
    }

    // Resolve related words and usage examples
    enhanced.enrichedTranslations = await this.enrichTranslationsWithExamples(word.word_translations);

    return enhanced;
  }

  /**
   * Process translations for display with proper prioritization and context info
   */
  processTranslationsForDisplay(translations) {
    if (!translations || translations.length === 0) return [];

    return translations
      .sort((a, b) => a.display_priority - b.display_priority)
      .map(translation => ({
        id: translation.id,
        translation: translation.translation,
        priority: translation.display_priority,
        isPrimary: translation.display_priority === 1,
        contextInfo: this.parseContextMetadata(translation.context_metadata),
        usageNotes: translation.usage_notes,
        frequencyEstimate: translation.frequency_estimate || 0.5
      }));
  }

  /**
   * Parse context metadata for UI display
   */
  parseContextMetadata(metadata) {
    if (!metadata || Object.keys(metadata).length === 0) return null;

    return {
      usage: metadata.usage || null, // 'formal', 'reciprocal', 'direct-reflexive'
      plurality: metadata.plurality || null, // 'plural-only', 'singular-only', 'any'
      register: metadata.register || null, // 'formal', 'informal', 'neutral'  
      semanticDomain: metadata.semantic_domain || null, // 'body-care', 'social-interaction'
    };
  }

  /**
   * Generate gender variants for reflexive verbs using our VariantCalculator
   * This integrates with the multiple translations system
   */
  generateGenderVariants(storedForms, wordTags) {
    const allForms = [...storedForms];

    // Import our VariantCalculator
    const { VariantCalculator } = require('./variant-calculator');

    storedForms.forEach(form => {
      // Check if this form needs gender variants
      const variantData = VariantCalculator.needsGenderVariants(wordTags, form.tags);
      if (variantData) {
        // Generate calculated variants
        const variants = VariantCalculator.calculateGenderVariants(form, wordTags);
        if (variants) {
          // Each variant inherits the same form_translations as the base form
          variants.forEach(variant => {
            variant.form_translations = form.form_translations.map(assignment => ({
              ...assignment,
              id: `${assignment.id}-${variant.variant_type}`,
              form_id: variant.id,
              assignment_method: 'calculated-variant',
              // Translation text stays the same - gender variants don't change meaning
            }));
          });
          allForms.push(...variants);
        }
      }
    });

    return allForms;
  }
}
```

### Translation Assignment Engine

The core innovation is our intelligent assignment of forms to appropriate translations:

```javascript
// lib/translation-assignment-engine.js
export class TranslationAssignmentEngine {
  
  /**
   * Assign existing word forms to appropriate translations based on content matching
   * This is the core migration and ongoing assignment logic
   */
  static assignFormsToTranslations(word, wordTranslations, wordForms) {
    const assignments = [];

    wordForms.forEach(form => {
      if (!form.translation || form.translation.trim() === '') {
        // Skip forms without translations
        return;
      }

      // Find best matching translation(s) for this form
      const matches = this.findTranslationMatches(form, wordTranslations);
      
      matches.forEach(match => {
        assignments.push({
          form_id: form.id,
          word_translation_id: match.translation_id,
          translation: form.translation,
          assignment_method: match.method,
          confidence_score: match.confidence,
          usage_examples: this.generateUsageExamples(form, match.translation)
        });
      });
    });

    return assignments;
  }

  /**
   * Find matching translations for a word form based on semantic content
   */
  static findTranslationMatches(form, wordTranslations) {
    const matches = [];
    const formTranslation = form.translation.toLowerCase().trim();

    wordTranslations.forEach(wordTranslation => {
      const translationText = wordTranslation.translation.toLowerCase().trim();
      let confidence = 0;
      let method = 'automatic';

      // Direct keyword matching
      if (this.containsKeywords(formTranslation, translationText)) {
        confidence = 0.9;
        method = 'keyword-match';
      }

      // Semantic pattern matching for reflexive verbs
      if (form.tags?.includes('reflexive') && wordTranslation.context_metadata) {
        const contextMatch = this.checkReflexiveContext(form, wordTranslation.context_metadata);
        if (contextMatch.matches) {
          confidence = Math.max(confidence, contextMatch.confidence);
          method = 'reflexive-context';
        }
      }

      // Plurality constraints for reciprocal verbs
      if (wordTranslation.context_metadata?.plurality === 'plural-only') {
        const isPlural = form.tags?.includes('plurale') || 
                        ['noi', 'voi', 'loro'].some(p => form.tags?.includes(p));
        if (!isPlural) {
          confidence = 0; // Don't assign singular forms to plural-only translations
        }
      }

      if (confidence > 0.3) { // Minimum confidence threshold
        matches.push({
          translation_id: wordTranslation.id,
          translation: wordTranslation.translation,
          confidence,
          method
        });
      }
    });

    // If no matches found, assign to primary translation (priority 1)
    if (matches.length === 0) {
      const primaryTranslation = wordTranslations.find(t => t.display_priority === 1);
      if (primaryTranslation) {
        matches.push({
          translation_id: primaryTranslation.id,
          translation: primaryTranslation.translation,
          confidence: 0.5,
          method: 'fallback-primary'
        });
      }
    }

    return matches;
  }

  /**
   * Check if form translation contains keywords from word translation
   */
  static containsKeywords(formTranslation, wordTranslation) {
    // Extract key verbs and concepts
    const wordKeywords = this.extractKeywords(wordTranslation);
    const formKeywords = this.extractKeywords(formTranslation);
    
    // Check for overlap
    const overlap = wordKeywords.filter(keyword => 
      formKeywords.some(formKeyword => 
        formKeyword.includes(keyword) || keyword.includes(formKeyword)
      )
    );
    
    return overlap.length > 0;
  }

  /**
   * Extract meaningful keywords from translation text
   */
  static extractKeywords(text) {
    // Remove common words and extract meaningful content
    const stopWords = ['to', 'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
    const words = text.split(/\s+/)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase())
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    return words;
  }

  /**
   * Check reflexive context compatibility
   */
  static checkReflexiveContext(form, contextMetadata) {
    if (!contextMetadata?.usage) {
      return { matches: false, confidence: 0 };
    }

    const usage = contextMetadata.usage;
    
    // Direct reflexive: requires reflexive pronouns
    if (usage === 'direct-reflexive') {
      const hasReflexivePronoun = ['mi', 'ti', 'si', 'ci', 'vi'].some(p => 
        form.tags?.includes(p) || form.form_text.includes(p)
      );
      return { 
        matches: hasReflexivePronoun, 
        confidence: hasReflexivePronoun ? 0.8 : 0 
      };
    }

    // Reciprocal: requires plural subjects
    if (usage === 'reciprocal') {
      const isPlural = form.tags?.includes('plurale') || 
                      ['noi', 'voi', 'loro'].some(p => form.tags?.includes(p));
      return { 
        matches: isPlural, 
        confidence: isPlural ? 0.8 : 0 
      };
    }

    return { matches: true, confidence: 0.5 };
  }
}
```

-----

## UI/UX Implementation

### Translation Selection Interface

The UI focuses on **translation selection** rather than context switching:

```jsx
// components/TranslationSelector.js
export default function TranslationSelector({ word, selectedTranslationId, onTranslationChange }) {
  const sortedTranslations = word.processedTranslations.sort((a, b) => a.priority - b.priority);

  return (
    <div className="translation-selector">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Translation:
      </label>
      <div className="flex flex-wrap gap-2">
        {sortedTranslations.map(translation => (
          <button
            key={translation.id}
            onClick={() => onTranslationChange(translation.id)}
            className={`
              px-4 py-2 rounded-lg border-2 transition-all duration-200
              ${selectedTranslationId === translation.id
                ? 'border-teal-500 bg-teal-50 text-teal-800 font-semibold'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }
              ${translation.isPrimary ? 'ring-2 ring-blue-200' : ''}
            `}
            title={translation.usageNotes}
          >
            <div className="flex items-center gap-2">
              <span>{translation.translation}</span>
              {translation.isPrimary && (
                <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                  Primary
                </span>
              )}
              {translation.contextInfo?.plurality && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">
                  {translation.contextInfo.plurality}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### ConjugationModal Enhancement

The ConjugationModal now focuses on translation switching rather than context switching:

```jsx
// components/ConjugationModal.js
export default function ConjugationModal({ isOpen, onClose, word, userAudioPreference = 'form-only' }) {
  const [selectedTranslationId, setSelectedTranslationId] = useState(null);
  const [selectedMood, setSelectedMood] = useState('indicativo');
  const [selectedTense, setSelectedTense] = useState('presente');
  const [selectedGender, setSelectedGender] = useState('male');
  const [forms, setForms] = useState([]);

  // Load forms with all translation assignments
  useEffect(() => {
    if (isOpen && word) {
      loadFormsWithTranslations();
    }
  }, [isOpen, word]);

  const loadFormsWithTranslations = async () => {
    // Get all forms for this word with their translation assignments
    const { data: wordForms, error } = await supabase
      .from('word_forms')
      .select(`
        *,
        form_translations(
          id,
          translation,
          usage_examples,
          assignment_method,
          confidence_score,
          word_translations(
            id,
            translation,
            display_priority,
            context_metadata,
            usage_notes
          )
        )
      `)
      .eq('word_id', word.id)
      .eq('form_mood', selectedMood)
      .eq('form_tense', selectedTense);

    if (error) {
      console.error('Error loading forms:', error);
      return;
    }

    // Process forms and generate gender variants if needed
    const processedForms = VariantCalculator.getAllForms(wordForms, word.tags || []);
    setForms(processedForms);

    // Set default translation if not selected
    if (!selectedTranslationId && word.processedTranslations?.length > 0) {
      const primaryTranslation = word.processedTranslations.find(t => t.isPrimary) || 
                               word.processedTranslations[0];
      setSelectedTranslationId(primaryTranslation.id);
    }
  };

  /**
   * Get the appropriate translation for a form based on selected translation
   * This is where multiple translations come together in the UI
   */
  const getTranslationForSelectedTranslation = (form, translationId) => {
    const assignment = form.form_translations?.find(
      ft => ft.word_translations.id === translationId
    );
    return assignment?.translation || form.form_text;
  };

  /**
   * Get available translations from all form assignments
   */
  const getAvailableTranslations = () => {
    const translationMap = new Map();
    
    forms.forEach(form => {
      form.form_translations?.forEach(assignment => {
        const translation = assignment.word_translations;
        if (translation) {
          translationMap.set(translation.id, {
            id: translation.id,
            translation: translation.translation,
            priority: translation.display_priority,
            contextInfo: translation.context_metadata,
            usageNotes: translation.usage_notes,
            isPrimary: translation.display_priority === 1
          });
        }
      });
    });
    
    return Array.from(translationMap.values()).sort((a, b) => a.priority - b.priority);
  };

  const availableTranslations = getAvailableTranslations();

  return (
    <div className={`conjugation-modal ${isOpen ? 'open' : 'closed'}`}>
      <div className="modal-header">
        <h2>📝 Conjugations: {word?.italian}</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="modal-controls">
        {/* Translation Selector - The key innovation */}
        <TranslationSelector
          word={{ processedTranslations: availableTranslations }}
          selectedTranslationId={selectedTranslationId}
          onTranslationChange={setSelectedTranslationId}
        />

        {/* Existing controls for mood, tense, gender */}
        <div className="mood-tense-controls">
          {/* Implementation continues... */}
        </div>
      </div>

      <div className="forms-display">
        {forms.map(form => (
          <ConjugationRow
            key={form.id}
            form={form}
            selectedTranslationId={selectedTranslationId}
            selectedGender={selectedGender}
            translation={getTranslationForSelectedTranslation(form, selectedTranslationId)}
            onStudy={(formTranslationId) => addToSRS(formTranslationId)}
          />
        ))}
      </div>
    </div>
  );
}
```

-----

## Implementation Phases

### Phase 1: Database Foundation (Weeks 1-2)

**Priority: Critical - Everything depends on this**

1. **Schema Implementation**
- Drop existing incorrect tables (`word_semantic_contexts`, `form_translations`, `user_form_translation_progress`)
- Create new translation-first tables (`word_translations`, `form_translations`, `user_form_translation_progress`)
- Set up proper constraints, indexes, and relationships
- Test migration scripts on development environment

2. **Translation Migration**  
- Analyze existing 21 words for multiple translations (ciao, bello, grande, parlare, etc.)
- Create word_translations entries for all detected meanings
- Migrate 432 existing word forms using translation matching logic
- Verify all forms have appropriate translation assignments

3. **Test Data Creation**
- Implement "lavarsi" with both direct and reciprocal translations
- Create comprehensive form assignments demonstrating translation matching
- Add usage examples and context metadata
- Validate gender variant generation works with new system

### Phase 2: Business Logic Core (Weeks 3-4)

**Priority: Critical - Core functionality**

1. **EnhancedDictionarySystem Implementation**
- Complete the word loading with translations system
- Implement translation-aware search and filtering
- Add translation prioritization and display logic
- Create caching layer for performance

2. **TranslationAssignmentEngine**
- Finish intelligent form-to-translation matching algorithms
- Add reflexive verb special handling
- Implement confidence scoring and fallback logic
- Add unit tests for assignment accuracy

### Phase 3: UI Foundation (Weeks 5-6)

**Priority: High - User interaction foundation**

1. **TranslationSelector Component**
- Implement translation selection interface
- Add priority indicators and context hints
- Create smooth transition animations
- Integrate with existing modal systems

2. **ConjugationModal Enhancement**
- Replace context switching with translation switching
- Add form filtering based on selected translation
- Integrate audio playback with translation selection
- Create translation-specific usage examples display

### Phase 4: Testing & Polish (Weeks 7-8)

**Priority: High - Quality assurance**

1. **Translation Assignment Accuracy**
- Create test suites for form-to-translation matching
- Validate reflexive verb handling
- Test gender variant integration
- Performance testing with large datasets

2. **User Experience Polish**
- Refine translation switching animations
- Optimize loading performance
- Add contextual help and usage guidance
- Implement accessibility features

-----

## Future Extensions

### Advanced Features (Phase 5+)

1. **Machine Learning Assignment**
- Train models on successful human translation assignments
- Improve automatic matching confidence scores
- Predictive translation creation for new words

2. **Community Validation**
- User feedback on translation assignments
- Crowdsourced translation quality scoring
- Community-generated usage examples

3. **Advanced Analytics**  
- Translation mastery tracking across word families
- Difficulty modeling per translation type
- Personalized translation prioritization

-----

## Success Metrics

### Technical Metrics

- **Translation Assignment Accuracy**: 90%+ automatic assignment success rate
- **Database Performance**: Sub-100ms response times for complex translation queries
- **System Reliability**: 99.9% uptime for core learning functions

### Pedagogical Metrics

- **Translation Differentiation**: Users achieve different mastery levels per translation
- **Learning Efficiency**: 25% improvement in retention vs. single-translation approach  
- **User Engagement**: Increased study time due to clearer progress tracking

### Business Metrics

- **Feature Adoption**: 80%+ of users engage with multiple translations
- **Translation Utility**: Average 2.3 translations per word for multi-meaning words
- **User Retention**: Improved long-term engagement due to sophisticated learning system

## Epic Success Criteria

Upon completion, the system will demonstrate the most sophisticated approach to multiple word meanings available in language learning applications, with translation-first design that mirrors how native speakers actually understand and use language.

-----

## GitHub Project Tracking

**Repository**: misti-italian-learning  
**Project Board**: Reflexive Verbs Implementation Epic  
**Milestone**: v2.0 - Advanced Grammar Support

**Progress Tracking**: This document will be updated with implementation progress, architectural decisions, and lessons learned as the epic develops. Each phase completion will be marked with completion dates and any scope adjustments.
