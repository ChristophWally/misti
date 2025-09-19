# Misti Dictionary - Word Types Architecture

> **Comprehensive Guide to Word Type Implementation and Logic**
>
> This document outlines the complete architecture for handling all Italian word types in the Misti dictionary system, from the currently implemented types to planned expansions.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Universal Metadata System](#2-universal-metadata-system)
3. [Currently Implemented Word Types](#3-currently-implemented-word-types)
4. [Newly Architected Word Types](#4-newly-architected-word-types)
5. [Planned Word Types](#5-planned-word-types)
6. [Cross-Cutting Architectural Decisions](#6-cross-cutting-architectural-decisions)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Architecture Overview

### Core Design Principles

**Translation-First Architecture**: The Misti dictionary prioritizes the relationship between Italian words and their English translations, with metadata attached at the appropriate linguistic level.

**Three-Level Metadata System**:
- **Word-Level**: Inherent properties of the Italian lemma (gender, conjugation type, CEFR level)
- **Translation-Level**: Properties specific to translation meanings (auxiliary verb, transitivity, register)
- **Form-Level**: Properties of conjugated/declined forms (tense, mood, person, number)

**Forms Storage Strategy**:
- **Store forms when**: Unpredictable changes, high frequency, search importance
- **Calculate on frontend when**: Predictable patterns, low complexity, educational value
- **Hybrid approach when**: Complex patterns with regular sub-patterns

### Database Foundation

```sql
-- Core tables in the translation-first system
dictionary              -- Base Italian words (lemmas)
├── word_translations   -- Multiple English meanings per word
├── word_forms         -- Conjugated/declined forms (primarily verbs)
├── form_translations  -- Links between forms and translation meanings
└── entity_meta_values -- UUID-based metadata system (replaces legacy tags)
```

---

## 2. Universal Metadata System

### Core Attributes Applied to All Word Types

The following metadata attributes are **universally applied** across all word types in the Misti dictionary system. These provide consistent categorization and learning support regardless of the specific word type.

#### 2.1 CEFR Level Classification

**Attribute**: `metaattr003` - **CEFR Level**

**Purpose**: Indicates the proficiency level at which learners typically encounter this word, based on the Common European Framework of Reference for Languages.

**Values**:
- `A1` - Absolute beginner level (basic survival vocabulary)
- `A2` - Elementary level (extended basic vocabulary)
- `B1` - Intermediate level (complex situations and topics)
- `B2` - Upper-intermediate level (nuanced expression)
- `C1` - Advanced level (sophisticated communication)
- `C2` - Proficiency level (near-native usage)
- `native` - Native speaker vocabulary
- `academic` - Academic/scholarly contexts
- `literary` - Literary and poetic usage
- `specialized` - Technical or domain-specific terms

**Application**: All words receive CEFR classification to support progressive learning and level-appropriate content delivery.

#### 2.2 Frequency Tier Classification

**Attribute**: `metaattr007` - **Frequency Tier**

**Purpose**: Ranks words by usage frequency in contemporary Italian, helping prioritize learning based on practical utility.

**Values**:
- `top100` - Most essential 100 words
- `top500` - Essential 500 words
- `top1000` - Important 1000 words
- `top2500` - Common 2500 words
- `top5000` - Extended vocabulary (5000 words)
- `top10000` - Comprehensive vocabulary coverage

**Application**: Frequency tiers drive presentation order in learning interfaces and help students focus on high-impact vocabulary first.

#### 2.3 Irregularity Pattern System

**Attribute**: `metaattr005` - **Irregular Forms** (form-level, propagates to word-level)

**Purpose**: Identifies morphological irregularities that learners need to memorize rather than derive from standard patterns.

**Values**:
- `irregular` - Form deviates from conjugation pattern (metaattr005val032)

**Architecture**: Irregularities are identified at the **form level** and automatically propagate to mark the entire word as irregular, ensuring comprehensive coverage while maintaining precision.

**Application**: Irregular words receive special handling in learning interfaces, with explicit memorization support and pattern recognition exercises.

### Universal Metadata Integration

These universal attributes integrate seamlessly with word-type-specific metadata through the normalized `entity_meta_values` system:

- **Storage Location**: All universal metadata stored via `entity_meta_values` table with appropriate `entity_type` ('word', 'form', etc.)
- **Inheritance Rules**: Word-level universal attributes (CEFR, frequency) automatically propagate to all forms and translations
- **Display Priority**: Universal attributes appear prominently in all learning interfaces as "essential tags"
- **Filter Integration**: All universal attributes are available in Advanced Filters for targeted vocabulary practice

---

## 3. Currently Implemented Word Types

### 3.1 VERB

**Implementation Status**: ✅ **Fully Implemented**

**Architecture Summary**:
The verb system represents the most complex word type implementation, serving as the template for sophisticated form handling.

> **📋 Detailed Technical Documentation**: For comprehensive details on verb forms, conjugation patterns, auxiliary systems, and form-translation architecture, see the [Verb Forms System Architecture](./verb-forms-system-architecture.md) documentation.

**Word-Level Metadata**:
- `metaattr004` - **Conjugation Type**: `are`, `ere`, `ire`, `ire-isc`
- `metaattr017` - **Reflexive**: `reflexive` (for inherently reflexive verbs)

**Translation-Level Metadata**:
- `metaattr002` - **Auxiliary Verb**: `avere`, `essere` (for compound tenses)
- `metaattr020` - **Transitivity**: `transitive`, `intransitive`, `ambitransitive`
- `metaattr021` - **Reflexive Type**: `direct`, `reciprocal` (for specific translation meanings)
- `metaattr018` - **Register**: `formal`, `casual`, `neutral`, `mixed`

**Form-Level Metadata**:
- `metaattr010` - **Mood**: `indicativo`, `congiuntivo`, `condizionale`, `imperativo`, `infinito`, `participio`, `gerundio`
- `metaattr019` - **Tense**: `presente`, `imperfetto`, `passato-remoto`, `futuro-semplice`, `passato-prossimo`, etc.
- `metaattr014` - **Person**: `prima-persona`, `seconda-persona`, `terza-persona`
- `metaattr012` - **Number**: `singolare`, `plurale`
- `metaattr022` - **Verb Form Type**: `simple`, `compound`, `progressive`
- `metaattr002` - **Auxiliary** (for compound forms): `avere`, `essere`

**Forms Storage**:
Complete conjugation paradigms are stored in `word_forms` table (~100-140 forms per verb), including:
- All simple tenses: parlo, parlavo, parlai, parlerò
- All compound tenses: ho parlato, avevo parlato, avrò parlato
- All progressive forms: sto parlando, stavo parlando
- All non-finite forms: parlare, parlando, parlato

**Frontend Features**:
- Comprehensive conjugation display
- Auxiliary verb indication
- Essential vs. detailed tag categorization
- Verb type indicators (regular/irregular/reflexive)

---

### 3.2 NOUN

**Implementation Status**: ✅ **Fully Implemented**

**Architecture Summary**:
The noun system focuses on gender, number, and article generation with support for irregular plural formations.

**Word-Level Metadata**:
- `metaattr011` - **Word Gender**: `masculine`, `feminine`, `common-gender`
- `metaattr012` - **Number**: `singolare`, `plurale` (for words with inherent number restrictions)
- `metaattr013` - **Number Restriction**: `singular only`, `plural only` (for defective nouns)
- `metaattr026` - **Plural Formation**: `plural-e`, `plural-i`

**Translation-Level Metadata**:
- `metaattr018` - **Register**: Formality level for specific meanings
- Optional topic tags: `metaattr_opt_tag_word` with `topic-*` values

**Forms Storage**:
Generally no forms stored - articles and plural forms are calculated on the frontend using algorithmic generation based on gender and phonetic rules.

**Frontend Features**:
- **Article Generation**: Automatic definite/indefinite article calculation
  - Definite: il/lo/la/i/gli/le based on gender and phonetics
  - Indefinite: un/uno/una/un' based on gender and phonetics
- **Plural Preview**: Shows expected plural form (casa → case)
- **Gender Indicators**: Visual ♂/♀/⚥ symbols
- **Essential Tag Display**: Gender and CEFR level prominently shown

**Article Generation Logic**:
```javascript
// Simplified algorithm for article generation
calculateArticle(word, gender, isPlural) {
  const firstChar = word.charAt(0);
  const firstTwo = word.substring(0, 2);

  if (gender === 'masculine') {
    if (isPlural) {
      return /[aeiou]/.test(firstChar) || specialCases.includes(firstTwo) ? 'gli' : 'i';
    } else {
      return /[aeiou]/.test(firstChar) || specialCases.includes(firstTwo) ? 'lo' : 'il';
    }
  }
  // ... feminine logic
}
```

---

### 3.3 ADJECTIVE

**Implementation Status**: ✅ **Fully Implemented**

**Architecture Summary**:
The adjective system handles agreement patterns, position preferences, and gradability.

**Word-Level Metadata**:
- `metaattr009` - **Gradable**: `Analytical`, `Full`, `Non-gradable`
- `metaattr011` - **Word Gender**: `masculine`, `feminine`, `common-gender` (for agreement)
- `position` - **Position**: `before`, `after`, `before/after` (relative to noun)

**Translation-Level Metadata**:
- `metaattr008` - **Gender Usage**: `male-only`, `female-only` (for gender-specific meanings)
- `metaattr018` - **Register**: Formality level

**Forms Storage**:
Minimal forms storage - agreement forms are typically calculated on frontend based on regular patterns (alto/alta/alti/alte).

**Frontend Features**:
- **Position Indicators**: Shows preferred placement relative to noun
- **Gradability Display**: Indicates if adjective can be compared (più alto, altissimo)
- **Agreement Preview**: Shows masculine/feminine forms
- **Essential vs. Detailed Tags**: Position and gradability as essential, register as detailed

---

### 3.4 ADVERB

**Implementation Status**: ✅ **Fully Implemented**

**Architecture Summary**:
The adverb system classifies by semantic type and position, with most adverbs being invariable.

**Word-Level Metadata**:
- `metaattr001` - **Adverb Type**: `manner`, `time`, `place`, `quantity`, `frequency`, `affirmation`, `doubt`, `negation`, `interrogative`, `evaluation`, `emphasis`
- `position` - **Position**: `before`, `after`, `before/after` (sentence position preferences)

**Translation-Level Metadata**:
- `metaattr018` - **Register**: Formality level for specific uses

**Forms Storage**:
Generally no forms stored - adverbs are typically invariable in Italian.

**Frontend Features**:
- **Type Classification**: Clear semantic category display (manner, time, place, etc.)
- **Position Indicators**: Shows typical sentence position
- **Frequency Emphasis**: High-frequency adverbs prominently displayed

**Current Filter Integration**:
```javascript
// From enhanced-dictionary-system.js
const adverbTypeMap = {
  'adverb-manner': 'manner',      // come, bene, male
  'adverb-time': 'time',          // oggi, ieri, sempre
  'adverb-place': 'place',        // qui, là, dove
  'adverb-quantity': 'quantity',  // molto, poco, abbastanza
  'adverb-frequency': 'frequency', // spesso, mai, sempre
  'adverb-affirmation': 'affirmation', // sì, certo
  'adverb-doubt': 'doubt',        // forse, probabilmente
  'adverb-negation': 'negation',  // non, mai
  'adverb-interrogative': 'interrogative', // quando, dove, come
  'adverb-evaluation': 'evaluation', // bene, male
  'adverb-emphasis': 'emphasis'   // proprio, davvero
};
```

---

## 4. Newly Architected Word Types

### 4.1 PREPOSITION

**Implementation Status**: 🔄 **Architecture Complete - Ready for Implementation**

**Architecture Summary**:
Prepositions use a hybrid approach: atomic storage for base forms, explicit storage for contracted forms, and compound form recognition for multi-word prepositional expressions.

**Storage Strategy**:

**1. Atomic Base Storage**:
Store only fundamental prepositional lemmas in the `dictionary` table:
```sql
INSERT INTO dictionary (italian, word_type) VALUES
('di', 'preposition'), ('a', 'preposition'), ('da', 'preposition'),
('in', 'preposition'), ('con', 'preposition'), ('su', 'preposition'),
('per', 'preposition'), ('senza', 'preposition'), ('durante', 'preposition');
```

**2. Contracted Forms Storage**:
Store contracted forms with articles in `word_forms` table:
```sql
-- Forms for "di" + definite articles
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(di_id, 'di', 'base'),
(di_id, 'del', 'contracted'),    -- di + il
(di_id, 'della', 'contracted'),  -- di + la
(di_id, 'dello', 'contracted'),  -- di + lo (special form)
(di_id, 'dei', 'contracted'),    -- di + i
(di_id, 'delle', 'contracted'),  -- di + le
(di_id, 'degli', 'contracted');  -- di + gli (special form)
```

**3. Prepositional Compound Forms**:
Store true prepositional compounds as forms of the semantic head:
```sql
-- Compound prepositional forms
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(davanti_id, 'davanti a', 'prep_compound'),
(prima_id, 'prima di', 'prep_compound'),
(dietro_id, 'dietro a', 'prep_compound'),
(vicino_id, 'vicino a', 'prep_compound');
```

**Word-Level Metadata**:
- `metaattr027` - **Preposition Structure**: `simple`, `compound_capable`, `contracted_capable`, `invariable`
- `metaattr028` - **Semantic Domain**: `spatial`, `temporal`, `causal`, `instrumental`, `partitive`, `benefactive`
- `metaattr029` - **Government Pattern**: `noun_phrase`, `infinitive`, `both`, `sentence`

**Translation-Level Metadata**:
- `metaattr030` - **Usage Context**: `literal_spatial`, `figurative_spatial`, `temporal_point`, `temporal_duration`, `causal_direct`, `instrumental`

**Form-Level Metadata** (for contracted/compound forms):
- `metaattr031` - **Contraction Type**: `base_form`, `definite_contraction`, `special_phonetic`
- `metaattr032` - **Article Agreement**: `masculine_singular`, `feminine_singular`, `masculine_plural`, `feminine_plural`, `special_masculine`, `special_plural`

**True Prepositional Compounds** (to be stored as `prep_compound` forms):
- **Spatial**: davanti a, dietro a, vicino a, lontano da, accanto a, intorno a
- **Temporal**: prima di, dopo di, fino a
- **Other**: insieme a, invece di

**Rationale for Compound Forms**:
Unlike noun phrases like "a causa di", these compounds function as unified prepositional units with distinct translations that cannot be compositionally derived from their parts:
- "davanti" = "in front/ahead" + "a" = "to/at" ≠ "davanti a" = "in front of"
- Users will search for "davanti a" as a unit
- Each needs its own specific translation

**Frontend Features**:
- **Contracted Forms Display**: Show all contraction variants (del, della, dello, etc.)
- **Compound Form Recognition**: Display compound prepositions with clear derivation
- **Semantic Role Indicators**: Visual indicators for spatial, temporal, causal functions
- **Usage Context Examples**: Show different semantic contexts for each translation

---

## 5. Planned Word Types

*The following word types have initial architectural planning but are not yet implemented.*

### 5.1 DETERMINER

**Implementation Status**: 📋 **Planned**

**Examples**: il, che, un, una, suo, questo, quello, due, loro, quale

**Architectural Challenges**:
- Complex agreement patterns (gender, number, case-like behavior)
- Multiple subcategories (definite, indefinite, demonstrative, possessive, quantitative)
- Forms system needed for agreement (questo/questa/questi/queste)

**Planned Word-Level Metadata**:
- `metaattr033` - **Determiner Type**: `definite`, `indefinite`, `demonstrative`, `possessive`, `quantitative`, `interrogative`
- `metaattr034` - **Agreement Pattern**: `full_agreement`, `partial_agreement`, `invariant`
- `metaattr035` - **Position**: `prenominal`, `postnominal`, `both`

**Planned Translation-Level Metadata**:
- `metaattr036` - **Semantic Function**: `reference`, `quantity`, `possession`, `demonstration`

**Forms Strategy**:
Store agreement paradigms similar to adjectives:
```sql
-- Forms for "questo" (demonstrative)
INSERT INTO word_forms (word_id, form_text, form_type, tags) VALUES
(questo_id, 'questo', 'base', ['masculine', 'singular']),
(questo_id, 'questa', 'agreement', ['feminine', 'singular']),
(questo_id, 'questi', 'agreement', ['masculine', 'plural']),
(questo_id, 'queste', 'agreement', ['feminine', 'plural']);
```

---

### 5.2 CONJUNCTION

**Implementation Status**: 📋 **Planned**

**Examples**: e, ma, ed, o, tra, mentre, fra, sia, nonostante, ovvero

**Architectural Challenges**:
- Logical relationship classification
- Coordination vs. subordination distinction
- Variant forms (e/ed, tra/fra)

**Planned Word-Level Metadata**:
- `metaattr037` - **Conjunction Type**: `coordinating`, `subordinating`, `correlative`
- `metaattr038` - **Logical Relationship**: `addition`, `contrast`, `disjunction`, `causal`, `temporal`, `conditional`
- `metaattr039` - **Syntactic Level**: `word_level`, `phrase_level`, `clause_level`

**Forms Strategy**:
Minimal forms - mainly for variants:
```sql
-- Forms for "e" conjunction
INSERT INTO word_forms (word_id, form_text, form_type, tags) VALUES
(e_id, 'e', 'base', []),
(e_id, 'ed', 'phonetic_variant', ['before_vowel']);
```

---

### 5.3 PRONOUN

**Implementation Status**: 📋 **Planned - High Complexity**

**Examples**: si, cui, se, lo, ci, gli, mi, lui, chi, li

**Architectural Challenges**:
- Most complex forms system after verbs
- Multiple pronoun types with different declension patterns
- Clitic vs. full pronoun distinctions
- Case system (nominative, accusative, dative, ablative)

**Planned Word-Level Metadata**:
- `metaattr040` - **Pronoun Type**: `personal`, `relative`, `demonstrative`, `interrogative`, `indefinite`, `reflexive`
- `metaattr041` - **Pronoun Form**: `clitic`, `full`, `both`
- `metaattr042` - **Case System**: `nominative_only`, `accusative_dative`, `full_case`

**Forms Strategy**:
Complex declension paradigms:
```sql
-- Forms for "io" (first person pronoun)
INSERT INTO word_forms (word_id, form_text, form_type, tags) VALUES
(io_id, 'io', 'nominative', ['first_person', 'singular']),
(io_id, 'me', 'accusative', ['first_person', 'singular']),
(io_id, 'mi', 'clitic_accusative', ['first_person', 'singular']),
(io_id, 'mi', 'clitic_dative', ['first_person', 'singular']);
```

---

### 5.4 MODAL VERBS

**Implementation Status**: 📋 **Planned - Extend Existing VERB System**

**Examples**: potere, dovere, volere, bisognare, osare

**Architectural Strategy**:
Extend existing verb architecture rather than create new word type.

**Additional Word-Level Metadata**:
- `metaattr043` - **Modal Type**: `necessity`, `possibility`, `volition`, `obligation`
- `metaattr044` - **Modal Behavior**: `auxiliary_selection_variable`, `impersonal_forms`

**Special Translation-Level Properties**:
- Auxiliary selection depends on dependent verb
- Special impersonal constructions (bisogna, occorre)

---

### 5.5 PROPER NOUN

**Implementation Status**: 📋 **Planned**

**Examples**: Italia, Roma, II, Maria, Giovanni, Milano, Europa, Francia

**Planned Word-Level Metadata**:
- `metaattr045` - **Proper Noun Type**: `person`, `place`, `organization`, `event`, `work`, `date`
- `metaattr046` - **Entity Category**: `country`, `city`, `person_name`, `title`, `brand`
- `metaattr011` - **Word Gender**: For agreement purposes (la Francia, il Giovanni)

**Forms Strategy**:
Generally invariable, but some place names have forms:
```sql
-- Most proper nouns have only base form
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(italia_id, 'Italia', 'base');

-- Some have plural or variant forms
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(stato_id, 'Stati Uniti', 'plural_only');
```

---

### 5.6 WH-WORDS

**Implementation Status**: 📋 **Planned**

**Examples**: come, quando, dove, comunque, ove, ovunque, laddove

**Planned Word-Level Metadata**:
- `metaattr047` - **WH Type**: `interrogative`, `relative`, `conditional`, `universal`
- `metaattr048` - **Semantic Category**: `manner`, `time`, `place`, `reason`, `quantity`

---

### 5.7 PARTICLE NE

**Implementation Status**: 📋 **Planned**

**Examples**: ne, n'

**Planned Word-Level Metadata**:
- `metaattr049` - **Particle Function**: `partitive`, `locative`, `possessive`, `indefinite`

**Forms Strategy**:
```sql
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(ne_id, 'ne', 'base'),
(ne_id, "n'", 'elided');  -- before vowels
```

---

### 5.8 INTERJECTIONS

**Implementation Status**: 📋 **Planned**

**Examples**: ciao, ah, beh, eh, oh

**Planned Word-Level Metadata**:
- `metaattr050` - **Interjection Type**: `greeting`, `exclamation`, `hesitation`, `agreement`, `surprise`
- `metaattr051` - **Emotional Tone**: `positive`, `negative`, `neutral`, `surprise`, `doubt`

---

### 5.9 ABBREVIATIONS

**Implementation Status**: 📋 **Planned**

**Examples**: ecc., etc, cfr., vs.

**Planned Word-Level Metadata**:
- `metaattr052` - **Abbreviation Type**: `latin`, `italian`, `international`
- `metaattr053` - **Expansion**: Store full form (ecc. → eccetera)

---

### 5.10 INDEFINITE PRONOUNS

**Implementation Status**: 📋 **Planned**

**Examples**: tale

**Planned Word-Level Metadata**:
- `metaattr054` - **Indefinite Type**: `quantitative`, `qualitative`, `selective`

**Forms Strategy**:
Agreement forms like adjectives:
```sql
INSERT INTO word_forms (word_id, form_text, form_type, tags) VALUES
(tale_id, 'tale', 'base', ['masculine', 'feminine', 'singular']),
(tale_id, 'tali', 'plural', ['masculine', 'feminine', 'plural']);
```

---

## 6. Cross-Cutting Architectural Decisions

### 6.1 Forms Storage Decision Matrix

**When to Store Forms**:
- ✅ **Unpredictable changes**: Verb conjugations, pronoun declensions
- ✅ **High-frequency variants**: Contracted prepositions (del, al, dal)
- ✅ **Search importance**: Users search for "del" not "di + il"
- ✅ **Complex patterns**: Irregular forms, suppletion

**When to Calculate on Frontend**:
- ✅ **Predictable patterns**: Noun articles, adjective agreement
- ✅ **Educational value**: Users learn compositional rules
- ✅ **Low complexity**: Simple phonetic alternations

**Hybrid Approaches**:
- ✅ **Compound prepositions**: Store as forms for searchability
- ✅ **Variant spellings**: Store common variants, calculate rare ones

### 6.2 Metadata Level Decisions

**Word-Level Metadata** (inherent to Italian lemma):
- Conjugation type, gender, CEFR level, frequency tier
- Structural properties: compound capability, agreement patterns

**Translation-Level Metadata** (specific to English meaning):
- Auxiliary verb selection, transitivity, register, semantic roles
- Usage context, domain specificity

**Form-Level Metadata** (properties of specific forms):
- Tense, mood, person, number for verbs
- Agreement markers for adjectives/determiners
- Contraction type for prepositions

### 6.3 Translation Strategy Patterns

**Multiple Translation Handling**:
- Primary translation (display_priority = 1) for basic meaning
- Secondary translations for specialized contexts
- Usage notes for contextual guidance
- Frequency estimates for translation selection

**Semantic Role Tagging**:
```javascript
// Pattern for semantic role classification
const semanticRoles = {
  spatial: ['location', 'direction', 'proximity'],
  temporal: ['time_point', 'duration', 'sequence'],
  causal: ['reason', 'purpose', 'result'],
  instrumental: ['means', 'method', 'tool']
};
```

### 6.4 Frontend Display Strategies

**Essential vs. Detailed Tags**:
- **Essential**: Displayed prominently, crucial for learning (gender, CEFR, frequency)
- **Detailed**: Available on expansion, for advanced learners (register, semantic domain)

**Word Type Color Coding**:
```javascript
const wordTypeColors = {
  'VERB': 'teal',      // Action words
  'NOUN': 'cyan',      // Thing words
  'ADJECTIVE': 'blue', // Description words
  'ADVERB': 'purple',  // Manner words
  'PREPOSITION': 'indigo', // Relationship words
  'DETERMINER': 'green',   // Reference words
  'CONJUNCTION': 'orange', // Connection words
  'PRONOUN': 'red'         // Reference words
};
```

---

## 7. Implementation Roadmap

### Phase 1: Core Function Words (Immediate Priority)
**Goal**: Handle the grammatical backbone of Italian

1. **PREPOSITION** (19 words)
   - Implement contracted forms system
   - Add prepositional compound forms
   - Create semantic role classification

2. **DETERMINER** (46 words)
   - Implement agreement forms system
   - Create determiner type classification
   - Handle article contraction patterns

3. **CONJUNCTION** (14 words)
   - Simple implementation, mostly invariable
   - Logical relationship classification
   - Variant form handling (e/ed, tra/fra)

### Phase 2: Reference Systems (Medium Priority)
**Goal**: Handle pronoun and modal systems

4. **PRONOUN** (45 words)
   - Complex forms system implementation
   - Case and clitic patterns
   - Integration with existing verb system

5. **MODAL VERBS** (5 words)
   - Extend existing verb system
   - Special auxiliary selection rules
   - Impersonal construction handling

6. **PARTICLE NE** (2 words)
   - Simple implementation with variants
   - Semantic function classification

### Phase 3: Content Words (Lower Priority)
**Goal**: Handle specialized and content word types

7. **PROPER NOUN** (1,210 words)
   - Large scale implementation
   - Entity type classification
   - Gender assignment for agreement

8. **WH-WORDS** (8 words)
   - Semantic category classification
   - Question vs. relative distinctions

### Phase 4: Peripheral Types (Final Priority)
**Goal**: Complete word type coverage

9. **INTERJECTIONS** (5 words)
10. **ABBREVIATIONS** (4 words)
11. **INDEFINITE PRONOUNS** (1 word)

### Implementation Metrics
**Total Word Coverage**: ~10,000 words from PAISA corpus
**Current Implementation**: ~6,811 words (68.1%)
**Phase 1 Target**: ~6,890 words (68.9%) - +79 words
**Phase 2 Target**: ~6,942 words (69.4%) - +52 words
**Phase 3 Target**: ~8,160 words (81.6%) - +1,218 words
**Full Implementation**: ~8,170 words (81.7%) - +10 words

---

## Conclusion

This architecture provides a comprehensive framework for handling all Italian word types in the Misti dictionary system. The design balances linguistic accuracy with implementation practicality, ensuring that each word type receives appropriate treatment based on its complexity and importance.

The three-level metadata system (word/translation/form) provides flexibility for capturing the rich grammatical and semantic properties of Italian while maintaining clean separation of concerns. The forms storage strategy ensures that complex patterns are captured where necessary while keeping simple patterns calculable for educational value.

The phased implementation approach prioritizes high-impact word types that provide the greatest benefit to learners, starting with essential grammatical words and progressing through specialized categories.

---

*This document serves as the definitive reference for word type implementation in the Misti dictionary system. Updates should be made as architectural decisions evolve and new word types are implemented.*