# Epic: Reflexive Verbs Implementation - Technical Project Plan

## Executive Summary

This document outlines the complete implementation plan for Misti’s **Reflexive Verbs Epic**, which introduces multiple translations architecture and semantic context management. While focused on reflexive verbs (lavarsi, comprarsi, incontrarsi), this epic establishes the foundational architecture that will support polysemy across all Italian word types.

**Epic Goal**: Enable users to learn reflexive verb meanings separately (direct vs. reciprocal vs. indirect reflexive) with independent spaced repetition tracking, providing pedagogically sound language learning that mirrors how native speakers understand these complex grammatical patterns.

**GitHub Project**: This document serves as the living technical specification for the Reflexive Verbs implementation epic and will be updated as development progresses.

The core innovation is our **semantic context system**, which recognizes that Italian reflexive verbs have multiple related but distinct meanings that should be learned separately. This approach mirrors how native speakers actually understand language: not as word-to-word translations, but as context-dependent meaning relationships.

## Epic Scope & Deliverables

**Primary Scope**: Reflexive Verbs with Multiple Meanings Architecture

- ✅ Direct Reflexive: “Mi lavo” = “I wash myself”
- ✅ Reciprocal: “Ci laviamo” = “We wash each other”
- ✅ Indirect Reflexive: “Mi compro” = “I buy for myself”

**Target Verbs for Implementation**:

1. **lavarsi** (primary test case) - direct + reciprocal
1. **comprarsi** (validation case) - indirect reflexive
1. **incontrarsi** (edge case) - primarily reciprocal

**Architecture Foundation**: This epic creates the foundational architecture for:

- Multiple meanings per word (universal polysemy support)
- Semantic context management and display
- Context-aware word relationships
- Form-level translation multiplicity
- Gender variant generation for reflexive verbs

**Out of Scope** (Future Epics):

- Spaced Repetition System implementation
- Premium Audio generation and playback
- Deck management and card creation
- Progress tracking and analytics

-----

## Architectural Philosophy & Design Reasoning

### The Multiple Meanings Challenge

Italian presents unique challenges for language learners because many words carry multiple meanings that change based on grammatical context. The word “lavarsi” exemplifies this complexity:

- **Direct Reflexive**: “Mi lavo” = “I wash myself” (action performed on oneself)
- **Reciprocal**: “Ci laviamo” = “We wash each other” (mutual action between subjects)

Traditional language learning approaches treat these as the same word with the same translation, leading to confusion and incomplete understanding. Our architecture treats them as separate semantic contexts that happen to share the same grammatical forms.

### Why Separate Contexts Matter Pedagogically

Research in second language acquisition shows that learners build more robust vocabulary when they understand distinct meanings separately rather than trying to memorize multiple translations simultaneously. Our spaced repetition system leverages this by tracking mastery of each meaning independently.

For example, a user might achieve 85% confidence with “lavarsi = wash oneself” while still struggling with the reciprocal meaning at 40% confidence. Traditional systems would show average progress, masking this important distinction.

### Universal Architecture Design

While our discussion focused on reflexive verbs, the architecture we’re building applies universally across Italian. The noun “piano” demonstrates this:

- **Musical Context**: “piano” = “piano” (the instrument)
- **Architectural Context**: “piano” = “floor/level” (in buildings)
- **Planning Context**: “piano” = “plan/scheme” (abstract concept)

Each context has different related words, different usage patterns, and different learning priorities. Our semantic context system handles this naturally.

-----

## Database Architecture

### Core Schema Design

Our database structure reflects linguistic reality rather than forcing Italian into English-centric patterns. Here’s the foundational schema:

```sql
-- FOUNDATION: Base word storage
CREATE TABLE dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  italian text NOT NULL,
  english text NOT NULL, -- Primary/most common meaning only
  word_type text NOT NULL, -- 'VERB', 'NOUN', 'ADJECTIVE', 'ADVERB'
  tags text[], -- Grammatical properties ['reflexive-verb', 'essere-auxiliary']
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- SEMANTIC LAYER: Multiple meanings per word
CREATE TABLE word_semantic_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid REFERENCES dictionary(id) ON DELETE CASCADE,
  context_type text NOT NULL, -- 'direct-reflexive', 'reciprocal', 'musical-instrument'
  context_name text NOT NULL, -- Human-readable: 'Wash Oneself', 'Piano Instrument'
  base_translation text NOT NULL, -- 'to wash oneself', 'piano'
  semantic_tags text[], -- ['self-directed', 'body-care'] or ['music', 'instrument']
  frequency_rank integer, -- 1 = most common meaning
  context_links jsonb[], -- Related words specific to this meaning
  created_at timestamp DEFAULT now()
);

-- GRAMMATICAL LAYER: All word forms (conjugations, plurals, etc.)
CREATE TABLE word_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid REFERENCES dictionary(id) ON DELETE CASCADE,
  form_text text NOT NULL, -- 'mi lavo', 'ci laviamo', 'lavarsi'
  form_type text NOT NULL, -- 'conjugation', 'plural', 'irregular'
  
  -- Conjugation-specific fields
  form_mood text, -- 'indicativo', 'congiuntivo', 'infinito'
  form_tense text, -- 'presente', 'passato-prossimo', 'presente'
  form_person text, -- 'io', 'tu', 'noi' (null for infinitives/general forms)
  form_number text, -- 'singolare', 'plurale'
  
  -- Grammatical metadata
  auxiliary_type text, -- 'avere', 'essere'
  tags text[], -- ['io', 'mi', 'compound', 'irregular']
  phonetic_form text, -- IPA or simplified pronunciation
  audio_metadata_id uuid, -- Link to premium audio when available
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- TRANSLATION LAYER: Context-specific meanings for each form
CREATE TABLE form_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES word_forms(id) ON DELETE CASCADE,
  semantic_context_id uuid REFERENCES word_semantic_contexts(id) ON DELETE CASCADE,
  translation text NOT NULL, -- 'we wash ourselves', 'we wash each other'
  usage_examples jsonb, -- [{"italian": "Ci laviamo prima di cena", "english": "We wash ourselves before dinner"}]
  context_notes text, -- Additional pedagogical notes
  created_at timestamp DEFAULT now(),
  
  UNIQUE(form_id, semantic_context_id) -- One translation per form per context
);

-- SRS INTEGRATION: Progress tracking per translation (not per word)
CREATE TABLE user_form_translation_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  form_translation_id uuid REFERENCES form_translations(id) ON DELETE CASCADE,
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

**Why separate form_translations from word_forms?**
This separation allows the same grammatical form to have different meanings in different contexts. “Ci laviamo” is one form but has two possible translations depending on whether we mean reflexive or reciprocal action.

**Why store context_links in semantic_contexts rather than dictionary?**
Word relationships are meaning-specific, not word-specific. “Piano” as a musical instrument relates to “pianista” (pianist), but “piano” as a floor level relates to “scala” (staircase). Storing links at the context level prevents semantic confusion.

**Why track progress per form_translation rather than per word?**
This enables the core pedagogical innovation: users can master “lavarsi = wash oneself” while still learning “lavarsi = wash each other.” Each meaning gets its own spaced repetition schedule based on individual mastery.

-----

## Business Logic Implementation

### Enhanced Dictionary System

The EnhancedDictionarySystem class orchestrates the complex interactions between words, contexts, forms, and translations:

```javascript
// lib/enhanced-dictionary-system.js
export class EnhancedDictionarySystem {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.cache = new Map();
  }

  /**
   * Load words with all semantic contexts and form translations
   * This is the core method that brings together our entire architecture
   */
  async loadWordsWithContexts(searchTerm = '', filters = {}) {
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
          word_semantic_contexts(
            id,
            context_type,
            context_name,
            base_translation,
            semantic_tags,
            frequency_rank,
            context_links
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
              context_notes,
              semantic_context_id
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
      return await Promise.all(words.map(word => this.enhanceWordWithContext(word)));
    } catch (error) {
      console.error('Error loading words with contexts:', error);
      throw error;
    }
  }

  /**
   * Enhanced word processing that handles multiple contexts and generates
   * missing gender variants using our VariantCalculator
   */
  async enhanceWordWithContext(word) {
    const enhanced = { ...word };

    // Generate articles for nouns (existing logic)
    if (word.word_type === 'NOUN') {
      enhanced.articles = this.generateArticles(word);
    }

    // Process semantic contexts for display
    enhanced.processedContexts = this.processContextsForDisplay(word.word_semantic_contexts);

    // Generate missing gender variants for reflexive verbs
    if (word.tags?.includes('reflexive-verb')) {
      enhanced.word_forms = this.generateGenderVariants(word.word_forms, word.tags);
    }

    // Resolve context links to actual words
    enhanced.relatedWordsByContext = await this.resolveContextLinks(word.word_semantic_contexts);

    return enhanced;
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
            variant.form_translations = form.form_translations.map(translation => ({
              ...translation,
              id: `${translation.id}-${variant.variant_type}`,
              form_id: variant.id,
              // Translation text stays the same - gender variants don't change meaning
            }));
          });
          allForms.push(...variants);
        }
      }
    });

    return allForms;
  }

  /**
   * Resolve context_links to actual word data for related word display
   */
  async resolveContextLinks(contexts) {
    const relatedByContext = {};

    for (const context of contexts) {
      if (context.context_links && context.context_links.length > 0) {
        // Extract word IDs from context links
        const linkedWordIds = context.context_links.map(link => link.word_id);
        
        // Fetch related words
        const { data: relatedWords, error } = await this.supabase
          .from('dictionary')
          .select('id, italian, english, word_type')
          .in('id', linkedWordIds);

        if (!error && relatedWords) {
          // Map back to link types
          relatedByContext[context.id] = context.context_links.map(link => {
            const word = relatedWords.find(w => w.id === link.word_id);
            return {
              ...word,
              link_type: link.link_type,
              context_id: link.context_id
            };
          });
        }
      }
    }

    return relatedByContext;
  }
}
```

### Variant Calculator Enhancement

The VariantCalculator handles the complex logic of determining when and how to generate gender variants for Italian verb forms:

```javascript
// lib/variant-calculator.js
export class VariantCalculator {
  
  /**
   * Determine if a form needs gender variants based on verb type and form characteristics
   * This is the core logic that drives our gender variant system
   */
  static needsGenderVariants(wordTags, formTags = []) {
    // REFLEXIVE verbs with ESSERE auxiliary in COMPOUND tenses need gender variants
    if (wordTags.includes('reflexive-verb') && 
        wordTags.includes('essere-auxiliary') && 
        formTags.includes('compound')) {
      
      // Exclude progressive forms - they use gerunds, not past participles
      if (formTags.includes('presente-progressivo') || 
          formTags.includes('passato-progressivo')) {
        return null;
      }
      
      return {
        type: 'reflexive-compound',
        variants: ['fem-sing', 'fem-plur']
      };
    }

    // NON-REFLEXIVE verbs with ESSERE auxiliary also need gender variants
    if (wordTags.includes('essere-auxiliary') && 
        formTags.includes('compound') && 
        !formTags.includes('presente-progressivo') && 
        !formTags.includes('passato-progressivo')) {
      
      return {
        type: 'essere-compound',
        variants: ['fem-sing', 'fem-plur']
      };
    }

    return null;
  }

  /**
   * Generate gender variants by transforming past participles
   * This handles all major Italian participle patterns
   */
  static calculateGenderVariants(storedForm, wordTags) {
    const variantPattern = this.needsGenderVariants(wordTags, storedForm.tags || []);
    if (!variantPattern) return null;

    const variants = [];
    
    // Determine if this is a plural form
    const isPlural = storedForm.tags?.includes('plurale') ||
                     ['noi', 'voi', 'loro'].some(p => storedForm.tags?.includes(p));

    if (isPlural) {
      // For plural forms, generate feminine plural only
      const femPluralForm = this.transformParticiple(
        storedForm.form_text, 
        'feminine', 
        'plural'
      );
      
      variants.push({
        id: `${storedForm.id}-fem-plur`,
        form_text: femPluralForm,
        variant_type: 'fem-plur',
        base_form_id: storedForm.id,
        tags: [...(storedForm.tags || []), 'feminine', 'calculated-variant'],
        // Inherit all other properties from base form
        form_type: storedForm.form_type,
        form_mood: storedForm.form_mood,
        form_tense: storedForm.form_tense,
        form_person: storedForm.form_person,
        form_number: storedForm.form_number,
        auxiliary_type: storedForm.auxiliary_type
      });
    } else {
      // For singular forms, generate feminine singular only
      const femSingularForm = this.transformParticiple(
        storedForm.form_text,
        'feminine', 
        'singular'
      );
      
      variants.push({
        id: `${storedForm.id}-fem-sing`,
        form_text: femSingularForm,
        variant_type: 'fem-sing',
        base_form_id: storedForm.id,
        tags: [...(storedForm.tags || []), 'feminine', 'calculated-variant'],
        form_type: storedForm.form_type,
        form_mood: storedForm.form_mood,
        form_tense: storedForm.form_tense,
        form_person: storedForm.form_person,
        form_number: storedForm.form_number,
        auxiliary_type: storedForm.auxiliary_type
      });
    }

    return variants;
  }

  /**
   * Transform past participles following Italian morphological rules
   * This handles both simple and compound forms
   */
  static transformParticiple(masculineForm, targetGender, targetNumber) {
    // For compound forms like "mi sono lavato", extract and transform the participle
    if (masculineForm.includes(' ')) {
      const parts = masculineForm.split(' ');
      const participle = parts[parts.length - 1]; // Last word is the participle
      const transformedParticiple = this.applyParticipleRules(participle, targetGender, targetNumber);
      
      // Reconstruct the full form
      parts[parts.length - 1] = transformedParticiple;
      return parts.join(' ');
    } else {
      // Simple participle transformation
      return this.applyParticipleRules(masculineForm, targetGender, targetNumber);
    }
  }

  /**
   * Apply morphological transformation rules to Italian past participles
   * Covers all major patterns in Italian verb morphology
   */
  static applyParticipleRules(participle, targetGender, targetNumber) {
    // REGULAR -ATO PATTERN (andato, parlato, lavato)
    if (participle.endsWith('ato')) {
      const stem = participle.slice(0, -3);
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'ata';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'ati';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'ate';
      return participle; // masculine singular (original)
    }

    // REGULAR -ITO PATTERN (finito, partito, servito)
    if (participle.endsWith('ito')) {
      const stem = participle.slice(0, -3);
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'ita';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'iti';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'ite';
      return participle;
    }

    // REGULAR -UTO PATTERN (venuto, caduto, piaciuto)
    if (participle.endsWith('uto')) {
      const stem = participle.slice(0, -3);
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'uta';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'uti';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'ute';
      return participle;
    }

    // Add more patterns as needed...
    
    return participle; // Fallback for unrecognized patterns
  }
}
```

-----

## UI/UX Implementation

### ConjugationModal Enhancement

The ConjugationModal becomes the showcase for our multiple contexts system, allowing users to explore different meanings of the same verb forms:

```jsx
// components/ConjugationModal.js
export default function ConjugationModal({ isOpen, onClose, word, userAudioPreference = 'form-only' }) {
  const [selectedContext, setSelectedContext] = useState(null);
  const [selectedMood, setSelectedMood] = useState('indicativo');
  const [selectedTense, setSelectedTense] = useState('presente');
  const [selectedGender, setSelectedGender] = useState('male');
  const [forms, setForms] = useState([]);

  // Load forms with all translations
  useEffect(() => {
    if (isOpen && word) {
      loadFormsWithTranslations();
    }
  }, [isOpen, word]);

  const loadFormsWithTranslations = async () => {
    // Get all forms for this word with their translations
    const { data: wordForms, error } = await supabase
      .from('word_forms')
      .select(`
        *,
        form_translations(
          id,
          translation,
          usage_examples,
          semantic_context_id,
          word_semantic_contexts(
            context_type,
            context_name,
            base_translation
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

    // Set default context if not selected
    if (!selectedContext && processedForms.length > 0) {
      const firstTranslation = processedForms[0].form_translations?.[0];
      if (firstTranslation) {
        setSelectedContext(firstTranslation.semantic_context_id);
      }
    }
  };

  /**
   * Get the appropriate translation for a form based on selected context
   * This is where multiple translations come together in the UI
   */
  const getTranslationForContext = (form, contextId) => {
    const translation = form.form_translations?.find(
      t => t.semantic_context_id === contextId
    );
    return translation?.translation || form.form_text;
  };

  /**
   * Get available contexts from all form translations
   */
  const getAvailableContexts = () => {
    const contexts = new Map();
    
    forms.forEach(form => {
      form.form_translations?.forEach(translation => {
        const context = translation.word_semantic_contexts;
        if (context) {
          contexts.set(translation.semantic_context_id, {
            id: translation.semantic_context_id,
            name: context.context_name,
            type: context.context_type,
            translation: context.base_translation
          });
        }
      });
    });
    
    return Array.from(contexts.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const availableContexts = getAvailableContexts();

  return (
    <div className={`conjugation-modal ${isOpen ? 'open' : 'closed'}`}>
      <div className="modal-header">
        <h2>📝 Conjugations: {word?.italian}</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="modal-controls">
        {/* Context Selector - The key innovation */}
        <div className="context-selector">
          <label>Meaning:</label>
          <select 
            value={selectedContext || ''} 
            onChange={(e) => setSelectedContext(e.target.value)}
          >
            {availableContexts.map(context => (
              <option key={context.id} value={context.id}>
                {context.name}: {context.translation}
              </option>
            ))}
          </select>
        </div>

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
            selectedContext={selectedContext}
            selectedGender={selectedGender}
            translation={getTranslationForContext(form, selectedContext)}
            onStudy={(formTranslationId) => addToSRS(formTranslationId)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual row showing a conjugation form with context-aware translation
 */
function ConjugationRow({ form, selectedContext, translation, onStudy }) {
  return (
    <div className="conjugation-row">
      <div className="pronoun">{extractPronoun(form.tags)}</div>
      <div className="form-text">{form.form_text}</div>
      <div className="translation">{translation}</div>
      <div className="actions">
        <AudioButton 
          formId={form.id}
          contextId={selectedContext}
          text={form.form_text}
        />
        <button 
          onClick={() => onStudy(getFormTranslationId(form, selectedContext))}
          className="study-button"
        >
          + Study
        </button>
      </div>
    </div>
  );
}
```

-----

## Spaced Repetition System Integration

### SRS Foundation Requirements

Our multiple translations architecture requires specific considerations for the SRS implementation:

**Key Principle**: Each form+context combination gets independent spaced repetition tracking. This allows users to master “ci laviamo = we wash ourselves” while still learning “ci laviamo = we wash each other.”

### Card Generation Strategy

```javascript
// lib/srs-card-generator.js
export class SRSCardGenerator {
  
  /**
   * Generate flashcards from form translations
   * Each card represents one form in one semantic context
   */
  static generateCardsFromFormTranslations(word, selectedContexts = []) {
    const cards = [];
    
    // If no contexts selected, include all contexts
    const contextsToInclude = selectedContexts.length > 0 
      ? selectedContexts 
      : word.word_semantic_contexts.map(c => c.id);

    word.word_forms.forEach(form => {
      form.form_translations
        ?.filter(translation => contextsToInclude.includes(translation.semantic_context_id))
        .forEach(translation => {
          
          // Generate card data
          const cardData = {
            id: `${word.id}-${form.id}-${translation.semantic_context_id}`,
            word_id: word.id,
            form_id: form.id,
            form_translation_id: translation.id,
            
            // Card front (what user sees first)
            front: {
              italian: form.form_text,
              context_hint: translation.word_semantic_contexts?.context_name,
              audio_filename: form.audio_metadata?.audio_filename
            },
            
            // Card back (answer)
            back: {
              english: translation.translation,
              usage_examples: translation.usage_examples,
              context_notes: translation.context_notes
            },
            
            // Metadata for SRS algorithm
            metadata: {
              word_type: word.word_type,
              form_type: form.form_type,
              context_type: translation.word_semantic_contexts?.context_type,
              difficulty_estimate: this.estimateInitialDifficulty(word, form, translation)
            }
          };
          
          cards.push(cardData);
        });
    });
    
    return cards;
  }

  /**
   * Estimate initial difficulty based on linguistic complexity
   * This helps the SRS algorithm start with appropriate intervals
   */
  static estimateInitialDifficulty(word, form, translation) {
    let difficulty = 2.5; // Standard starting difficulty
    
    // Reflexive verbs are generally harder
    if (word.tags?.includes('reflexive-verb')) {
      difficulty += 0.3;
    }
    
    // Compound tenses are more complex
    if (form.tags?.includes('compound')) {
      difficulty += 0.2;
    }
    
    // Reciprocal meanings are less common, therefore harder
    if (translation.word_semantic_contexts?.context_type === 'reciprocal') {
      difficulty += 0.4;
    }
    
    // Irregular forms require more attention
    if (form.tags?.includes('irregular')) {
      difficulty += 0.3;
    }
    
    return Math.min(difficulty, 3.5); // Cap at reasonable maximum
  }
}
```

### Deck Management Integration

```javascript
// lib/deck-manager.js
export class DeckManager {
  
  /**
   * Add word with context selection to deck
   * Users can choose which meanings to study
   */
  async addWordToDeck(deckId, wordId, selectedContextIds = []) {
    // Load word with all contexts and forms
    const word = await this.loadWordWithContexts(wordId);
    
    // Generate cards for selected contexts only
    const cards = SRSCardGenerator.generateCardsFromFormTranslations(
      word, 
      selectedContextIds
    );
    
    // Create progress tracking entries for each card
    const progressEntries = cards.map(card => ({
      user_id: this.userId,
      form_translation_id: card.form_translation_id,
      deck_id: deckId,
      difficulty_factor: card.metadata.difficulty_estimate,
      next_review: new Date(), // Available for immediate study
      created_at: new Date()
    }));
    
    // Insert into database
    const { error } = await this.supabase
      .from('user_form_translation_progress')
      .insert(progressEntries);
    
    if (error) throw error;
    
    return {
      cards_added: cards.length,
      contexts_included: selectedContextIds.length
    };
  }

  /**
   * Get due cards for review with context information
   */
  async getDueCards(deckId, limit = 20) {
    const { data: dueEntries, error } = await this.supabase
      .from('user_form_translation_progress')
      .select(`
        *,
        form_translations(
          translation,
          usage_examples,
          word_forms(
            form_text,
            tags,
            dictionary(italian, word_type)
          ),
          word_semantic_contexts(
            context_name,
            context_type,
            base_translation
          )
        )
      `)
      .eq('deck_id', deckId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    
    // Transform into card format for study session
    return dueEntries.map(entry => ({
      progress_id: entry.id,
      front: {
        italian: entry.form_translations.word_forms.form_text,
        context_hint: entry.form_translations.word_semantic_contexts.context_name
      },
      back: {
        english: entry.form_translations.translation,
        examples: entry.form_translations.usage_examples
      },
      current_interval: entry.interval_days,
      repetitions: entry.repetitions,
      difficulty_factor: entry.difficulty_factor
    }));
  }
}
```

-----

## Audio System Architecture

### Premium Audio Strategy

Our audio system needs to handle multiple contexts while maintaining cost efficiency:

```javascript
// lib/audio-system.js
export class AudioSystem {
  
  /**
   * Generate audio for forms with variant support
   * Handles both single-context and multi-context scenarios
   */
  async generateAudioForWord(wordId, voiceName = 'it-IT-ElsaNeural') {
    const word = await this.loadWordWithForms(wordId);
    const audioSpecs = [];
    
    // Generate audio variants based on user preferences and form types
    word.word_forms.forEach(form => {
      // Basic form pronunciation (most important)
      audioSpecs.push({
        form_id: form.id,
        variant_type: 'form-only',
        spoken_text: form.form_text,
        filename: this.generateAudioFilename(wordId, form.id, 'form-only', voiceName)
      });
      
      // With-pronoun variants for better context learning
      if (this.shouldGenerateWithPronoun(form)) {
        const pronoun = this.extractPronoun(form.tags);
        if (pronoun) {
          audioSpecs.push({
            form_id: form.id,
            variant_type: 'with-pronoun',
            spoken_text: `${pronoun} ${form.form_text}`,
            filename: this.generateAudioFilename(wordId, form.id, 'with-pronoun', voiceName)
          });
        }
      }
      
      // Gender variants for reflexive compounds
      if (word.tags?.includes('reflexive-verb') && form.tags?.includes('compound')) {
        const feminineForm = VariantCalculator.transformParticiple(
          form.form_text, 
          'feminine', 
          form.tags?.includes('plurale') ? 'plural' : 'singular'
        );
        
        if (feminineForm !== form.form_text) {
          audioSpecs.push({
            form_id: form.id,
            variant_type: 'feminine-form',
            spoken_text: feminineForm,
            filename: this.generateAudioFilename(wordId, form.id, 'feminine', voiceName)
          });
        }
      }
    });
    
    // Generate actual audio files
    const results = await Promise.all(
      audioSpecs.map(spec => this.generateSingleAudioFile(spec, voiceName))
    );
    
    return results;
  }

  /**
   * Intelligent audio filename generation with deduplication
   */
  generateAudioFilename(wordId, formId, variantType, voiceName) {
    const hash = this.generateContentHash(wordId, formId, variantType);
    return `${wordId}-${voiceName}-${hash}.ogg`;
  }

  /**
   * Azure TTS integration with OPUS format for efficiency
   */
  async generateSingleAudioFile(audioSpec, voiceName) {
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="it-IT">
        <voice name="${voiceName}">
          <prosody rate="0.9" pitch="medium">
            ${audioSpec.spoken_text}
          </prosody>
        </voice>
      </speak>
    `;
    
    const response = await fetch(this.azureEndpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.azureKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'ogg-24khz-16bit-mono-opus',
        'User-Agent': 'misti-audio-generator'
      },
      body: ssml
    });
    
    if (!response.ok) {
      throw new Error(`Azure TTS failed: ${response.status}`);
    }
    
    const audioBuffer = await response.arrayBuffer();
    
    // Store in Supabase Storage
    const { data, error } = await this.supabase.storage
      .from('conjugation-audio')
      .upload(audioSpec.filename, audioBuffer, {
        contentType: 'audio/ogg',
        duplex: false
      });
    
    if (error) throw error;
    
    // Create metadata record
    await this.createAudioMetadata(audioSpec, audioBuffer.byteLength, voiceName);
    
    return {
      filename: audioSpec.filename,
      size_bytes: audioBuffer.byteLength,
      variant_type: audioSpec.variant_type
    };
  }
}
```

-----

## Implementation Phases

### Phase 1: Database Foundation (Weeks 1-2)

**Priority: Critical - Everything depends on this**

1. **Schema Implementation**
- Create all new tables with proper constraints and indexes
- Migrate existing dictionary data to new structure
- Set up foreign key relationships and cascading deletes
- Create database functions for common queries
1. **Basic Data Population**
- Implement “lavarsi” as our test case with both direct and reciprocal contexts
- Create forms for present indicative mood
- Generate basic form translations for both contexts
- Add sample usage examples

**SRS Integration Point**: Design progress tracking to work with form_translation_id instead of word_id from the start.

### Phase 2: Business Logic Core (Weeks 3-4)

**Priority: Critical - Core functionality**

1. **EnhancedDictionarySystem Implementation**
- Complete the word loading with contexts system
- Implement context-aware search and filtering
- Add word linking resolution
- Create caching layer for performance
1. **VariantCalculator Enhancement**
- Finish gender variant generation for reflexive verbs
- Add comprehensive participle transformation rules
- Integrate with multiple translations system
- Add unit tests for morphological accuracy

**SRS Integration Point**: Create card generation logic that produces separate cards per form+context combination.

### Phase 3: UI Foundation (Weeks 5-6)

**Priority: High - User interaction foundation**

1. **ConjugationModal Enhancement**
- Implement context switching interface
- Add gender toggle for appropriate forms
- Create form display with context-aware translations
- Integrate audio playback with variant selection
1. **Dictionary Panel Updates**
- Show multiple contexts per word
- Add context-specific related words
- Implement “Study This Context” buttons
- Create context preview system

**SRS Integration Point**: Add “Study” buttons that create proper progress tracking entries per context.

### Phase 4: SRS Implementation (Weeks 7-8)

**Priority: Critical - Core learning functionality**

1. **Card Generation System**
- Implement SRSCardGenerator with context support
- Create deck management for multiple contexts
- Add difficulty estimation algorithms
- Build card review interface
1. **Progress Tracking**
- Complete user_form_translation_progress integration
- Implement spaced repetition algorithm (FSRS or SM-2)
- Add progress analytics per context
- Create review scheduling system

### Phase 5: Audio Integration (Weeks 9-10)

**Priority: High - Premium experience**

1. **Audio Generation Pipeline**
- Implement Azure TTS integration with OPUS format
- Create variant-aware audio generation
- Add deduplication and caching
- Build audio metadata management
1. **Audio Playback System**
- Integrate with context-aware display
- Add premium audio indicators
- Implement TTS fallback system
- Create audio preference management

### Phase 6: Testing & Polish (Weeks 11-12)

**Priority: Medium - Quality assurance**

1. **Comprehensive Testing**
- Create test suites for morphological accuracy
- Test SRS algorithm effectiveness
- Validate context switching functionality
- Performance testing with large datasets
1. **User Experience Polish**
- Refine context switching animations
- Optimize loading performance
- Add contextual help and tutorials
- Implement accessibility features

-----

## Future Extensions

### Advanced Features (Phase 7+)

1. **Double Pronouns Support**
- Extend form generation to handle “me lo lavo” patterns
- Create smart filtering for useful combinations
- Add advanced audio generation for complex forms
1. **Regional Variations**
- Support different Italian dialects and regional forms
- Add context for formal vs. informal usage
- Implement geo-specific vocabulary
1. **Advanced Analytics**
- Context mastery tracking across word families
- Predictive difficulty modeling
- Personalized learning path recommendations
1. **Component Audio Strategy**
- Break audio into reusable components (pronouns + verb stems)
- Real-time audio synthesis for custom combinations
- Dramatic reduction in storage requirements

-----

## Success Metrics

### Technical Metrics

- **Database Performance**: Sub-100ms response times for complex context queries
- **Audio Quality**: 95%+ user satisfaction with pronunciation accuracy
- **System Reliability**: 99.9% uptime for core learning functions

### Pedagogical Metrics

- **Context Differentiation**: Users achieve different mastery levels per meaning
- **Learning Efficiency**: 25% improvement in retention vs. single-translation approach
- **User Engagement**: Increased study time due to clearer progress tracking

### Business Metrics

- **Feature Adoption**: 80%+ of users engage with multiple contexts
- **Premium Audio Usage**: 60%+ conversion to premium audio features
- **User Retention**: Improved long-term engagement due to sophisticated learning system

## Epic Success Metrics

### Reflexive Verbs Learning Outcomes

- **Context Differentiation**: Users achieve different mastery levels for direct vs. reciprocal meanings
- **Morphological Accuracy**: 95%+ accuracy in gender variant generation for compound forms
- **Learning Efficiency**: Users report clearer understanding of reflexive verb usage patterns

### Technical Architecture Validation

- **Performance**: Sub-100ms response times for complex context queries
- **Scalability**: Architecture supports expansion to 50+ reflexive verbs without degradation
- **Code Quality**: Comprehensive test coverage for morphological transformations

### Foundation for Future Epics

- **Universal Polysemy**: Architecture proven to work for non-reflexive words (piano, banco, etc.)
- **Audio System**: Variant generation pipeline ready for expansion
- **SRS Integration**: Context-aware progress tracking validated and performant

This epic establishes the architectural foundation that enables Misti to handle the genuine linguistic complexity of Italian while maintaining pedagogical effectiveness through intelligent spaced repetition. Upon completion, the system will demonstrate the most sophisticated approach to reflexive verb learning available in language learning applications.

-----

## GitHub Project Tracking

**Repository**: misti-italian-learning  
**Project Board**: Reflexive Verbs Implementation Epic  
**Milestone**: v2.0 - Advanced Grammar Support

**Progress Tracking**: This document will be updated with implementation progress, architectural decisions, and lessons learned as the epic develops. Each phase completion will be marked with completion dates and any scope adjustments.