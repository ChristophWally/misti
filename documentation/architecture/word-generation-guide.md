# Comprehensive Guide: Adding New Words to the Italian Learning Database

**Version:** 2.0
**Last Updated:** 2025-10-01
**Database:** Supabase PostgreSQL

---

## Table of Contents
1. [Overview](#overview)
2. [Word Type Taxonomy](#word-type-taxonomy)
3. [Database Architecture](#database-architecture)
4. [Metadata System & Propagation](#metadata-system--propagation)
5. [Step-by-Step Word Generation](#step-by-step-word-generation)
6. [Decision Trees by Word Type](#decision-trees-by-word-type)
7. [Validation Rules](#validation-rules)
8. [Examples](#examples)

---

## Overview

This guide provides a comprehensive framework for adding new Italian words to the database. The system uses a flexible metadata architecture where all linguistic properties are stored as tags in the `entity_meta_values` table rather than as direct columns.

**📘 For Complete Metadata Reference**: See [metadata-reference.md](./metadata-reference.md) for all attribute IDs, value IDs, and propagation rules.

### Key Principles

- **Separation of Concerns**: Base words, forms, translations, and form-translations are separate entities
- **Tag-Based Metadata**: All linguistic properties use the entity_meta_values system
- **Translations are Critical**: Translations carry essential metadata (auxiliary, transitivity, verb_type, register) that determines form behavior
- **Masculine Base Forms**: Always store the base masculine singular form in dictionary
- **Complete Conjugations**: Generate all expected forms based on word type and restrictions
- **Inflected Form Translations**: Form translations must be inflected (e.g., "I was", not "to be")
- **Translation Multipliers**: Each form may link to multiple translations based on auxiliary and restrictions

### Critical Columns to Fill

When creating database records, ensure these **required columns** are always populated:

| Table | Column | Required Value | Notes |
|-------|--------|----------------|-------|
| dictionary | italian | text | Base form |
| dictionary | word_type | noun, verb, adjective, adverb, preposition | Lowercase only |
| word_forms | form_text | text | Inflected form |
| word_forms | **form_type** | text | **DEPRECATED but required** - Use metadata instead |
| word_translations | translation | text | Base English translation |
| word_translations | display_priority | integer | 1 = primary |
| form_translations | translation | text | **INFLECTED English** (I speak, not to speak) |

**⚠️ IMPORTANT**: The `form_type` column in `word_forms` is deprecated but still required by database schema. Always set it to a default value like 'simple', 'form', or 'conjugated'. Use the `verb_form_type` **metadata attribute** for actual classification.

---

## Word Type Taxonomy

Understanding word types and their variations is essential for generating correct forms and metadata.

### Nouns

**Basic Types:**
- **Common Nouns**: Standard nouns with gender (libro, casa, ragazzo)
- **Proper Nouns**: Names of people, places (Roma, Giovanni)

**Gender Patterns:**
- **Masculine (-o)**: libro → libri
- **Feminine (-a)**: casa → case
- **Common Gender**: Can be masculine or feminine

**Special Cases:**
- **Plural-only**: Some nouns exist only in plural (le forbici - scissors)
- **Singular-only**: Some nouns don't pluralize (il latte - milk)

### Verbs

Italian verbs have significant complexity. Understanding verb types is crucial for correct form generation.

#### Verb Categories by Conjugation

| Type | Ending | Examples | Form Count |
|------|--------|----------|------------|
| **First Conjugation** | -are | parlare, amare, mangiare | 130 |
| **Second Conjugation** | -ere | credere, vendere, vedere | 130 |
| **Third Conjugation** | -ire | dormire, partire | 130 |
| **Third -isc Conjugation** | -ire | finire, capire, preferire | 130 |

#### Verb Categories by Behavior

**1. Regular Verbs**
- Follow standard conjugation patterns
- 130 forms: 51 simple + 49 compound + 30 progressive
- Examples: parlare (to speak), dormire (to sleep)

**2. Dual-Auxiliary Verbs**
- Use **both** essere and avere depending on meaning
- 179 forms: 51 simple + 98 compound (49 × 2) + 30 progressive
- Examples:
  - finire: "ho finito il lavoro" (avere - completed something) vs "è finito il film" (essere - something ended)
  - correre: "ho corso veloce" (avere - ran fast) vs "sono corso a casa" (essere - ran to a location)

**3. Reflexive Verbs**
- Require reflexive pronouns (mi, ti, si, ci, vi, si)
- Always use essere in compound tenses
- May have multiple translations with restrictions
- Examples:
  - lavarsi: "mi lavo" (I wash myself) vs "ci laviamo" (we wash ourselves/each other)
  - vestirsi: to dress oneself

**4. Modal Verbs**
- Auxiliary verbs expressing necessity, possibility, permission, ability
- Missing some forms (especially imperative)
- Examples: dovere (must), potere (can), volere (want), sapere (know how)
- Restriction: `missing-imperative`

**5. Impersonal Verbs**
- Used without specific subject, often in third person
- Examples: importare (to matter), bisognare (to need), servire (to be needed)
- Restrictions: `third-person-only` or `third-singular-only`

**6. Meteorological Verbs**
- Weather verbs used only in third person singular
- Examples: piovere (to rain), nevicare (to snow), grandinare (to hail)
- Restriction: `third-singular-only`

**7. Defective Verbs**
- Missing certain forms (typically 1st/2nd person or imperative)
- Examples: vigere (to be in force), solere (to be accustomed), vertere (to turn)
- Restrictions: `missing-first-second-person`, `missing-imperative`

#### Verb Form Count Matrix

| Verb Type | Simple | Compound | Progressive | **Total** |
|-----------|--------|----------|-------------|-----------|
| Regular (single auxiliary) | 51 | 49 | 30 | **130** |
| Dual-auxiliary | 51 | 98 (49×2) | 30 | **179** |
| Modal (missing imperative) | 46 | 44 | 30 | **120** |
| Impersonal (3rd person only) | 17 | 16 | 10 | **43** |
| Meteorological (3sg only) | 7 | 7 | 5 | **19** |

### Adjectives

**Form Patterns:**
- **form-4**: Full agreement - bello/bella/belli/belle (4 distinct forms)
- **form-2**: Limited agreement - grande/grande/grandi/grandi (2 distinct forms)

**Gradability:**
- **Full gradability**: Can form both analytical (più bello) and synthetic (bellissimo)
- **Analytical gradability**: Only analytical comparatives (più intelligente)
- **Non-gradable**: Cannot form comparatives (morto, perfetto)

### Adverbs

**Semantic Types:**
- **Manner**: How - velocemente, bene, male
- **Time**: When - oggi, sempre, mai
- **Place**: Where - qui, là, sopra
- **Quantity**: How much - molto, poco, troppo
- **Frequency**: How often - spesso, raramente, mai
- **Affirmation**: Confirmation - sì, certamente, certo
- **Doubt**: Uncertainty - forse, probabilmente, magari
- **Negation**: Negative - non, niente, nessuno
- **Evaluation**: Opinion - fortunatamente, purtroppo
- **Emphasis**: Amplification - assolutamente, proprio

**Formation:**
- Most adverbs are invariable (1 form only)
- Some derived from adjectives with -mente suffix

### Prepositions

- Invariable words (1 form only)
- Express relationships between words
- Examples: di, a, da, in, con, su, per, tra, fra

---

## Database Architecture

### Core Tables

#### 1. `dictionary` - Base Words
Stores the fundamental Italian word entry.

**Columns:**
- `id` (uuid, PK): Unique identifier
- `italian` (text, required): The Italian word in base form
- `word_type` (text, required): Type of word (noun, verb, adjective, adverb, preposition)
- `phonetic_pronunciation` (text, nullable): Simplified pronunciation (e.g., "PAR-la-re")
- `ipa_pronunciation` (text, nullable): IPA notation (e.g., "/parˈlare/")
- `image_url` (text, nullable): Visual reference
- `audio_url` (text, nullable): Audio file URL
- `audio_filename` (text, nullable): Audio file name
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

**Word Types:** `noun`, `verb`, `adjective`, `adverb`, `preposition`

#### 2. `word_translations` - English Translations
Stores English translations for each word with usage context.

**Columns:**
- `id` (uuid, PK): Unique identifier
- `word_id` (uuid, FK → dictionary): Links to base word
- `translation` (text, required): English translation
- `display_priority` (int, default 1): Priority for UI (1 = primary)
- `usage_notes` (text, nullable): When/how to use this translation
- `frequency_estimate` (numeric, default 0.5): Usage frequency (0-1)
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

#### 3. `word_forms` - Conjugated/Inflected Forms
Stores all inflected forms of a word (conjugations, plurals, feminine forms, etc.).

**Columns:**
- `id` (uuid, PK): Unique identifier
- `word_id` (uuid, FK → dictionary): Links to base word
- `form_text` (text, required): The conjugated/inflected form
- `form_type` (text, required): Simple classification (deprecated, use metadata)
- `phonetic_pronunciation` (text, nullable): Form-specific pronunciation
- `ipa_pronunciation` (text, nullable): Form-specific IPA
- `audio_metadata_id` (uuid, nullable): Links to audio
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

#### 4. `form_translations` - Form-Specific Translations
Links specific forms to specific translations, creating the form × translation matrix.

**Columns:**
- `id` (uuid, PK): Unique identifier
- `form_id` (uuid, FK → word_forms): Links to specific form
- `word_translation_id` (uuid, FK → word_translations): Links to translation
- `translation` (text, required): The complete English translation for this form
- `usage_examples` (jsonb, default []): Example sentences
- `assignment_method` (text, default 'automatic'): How assigned
- `confidence_score` (numeric, default 1.0): Confidence level (0-1)
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

#### 5. `entity_meta_values` - Metadata Tags
Stores all metadata tags for words, forms, translations, and form_translations.

**Columns:**
- `entity_type` (text, PK): Type of entity ('word', 'form', 'word_translation', 'form_translation')
- `entity_id` (uuid, PK): ID of the entity
- `value_id` (uuid, PK, FK → meta_values): The metadata value
- `attribute_id` (uuid, FK → meta_attributes): The metadata attribute
- `created_at` (timestamp): Creation timestamp
- `created_by` (uuid, nullable): User who created
- `derived_from` (text, nullable): How this was derived
- `propagation_source_id` (uuid, nullable): Source of propagation
- `propagation_method` (text, nullable): Propagation method

#### 6. `meta_attributes` - Metadata Attribute Definitions
Defines available metadata attributes.

**Key Columns:**
- `id` (uuid, PK)
- `name` (text, unique): Attribute name (e.g., 'mood', 'gender', 'tense')
- `description` (text): What this attribute represents
- `source_level` (text): Where it can be assigned ('word', 'form', 'translation', or comma-separated)
- `display_level` (text): Where it's displayed in UI

#### 7. `meta_values` - Valid Metadata Values
Stores valid values for each attribute.

**Key Columns:**
- `id` (uuid, PK)
- `attribute_id` (uuid, FK → meta_attributes)
- `value` (text): The actual value (e.g., 'masculine', 'indicativo', 'singular')
- `description` (text): Explanation of this value
- `sort_order` (int): Display order

---

## Metadata System & Propagation

### Understanding Metadata Levels

The metadata system operates across four entity types, each serving a specific purpose in the word generation hierarchy:

| Entity Type | Level | Purpose | Example |
|------------|-------|---------|---------|
| `word` | Dictionary entry | Base word properties | gender: masculine |
| `form` | Inflected form | Form-specific properties | tense: presente, person: prima-persona |
| `word_translation` | Base translation | Translation-specific properties | auxiliary: avere, transitivity: transitive |
| `form_translation` | Form translation | Form-translation properties | (rarely used) |

### Source Level vs Display Level

Every metadata attribute has two level specifications:

**source_level**: Where you **assign** the tag (word, form, translation, or comma-separated)
**display_level**: Where it **appears in UI** (may aggregate from multiple sources)

Example: `auxiliary` attribute
- **source_level**: `form,translation` (can be assigned to both forms and translations)
- **display_level**: `word` (displayed at word level, aggregating all auxiliary values from translations and forms)

### Propagation Rules Explained

Propagation rules determine how metadata flows from where it's assigned to where it's displayed.

#### 1. ADMIN_ONLY (No Propagation)

**Behavior**: Direct assignment only, no automatic propagation

**Use Case**: Core structural attributes that must be explicitly set

**Examples**:
- `gender` (word): Must explicitly tag each noun as masculine/feminine
- `mood` (form): Must explicitly tag each verb form with its mood
- `tense` (form): Must explicitly tag each verb form with its tense
- `person` (form): Must explicitly tag each verb form with its person
- `number` (form): Must explicitly tag each verb form with its number

```
Word: ragazzo
└─ gender: masculine (explicitly assigned)
   └─ Display: Shows "masculine" (no propagation, direct value)
```

#### 2. FIRST_WINS (Single Value Priority)

**Behavior**: First value encountered wins, subsequent values ignored

**Use Case**: Attributes that should have only one value displayed

**Examples**:
- `register` (translation): formal, casual, neutral
- `adverb_type` (word): manner, time, place

```
Word: parlare
├─ Translation 1: register: formal (first)
└─ Translation 2: register: casual (second)
   └─ Display: Shows "formal" (first wins)
```

#### 3. COMBINE (Merge All Values)

**Behavior**: All unique values are combined and displayed together

**Use Case**: Attributes that can legitimately have multiple values

**Examples**:
- `auxiliary` (form,translation): essere, avere
- `transitivity` (translation): transitive, intransitive, ambitransitive

```
Word: finire
├─ Translation 1: auxiliary: avere
└─ Translation 2: auxiliary: essere
   └─ Display: Shows "avere, essere" (both combined)
```

#### 4. ANY_MATCH (Boolean-like)

**Behavior**: Display if ANY related entity has the attribute

**Use Case**: Boolean-like attributes indicating presence of a property

**Examples**:
- `form_irregular` (form): irregular
- `interrogative_function` (word): interrogative

```
Word: andare
├─ Form 1: "vado" → form_irregular: irregular
├─ Form 2: "vai" → form_irregular: irregular
└─ Form 3: "va" → form_irregular: irregular
   └─ Display: Shows "irregular" (at least one form is irregular)
```

### Why Translations Are Critical

**🔥 CRITICAL CONCEPT**: Translations are not just text—they carry essential metadata that determines form behavior and relationships.

#### Translation-Level Metadata Determines:

**1. Compound Form Generation (auxiliary)**
- Forms tagged with `auxiliary='essere'` link ONLY to translations with `auxiliary='essere'`
- Forms tagged with `auxiliary='avere'` link ONLY to translations with `auxiliary='avere'`

```
Example: finire (dual-auxiliary verb)

Translation 1: "to finish" → auxiliary: avere
Translation 2: "to end" → auxiliary: essere

Form: "ho finito" (compound with avere)
└─ Links ONLY to Translation 1 ("to finish")
└─ Does NOT link to Translation 2 (wrong auxiliary)

Form: "è finito" (compound with essere)
└─ Links ONLY to Translation 2 ("to end")
└─ Does NOT link to Translation 1 (wrong auxiliary)
```

**2. Form Translation Matrix (word_restriction)**
- Translations with `word_restriction='plural-only'` link ONLY to plural forms
- Translations with no restrictions link to ALL applicable forms

```
Example: lavarsi (reflexive verb with restriction)

Translation 1: "to wash oneself" (no restriction)
Translation 2: "to wash each other" → word_restriction: plural-only

Form: "mi lavo" (singular)
└─ Links ONLY to Translation 1
└─ Does NOT link to Translation 2 (plural-only restriction)

Form: "ci laviamo" (plural)
└─ Links to Translation 1 (no restriction)
└─ Links to Translation 2 (plural restriction matches)
```

**3. Semantic and Grammatical Classification**
- `transitivity`: Determines if verb can take direct objects
- `verb_type`: Special verb categories (modal, impersonal, reciprocal, etc.)
- `register`: Social context (formal, casual, neutral)
- `gender_usage`: Gender-specific meanings

#### Without Proper Translation Metadata:

❌ Compound forms won't link to correct translations
❌ Dual-auxiliary verbs will fail
❌ Restriction-based translations won't work
❌ Form × translation matrix will be incorrect
❌ Expected form_translation counts will be wrong

### Metadata Assignment Workflow

**Step 1: Assign at Source Level**
```sql
-- Word level: Assign gender to dictionary entry
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
VALUES ('word', 'word-uuid', 'gender-attr-id', 'masculine-value-id');

-- Translation level: Assign auxiliary to word_translation
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
VALUES ('word_translation', 'translation-uuid', 'auxiliary-attr-id', 'avere-value-id');

-- Form level: Assign tense to word_form
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
VALUES ('form', 'form-uuid', 'tense-attr-id', 'presente-value-id');
```

**Step 2: System Applies Propagation Rules**

The system automatically propagates metadata according to rules:
- ADMIN_ONLY: No propagation (shows direct value)
- FIRST_WINS: First value propagates up
- COMBINE: All values merge and propagate up
- ANY_MATCH: Presence indicator propagates up

**Step 3: Display at Display Level**

UI displays metadata at display_level, showing propagated values:
- Word-level display: Shows word tags + propagated translation/form tags
- Form-level display: Shows form tags only
- Translation-level display: Shows translation tags only

---

## Step-by-Step Word Generation

### STEP 1: Determine Word Type and Base Form

#### 1.1 Identify Word Type
Determine which category the word belongs to:
- **Noun**: Person, place, thing, concept (e.g., "casa", "ragazzo")
- **Verb**: Action or state (e.g., "parlare", "essere")
- **Adjective**: Describes nouns (e.g., "bello", "grande")
- **Adverb**: Modifies verbs, adjectives, or other adverbs (e.g., "velocemente", "molto")
- **Preposition**: Shows relationships (e.g., "di", "a", "con")

#### 1.2 Determine Base Form
**Rule: Always store the base masculine singular form**

| Word Type | Base Form Rule | Examples |
|-----------|---------------|----------|
| Noun | Masculine singular | "ragazzo" (not "ragazza"), "libro" (not "libri") |
| Verb | Infinitive | "parlare", "essere", "finire" |
| Adjective | Masculine singular | "bello" (not "bella"), "grande" |
| Adverb | Base form | "velocemente", "bene" |
| Preposition | Base form | "di", "a", "con" |

#### 1.3 Insert into `dictionary` Table

```sql
INSERT INTO dictionary (id, italian, word_type, phonetic_pronunciation, ipa_pronunciation)
VALUES (
  gen_random_uuid(),
  'parlare',           -- Base form
  'verb',              -- Word type
  'par-LA-re',         -- Phonetic
  '/parˈlare/'         -- IPA
)
RETURNING id;
```

#### 1.4 Apply Word-Level Metadata Tags

Query meta_attributes where `source_level` includes 'word':

**Common Word-Level Attributes by Type:**

| Attribute | Word Types | Values | Required? |
|-----------|-----------|--------|-----------|
| `gender` | noun | masculine, feminine, common-gender | Required for nouns |
| `plural_formation` | noun | plural-i, plural-e | Optional |
| `conjugation_type` | verb | are, ere, ire, ire-isc | Recommended |
| `reflexive` | verb | reflexive | If applicable |
| `form_pattern` | adjective | form-4, form-2 | Required for adjectives |
| `gradable` | adjective | analytical-gradability, full-gradability | If applicable |
| `adverb_type` | adverb | manner, time, place, quantity, etc. | Recommended |
| `cefr_level` | all | A1, A2, B1, B2, C1, C2 | Optional |
| `frequency_tier` | all | top100, top500, top1000, etc. | Optional |
| `word_restriction` | verb | plural-only, third-person-only, etc. | If applicable |

**Example: Tagging a noun**
```sql
-- Tag as masculine
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT
  'word',
  '...',  -- word_id from dictionary
  ma.id,  -- attribute_id for 'gender'
  mv.id   -- value_id for 'masculine'
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'gender' AND mv.value = 'masculine';

-- Tag plural formation
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT
  'word',
  '...',
  ma.id,
  mv.id
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'plural_formation' AND mv.value = 'plural-i';
```

---

### STEP 2: Add Translations with Context

#### 2.1 Determine All Translations
For each distinct meaning or usage, create a separate translation.

**Guidelines:**
- **Primary meaning**: display_priority = 1
- **Secondary meanings**: display_priority = 2, 3, etc.
- **Different contexts**: Separate translations for different usage contexts

#### 2.2 Insert Translations

```sql
INSERT INTO word_translations (id, word_id, translation, display_priority, usage_notes, frequency_estimate)
VALUES
  (gen_random_uuid(), '...', 'to speak', 1, 'General conversation, communication', 0.9),
  (gen_random_uuid(), '...', 'to talk', 2, 'Informal conversation, discussion', 0.7);
```

#### 2.3 Apply Translation-Level Metadata Tags

Query meta_attributes where `source_level` includes 'translation':

**Common Translation-Level Attributes:**

| Attribute | Values | When to Use |
|-----------|--------|-------------|
| `auxiliary` | essere, avere | **Required for verb translations** - determines compound tense formation |
| `word_restriction` | plural-only, third-person-only, etc. | When translation applies only to specific forms |
| `transitivity` | transitive, intransitive, ambitransitive | For verb translations |
| `verb_type` | direct-reflexive, reciprocal, modal-verb, etc. | For special verb categories |
| `register` | formal, casual, neutral, mixed | Social context |
| `gender_usage` | male-only, female-only | When translation is gender-specific |
| `position` | before, after, before/after | For adjectives/adverbs |

**Critical Rule for Verbs: ALWAYS tag auxiliary**

```sql
-- Example: Tag verb translation with auxiliary
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT
  'word_translation',
  '...',  -- word_translation_id
  ma.id,
  mv.id
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'auxiliary' AND mv.value = 'avere';

-- Example: Tag restriction (for "lavarsi" - "to wash each other" is plural-only)
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT
  'word_translation',
  '...',
  ma.id,
  mv.id
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'word_restriction' AND mv.value = 'plural-only';
```

#### 2.4 Write Usage Notes

**Usage notes should explain:**
- **When to use** this translation over others
- **Context** where this meaning applies
- **Nuances** that distinguish it from similar translations
- **NO example sentences** (those go in form_translations)

**Good Usage Notes:**
- ✅ "Used when discussing mutual actions between people"
- ✅ "Formal contexts, professional communication"
- ✅ "Emphasizes the physical act of movement"

**Bad Usage Notes:**
- ❌ "Example: Io parlo italiano" (this is an example sentence)
- ❌ "means to speak" (too vague)
- ❌ "It's for talking" (doesn't explain when/how)

---

### STEP 3: Generate Word Forms

#### 3.1 Calculate Expected Form Count

**Form Count Formula by Word Type:**

| Word Type | Form Count Calculation | Notes |
|-----------|----------------------|-------|
| **Noun** | 2-4 forms | Singular + Plural × Gender variations |
| **Verb** | 130-179 forms | 51 simple + 49 compound + 30 progressive (×2 for dual auxiliary) |
| **Adjective** | 2-4 forms | Masculine/Feminine × Singular/Plural |
| **Adverb** | 1 form | Invariable (unless derived with -mente) |
| **Preposition** | 1 form | Invariable |

**Verb Forms Breakdown:**
- **Simple forms (51):**
  - Indicativo: presente (6), imperfetto (6), passato-remoto (6), futuro-semplice (6)
  - Congiuntivo: presente (6), imperfetto (6)
  - Condizionale: presente (6)
  - Imperativo: presente (5) [no 1st person singular]
  - Infinito: presente (1)
  - Participio: presente (1), passato (1)
  - Gerundio: presente (1)

- **Compound forms (49 per auxiliary):**
  - Indicativo: passato-prossimo (6), trapassato-prossimo (6), futuro-anteriore (6), trapassato-remoto (6)
  - Congiuntivo: passato (6), trapassato (6)
  - Condizionale: passato (6)
  - Imperativo: passato (5)
  - Infinito: passato (1)
  - Gerundio: passato (1)

- **Progressive forms (30):**
  - Indicativo: presente-progressivo (6), imperfetto-progressivo (6), futuro-progressivo (6)
  - Congiuntivo: presente-progressivo (6)
  - Condizionale: presente-progressivo (6)

**Dual Auxiliary Note (finire):**
- Verbs with 2 translations using different auxiliaries need **98 compound forms** (49 × 2)
- Total: 51 simple + 98 compound + 30 progressive = **179 forms**

#### 3.2 Apply Restrictions

**Restriction Types:** (from `word_restriction` attribute)

| Restriction | Effect on Form Count | Example |
|-------------|---------------------|---------|
| `plural-only` | Only plural forms generated | "le forbici" (scissors) |
| `singular-only` | Only singular forms generated | "il latte" (milk) |
| `third-person-only` | Only 3rd person forms | "piovere" (to rain) |
| `third-singular-only` | Only 3rd person singular | "bisogna" (it's necessary) |
| `missing-first-second-person` | Exclude 1st/2nd person | Some impersonal verbs |
| `missing-imperative` | No imperative forms | Modal verbs |

**Example Restriction Application:**
- **lavarsi** has 2 translations:
  - "to wash oneself" (no restriction) → applies to all forms
  - "to wash each other" (plural-only) → applies only to plural forms

#### 3.3 Generate Form Text

**Form Generation Rules:**

**Nouns:**
```
Base: ragazzo (masculine singular)
Forms: ragazzo, ragazza, ragazzi, ragazze
```

**Verbs:**
```
Simple: Conjugate according to conjugation_type (are/ere/ire/ire-isc)
Compound: [auxiliary conjugated] + [past participle]
Progressive: [stare conjugated] + [gerund]
```

**Adjectives:**
```
form-4: bello, bella, belli, belle
form-2: grande, grande, grandi, grandi
```

**Special Rules for Verbs:**
- **Congiuntivo forms**: ALWAYS prefix with "che " (e.g., "che io parli")
- **Imperativo forms**: ALWAYS suffix with "!" (e.g., "parla!")
- **Compound forms**: Use proper auxiliary conjugation + participle
  - essere: "sono andato", "era andato", "sarà andato"
  - avere: "ho parlato", "aveva parlato", "avrà parlato"

#### 3.4 Insert word_forms

**⚠️ IMPORTANT: form_type Column Requirement**

The `form_type` column in `word_forms` is **deprecated but still required** by the database schema. You MUST provide a value for this column even though we use metadata for actual classification.

**Recommended default values:**
- For verbs: `'simple'`, `'compound'`, or `'progressive'` (matches the verb_form_type metadata)
- For nouns/adjectives: `'form'` or `'inflected'`
- For adverbs/prepositions: `'base'` or `'form'`

**The actual classification comes from metadata attributes**, not this column. Always use the `verb_form_type` metadata attribute for proper classification.

```sql
INSERT INTO word_forms (id, word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation)
VALUES (
  gen_random_uuid(),
  '...',            -- word_id from dictionary
  'parlo',          -- Conjugated form
  'simple',         -- ⚠️ REQUIRED but deprecated - Use verb_form_type metadata for actual classification
  'PAR-lo',         -- Phonetic (optional)
  '/ˈparlo/'        -- IPA (optional)
);
```

**Remember:** After inserting the form, immediately tag it with the correct `verb_form_type` metadata attribute (simple, compound, or progressive).

#### 3.5 Apply Form-Level Metadata Tags

Query meta_attributes where `source_level` includes 'form':

**Required Form-Level Attributes for Verbs:**

| Attribute | Values | Notes |
|-----------|--------|-------|
| `verb_form_type` | simple, compound, progressive | **Required** - determines form construction |
| `mood` | indicativo, congiuntivo, condizionale, imperativo, infinito, participio, gerundio | **Required** |
| `tense` | presente, imperfetto, passato-prossimo, etc. (27 values) | **Required** |
| `person` | prima-persona, seconda-persona, terza-persona | **Required** (except infinitive/participio/gerundio) |
| `number` | singolare, plurale | **Required** (except infinitive/participio/gerundio) |
| `auxiliary` | essere, avere | **Required for compound forms only** |
| `form_irregular` | irregular | If form deviates from pattern |

**Required Form-Level Attributes for Nouns/Adjectives:**

| Attribute | Values | Notes |
|-----------|--------|-------|
| `number` | singolare, plurale | **Required** |
| `gender` | masculine, feminine | **Required** (for gender-variant forms) |

**Example: Tag a verb form**
```sql
-- parlo = present indicative, 1st person singular, simple

-- verb_form_type
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT 'form', '...', ma.id, mv.id
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'verb_form_type' AND mv.value = 'simple';

-- mood
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT 'form', '...', ma.id, mv.id
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'mood' AND mv.value = 'indicativo';

-- tense
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT 'form', '...', ma.id, mv.id
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'tense' AND mv.value = 'presente';

-- person
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT 'form', '...', ma.id, mv.id
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'person' AND mv.value = 'prima-persona';

-- number
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
SELECT 'form', '...', ma.id, mv.id
FROM meta_attributes ma
JOIN meta_values mv ON mv.attribute_id = ma.id
WHERE ma.name = 'number' AND mv.value = 'singolare';
```

---

### STEP 4: Create Form Translations

#### 4.1 Calculate Form × Translation Matrix

**For each form, determine which translations apply:**

**Simple Rule:**
- No restrictions → Form links to ALL translations
- With restrictions → Form links only to matching translations

**Restriction Matching Logic:**

| Form Person/Number | Restriction | Applies? |
|-------------------|-------------|----------|
| 1sg, 2sg, 3sg | plural-only | ❌ No |
| 1pl, 2pl, 3pl | plural-only | ✅ Yes |
| 1pl, 2pl, 3pl | singular-only | ❌ No |
| 1sg, 2sg, 3sg | singular-only | ✅ Yes |
| 1sg, 2sg | third-person-only | ❌ No |
| 3sg, 3pl | third-person-only | ✅ Yes |
| 3sg | third-singular-only | ✅ Yes |
| others | third-singular-only | ❌ No |

**Auxiliary Matching (for compound forms):**
- Compound forms have an `auxiliary` tag (essere or avere)
- Match this to translation's `auxiliary` tag
- Form with auxiliary='essere' → Only links to translation with auxiliary='essere'

#### 4.2 Generate Translation Text

**🔥 CRITICAL RULE: Form translations MUST be inflected to match the Italian form**

The `translation` column in `form_translations` must contain the **fully conjugated/inflected English translation**, NOT the base translation from `word_translations`.

**❌ WRONG:**
```
Form: "parlavo" → Translation: "to speak" (base infinitive)
Form: "ho parlato" → Translation: "to speak" (base infinitive)
```

**✅ CORRECT:**
```
Form: "parlavo" → Translation: "I was speaking" (inflected past continuous)
Form: "ho parlato" → Translation: "I have spoken" (inflected present perfect)
```

**Format:** Combine Italian form conjugation with properly inflected English

**Complete Examples:**

| Italian Form | Base Translation | **Form Translation (INFLECTED)** |
|-------------|------------------|----------------------------------|
| parlo | to speak | **I speak** |
| parli | to speak | **you speak** |
| parlavi | to speak | **you were speaking** |
| parlavo | to speak | **I was speaking** |
| ho parlato | to speak | **I have spoken** |
| avevo parlato | to speak | **I had spoken** |
| parlerò | to speak | **I will speak** |
| che io parli | to speak | **that I speak** |
| che io parlassi | to speak | **that I spoke** |
| parlerei | to speak | **I would speak** |
| parla! | to speak | **speak!** |
| parlate! | to speak | **you all speak!** |
| sto parlando | to speak | **I am speaking** |

**English Inflection Rules:**

**Present Tense:**
- io parlo → I speak
- tu parli → you speak
- lui/lei parla → he/she speaks (add -s)
- noi parliamo → we speak
- voi parlate → you all speak
- loro parlano → they speak

**Past Tenses:**
- Imperfetto (parlavo) → was/were + -ing: "I was speaking"
- Passato prossimo (ho parlato) → have/has + past participle: "I have spoken"
- Passato remoto (parlai) → simple past: "I spoke"
- Trapassato (avevo parlato) → had + past participle: "I had spoken"

**Future:**
- Futuro semplice (parlerò) → will + infinitive: "I will speak"
- Futuro anteriore (avrò parlato) → will have + past participle: "I will have spoken"

**Conditional:**
- Condizionale presente (parlerei) → would + infinitive: "I would speak"
- Condizionale passato (avrei parlato) → would have + past participle: "I would have spoken"

**Subjunctive:**
- Congiuntivo presente (che io parli) → that + present: "that I speak"
- Congiuntivo imperfetto (che io parlassi) → that + past: "that I spoke"
- Congiuntivo passato (che io abbia parlato) → that + present perfect: "that I have spoken"

**Imperative:**
- Imperativo (parla!) → imperative form: "speak!" (no pronoun)
- Imperativo (parlate!) → imperative form: "you all speak!" (with pronoun for clarity)

**Progressive:**
- Presente progressivo (sto parlando) → am/is/are + -ing: "I am speaking"
- Imperfetto progressivo (stavo parlando) → was/were + -ing: "I was speaking"

#### 4.3 Insert form_translations

```sql
INSERT INTO form_translations (id, form_id, word_translation_id, translation, assignment_method, confidence_score)
VALUES (
  gen_random_uuid(),
  '...',           -- form_id from word_forms
  '...',           -- word_translation_id from word_translations
  'I speak',       -- ⚠️ INFLECTED English translation (NOT "to speak")
  'automatic',     -- How this was assigned
  1.0              -- Confidence level
);
```

#### 4.4 Multiplication Examples

**Example 1: Simple Verb (1 translation, no restrictions)**
- **Word**: parlare
- **Translations**: "to speak" (1)
- **Forms**: 130
- **Form Translations**: 130 × 1 = **130**

**Example 2: Dual Translation Verb (2 translations, no restrictions)**
- **Word**: parlare
- **Translations**: "to speak", "to talk" (2)
- **Forms**: 130
- **Form Translations**: 130 × 2 = **260**

**Example 3: Dual Auxiliary Verb (2 translations, 2 auxiliaries)**
- **Word**: finire
- **Translations**:
  - "to finish" (auxiliary='avere')
  - "to end" (auxiliary='essere')
- **Forms**: 179 (51 simple + 98 compound + 30 progressive)
- **Form Translations**:
  - Simple forms (51): 51 × 2 = 102
  - Compound avere (49): 49 × 1 (to finish) = 49
  - Compound essere (49): 49 × 1 (to end) = 49
  - Progressive (30): 30 × 2 = 60
  - **Total: 260**

**Example 4: Restriction-Based Verb**
- **Word**: lavarsi
- **Translations**:
  - "to wash oneself" (no restriction)
  - "to wash each other" (plural-only)
- **Forms**: 130 (65 singular + 65 plural)
- **Form Translations**:
  - Singular forms (65): 65 × 1 (wash oneself) = 65
  - Plural forms (65): 65 × 2 (both translations) = 130
  - **Total: 195**

---

## Decision Trees by Word Type

### Noun Decision Tree

```
START: Adding Noun
│
├─ What is the base form?
│  └─ Use masculine singular (ragazzo, not ragazza)
│
├─ Insert into dictionary
│  ├─ italian: 'ragazzo'
│  ├─ word_type: 'noun'
│  └─ pronunciations (optional)
│
├─ Tag word-level metadata
│  ├─ gender: 'masculine' or 'feminine' [REQUIRED]
│  ├─ plural_formation: 'plural-i' or 'plural-e' [OPTIONAL]
│  ├─ cefr_level: A1-C2 [OPTIONAL]
│  └─ frequency_tier: top100-top10000 [OPTIONAL]
│
├─ Add translations
│  ├─ Primary translation (display_priority=1)
│  ├─ Secondary translations (display_priority=2+)
│  └─ Tag translation metadata:
│      ├─ register: formal/casual/neutral [OPTIONAL]
│      └─ gender_usage: male-only/female-only [IF APPLICABLE]
│
├─ Generate forms (2-4 forms total)
│  ├─ Masculine singular: ragazzo
│  ├─ Masculine plural: ragazzi
│  ├─ Feminine singular: ragazza (if applicable)
│  └─ Feminine plural: ragazze (if applicable)
│
├─ Tag each form
│  ├─ number: singolare/plurale [REQUIRED]
│  └─ gender: masculine/feminine [REQUIRED]
│
└─ Create form_translations
   ├─ Each form × Each translation
   ├─ Apply gender_usage restrictions
   └─ Generate proper English: "boy", "boys", "girl", "girls"
```

### Verb Decision Tree

```
START: Adding Verb
│
├─ What is the base form?
│  └─ Use infinitive (parlare, essere, finire)
│
├─ Is it reflexive?
│  ├─ YES: Include reflexive pronoun (lavarsi)
│  └─ NO: Standard infinitive
│
├─ Insert into dictionary
│  ├─ italian: 'parlare'
│  ├─ word_type: 'verb'
│  └─ pronunciations (optional)
│
├─ Tag word-level metadata
│  ├─ conjugation_type: are/ere/ire/ire-isc [RECOMMENDED]
│  ├─ reflexive: 'reflexive' [IF APPLICABLE]
│  ├─ word_restriction: [IF APPLICABLE]
│  │   ├─ plural-only
│  │   ├─ third-person-only
│  │   ├─ missing-imperative
│  │   └─ etc.
│  ├─ cefr_level: A1-C2 [OPTIONAL]
│  └─ frequency_tier: top100-top10000 [OPTIONAL]
│
├─ Add translations (1-2 typical)
│  ├─ For each translation:
│  │   ├─ translation: English infinitive with "to"
│  │   ├─ display_priority: 1, 2, 3...
│  │   ├─ usage_notes: When/how to use
│  │   └─ Tag translation metadata:
│  │       ├─ auxiliary: essere/avere [REQUIRED]
│  │       ├─ transitivity: transitive/intransitive/ambitransitive [RECOMMENDED]
│  │       ├─ verb_type: direct-reflexive/reciprocal/modal-verb/etc. [IF APPLICABLE]
│  │       ├─ word_restriction: plural-only/etc. [IF APPLICABLE]
│  │       └─ register: formal/casual/neutral [OPTIONAL]
│  │
│  └─ Dual auxiliary check:
│      ├─ Do translations have DIFFERENT auxiliaries?
│      │   ├─ YES: Generate 179 forms (98 compound)
│      │   └─ NO: Generate 130 forms (49 compound)
│
├─ Calculate form count
│  ├─ Check restrictions from word_restriction
│  ├─ Standard: 51 simple + 49 compound + 30 progressive = 130
│  ├─ Dual auxiliary: 51 simple + 98 compound + 30 progressive = 179
│  └─ Apply restrictions to reduce counts
│
├─ Generate forms
│  │
│  ├─ SIMPLE FORMS (51 total)
│  │   ├─ For each mood/tense/person combination
│  │   ├─ Conjugate according to conjugation_type
│  │   ├─ Special rules:
│  │   │   ├─ Congiuntivo: Prefix "che "
│  │   │   ├─ Imperativo: Suffix "!"
│  │   │   └─ Infinitive/Participio/Gerundio: No person/number
│  │   └─ Tag metadata: verb_form_type, mood, tense, person, number, form_irregular
│  │
│  ├─ COMPOUND FORMS (49 or 98 total)
│  │   ├─ Format: [auxiliary conjugated] + [past participle]
│  │   ├─ Examples:
│  │   │   ├─ essere: "sono andato", "era andato"
│  │   │   └─ avere: "ho parlato", "aveva parlato"
│  │   ├─ For dual auxiliary:
│  │   │   ├─ Generate 49 forms with essere
│  │   │   └─ Generate 49 forms with avere
│  │   ├─ Special rules:
│  │   │   ├─ Congiuntivo: Prefix "che "
│  │   │   └─ Imperativo: Suffix "!"
│  │   └─ Tag metadata: verb_form_type='compound', mood, tense, person, number, auxiliary
│  │
│  └─ PROGRESSIVE FORMS (30 total)
│      ├─ Format: [stare conjugated] + [gerund]
│      ├─ Examples: "sto parlando", "stava andando"
│      ├─ Note: Do NOT tag auxiliary (stare is implicit)
│      └─ Tag metadata: verb_form_type='progressive', mood, tense, person, number
│
└─ Create form_translations
   │
   ├─ For SIMPLE/PROGRESSIVE forms:
   │   └─ Link to ALL translations (unless restricted)
   │
   ├─ For COMPOUND forms:
   │   └─ Match auxiliary tag:
   │       ├─ Form auxiliary='essere' → Link only to translations with auxiliary='essere'
   │       └─ Form auxiliary='avere' → Link only to translations with auxiliary='avere'
   │
   ├─ Apply restriction filtering:
   │   ├─ plural-only: Only link plural forms
   │   ├─ singular-only: Only link singular forms
   │   ├─ third-person-only: Only link 3rd person forms
   │   └─ etc.
   │
   └─ Generate English translation text:
       ├─ Add pronouns: I, you, he/she, we, you all, they
       ├─ Match tense: present, past, future, conditional, subjunctive
       ├─ Imperativo: No pronoun, use imperative ("speak!")
       └─ Congiuntivo: Prefix "that" ("that I speak")
```

### Adjective Decision Tree

```
START: Adding Adjective
│
├─ What is the base form?
│  └─ Use masculine singular (bello, not bella)
│
├─ Determine form pattern
│  ├─ form-4: Full agreement (m.sg, f.sg, m.pl, f.pl)
│  │   └─ Example: bello, bella, belli, belle
│  └─ form-2: Partial agreement (sg, sg, pl, pl)
│      └─ Example: grande, grande, grandi, grandi
│
├─ Insert into dictionary
│  ├─ italian: 'bello'
│  ├─ word_type: 'adjective'
│  └─ pronunciations (optional)
│
├─ Tag word-level metadata
│  ├─ form_pattern: 'form-4' or 'form-2' [REQUIRED]
│  ├─ gradable: analytical-gradability/full-gradability [IF APPLICABLE]
│  ├─ cefr_level: A1-C2 [OPTIONAL]
│  └─ frequency_tier: top100-top10000 [OPTIONAL]
│
├─ Add translations
│  ├─ Primary translation (display_priority=1)
│  ├─ Secondary translations (display_priority=2+)
│  └─ Tag translation metadata:
│      ├─ position: before/after/before/after [RECOMMENDED]
│      └─ register: formal/casual/neutral [OPTIONAL]
│
├─ Generate forms
│  ├─ form-4 pattern: 4 forms
│  │   ├─ Masculine singular: bello
│  │   ├─ Feminine singular: bella
│  │   ├─ Masculine plural: belli
│  │   └─ Feminine plural: belle
│  │
│  └─ form-2 pattern: 2 unique forms (store 4 records)
│      ├─ Masculine singular: grande
│      ├─ Feminine singular: grande
│      ├─ Masculine plural: grandi
│      └─ Feminine plural: grandi
│
├─ Tag each form
│  ├─ number: singolare/plurale [REQUIRED]
│  └─ gender: masculine/feminine [REQUIRED]
│
└─ Create form_translations
   ├─ Each form × Each translation
   └─ Generate English: "beautiful", "beautiful", "beautiful", "beautiful"
       (English adjectives don't inflect)
```

### Adverb Decision Tree

```
START: Adding Adverb
│
├─ Insert into dictionary
│  ├─ italian: 'velocemente'
│  ├─ word_type: 'adverb'
│  └─ pronunciations (optional)
│
├─ Tag word-level metadata
│  ├─ adverb_type: manner/time/place/quantity/etc. [RECOMMENDED]
│  ├─ cefr_level: A1-C2 [OPTIONAL]
│  └─ frequency_tier: top100-top10000 [OPTIONAL]
│
├─ Add translations
│  ├─ Primary translation (display_priority=1)
│  ├─ Secondary translations (display_priority=2+)
│  └─ Tag translation metadata:
│      └─ register: formal/casual/neutral [OPTIONAL]
│
├─ Generate form (1 form only)
│  └─ Same as dictionary entry (adverbs are invariable)
│
└─ Create form_translations
   ├─ 1 form × N translations
   └─ Generate English: "quickly", "fast"
```

### Preposition Decision Tree

```
START: Adding Preposition
│
├─ Insert into dictionary
│  ├─ italian: 'di'
│  ├─ word_type: 'preposition'
│  └─ pronunciations (optional)
│
├─ Tag word-level metadata
│  ├─ cefr_level: A1-C2 [OPTIONAL]
│  └─ frequency_tier: top100-top10000 [OPTIONAL]
│
├─ Add translations
│  ├─ Primary translation (display_priority=1)
│  ├─ Secondary translations (display_priority=2+)
│  └─ usage_notes: Critical for prepositions (they're context-dependent)
│
├─ Generate form (1 form only)
│  └─ Same as dictionary entry (prepositions are invariable)
│
└─ Create form_translations
   ├─ 1 form × N translations
   └─ Generate English: "of", "from", "about"
```

---

## Metadata Tag Reference

### Complete Attribute List

Based on current database schema, here are all 25 metadata attributes:

#### Word-Level Attributes (`source_level` includes 'word')

| Attribute | Values | Required For | Description |
|-----------|--------|--------------|-------------|
| `gender` | masculine, feminine, common-gender | Nouns | Inherent grammatical gender |
| `plural_formation` | plural-i, plural-e | Nouns | Italian pluralization pattern |
| `conjugation_type` | are, ere, ire, ire-isc | Verbs | Basic conjugation family |
| `reflexive` | reflexive | Verbs | Requires reflexive pronouns |
| `form_pattern` | form-4, form-2 | Adjectives | Agreement pattern |
| `gradable` | analytical-gradability, full-gradability | Adjectives | Can form comparatives |
| `adverb_type` | manner, time, place, quantity, frequency, affirmation, doubt, negation, evaluation, emphasis | Adverbs | Semantic category |
| `cefr_level` | A1, A2, B1, B2, C1, C2, native, academic, literary, specialized, business, regional | All | Learning difficulty |
| `frequency_tier` | top100, top500, top1000, top2500, top5000, top10000 | All | Usage frequency |
| `interrogative_function` | interrogative | All | Whether it's a question word |
| `word_restriction` | singular-only, plural-only, third-person-only, third-singular-only, missing-first-second-person, missing-imperative | Nouns, Verbs | Usage restrictions |

#### Form-Level Attributes (`source_level` includes 'form')

| Attribute | Values | Required For | Description |
|-----------|--------|--------------|-------------|
| `verb_form_type` | simple, compound, progressive | Verb forms | Construction method |
| `mood` | indicativo, congiuntivo, condizionale, imperativo, infinito, participio, gerundio | Verb forms | Grammatical mood |
| `tense` | 27 values (presente, imperfetto, passato-prossimo, etc.) | Verb forms | Temporal/aspectual |
| `person` | prima-persona, seconda-persona, terza-persona | Verb forms (except infinitive/participle/gerund) | Subject person |
| `number` | singolare, plurale | Verb forms (except infinitive/participle/gerund), Noun/Adjective forms | Singular/plural |
| `auxiliary` | essere, avere | Compound verb forms ONLY | Which auxiliary used |
| `form_irregular` | irregular | Verb forms | Deviates from pattern |

#### Translation-Level Attributes (`source_level` includes 'translation')

| Attribute | Values | Required For | Description |
|-----------|--------|--------------|-------------|
| `auxiliary` | essere, avere | Verb translations | **REQUIRED** for verbs |
| `transitivity` | transitive, intransitive, ambitransitive | Verb translations | Can take direct objects |
| `verb_type` | direct-reflexive, reciprocal, modal-verb, impersonal-verb, meteorological-verb, defective-verb | Verb translations | Special categories |
| `register` | formal, casual, neutral, mixed | All translations | Social context |
| `gender_usage` | male-only, female-only | Noun translations | Gender-specific meanings |
| `position` | before, after, before/after | Adjective/Adverb translations | Word order preference |

#### Multi-Level Attributes (can be used at multiple levels)

| Attribute | Source Levels | Description |
|-----------|---------------|-------------|
| `auxiliary` | form, translation | Auxiliary verb (form: actual, translation: expected) |
| `optional_tag` | word, form, translation | Contextual metadata |

---

## Validation Rules

### Completeness Checks

**Dictionary Entry:**
- ✅ `italian` is not null
- ✅ `word_type` is valid ('noun', 'verb', 'adjective', 'adverb', 'preposition')
- ✅ `word_type` is lowercase

**Word Translations:**
- ✅ At least 1 translation exists
- ✅ Exactly 1 translation has `display_priority = 1`
- ✅ Verb translations have `auxiliary` tag

**Word Forms:**
- ✅ Form count matches expected (130 for standard verbs, 179 for dual auxiliary)
- ✅ All forms have required metadata based on type
- ✅ No duplicate forms (same mood/tense/person/number combination)

**Form Translations:**
- ✅ Every form has at least 1 translation
- ✅ Compound forms link to translations with matching auxiliary
- ✅ Restricted forms only link to appropriate translations

### Metadata Validation

**Required Tags by Entity Type:**

**Nouns (word-level):**
- ✅ `gender` attribute

**Verbs (word-level):**
- ✅ `conjugation_type` (recommended, not strictly required)

**Verb Translations (translation-level):**
- ✅ `auxiliary` attribute (essere or avere)

**Verb Forms (form-level):**
- ✅ `verb_form_type` (simple/compound/progressive)
- ✅ `mood` (indicativo/congiuntivo/etc.)
- ✅ `tense` (presente/imperfetto/etc.)
- ✅ `person` (except infinitive/participle/gerund)
- ✅ `number` (except infinitive/participle/gerund)
- ✅ `auxiliary` (compound forms only)

**Adjectives (word-level):**
- ✅ `form_pattern` (form-4 or form-2)

**Adjective Forms (form-level):**
- ✅ `gender` (masculine/feminine)
- ✅ `number` (singolare/plurale)

### Consistency Checks

**Compound Forms:**
- ✅ Auxiliary tag on form matches one of the translation auxiliary tags
- ✅ Form text actually contains the auxiliary verb
- ✅ Compound forms follow pattern: [auxiliary] + [past participle]

**Progressive Forms:**
- ✅ Form text contains "sto/stai/sta/stiamo/state/stanno" + gerund
- ✅ Progressive forms do NOT have auxiliary tag

**Congiuntivo Forms:**
- ✅ Form text starts with "che "

**Imperativo Forms:**
- ✅ Form text ends with "!"

**Restrictions:**
- ✅ If translation has `word_restriction='plural-only'`, it only links to plural forms
- ✅ If word has `word_restriction='missing-imperative'`, no imperativo forms exist

---

## Examples

### Example 1: Simple Noun (ragazzo - boy)

```sql
-- Step 1: Insert base word
INSERT INTO dictionary (id, italian, word_type)
VALUES ('uuid1', 'ragazzo', 'noun') RETURNING id;

-- Tag as masculine
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
VALUES ('word', 'uuid1', 'gender-attr-id', 'masculine-value-id');

-- Step 2: Add translation
INSERT INTO word_translations (id, word_id, translation, display_priority)
VALUES ('uuid2', 'uuid1', 'boy', 1);

-- Step 3: Generate forms (4 forms)
INSERT INTO word_forms (id, word_id, form_text) VALUES
  ('uuid3', 'uuid1', 'ragazzo'),  -- masc. sing.
  ('uuid4', 'uuid1', 'ragazza'),  -- fem. sing.
  ('uuid5', 'uuid1', 'ragazzi'),  -- masc. pl.
  ('uuid6', 'uuid1', 'ragazze');  -- fem. pl.

-- Tag forms
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  ('form', 'uuid3', 'number-attr-id', 'singolare-value-id'),
  ('form', 'uuid3', 'gender-attr-id', 'masculine-value-id'),
  ('form', 'uuid4', 'number-attr-id', 'singolare-value-id'),
  ('form', 'uuid4', 'gender-attr-id', 'feminine-value-id'),
  ('form', 'uuid5', 'number-attr-id', 'plurale-value-id'),
  ('form', 'uuid5', 'gender-attr-id', 'masculine-value-id'),
  ('form', 'uuid6', 'number-attr-id', 'plurale-value-id'),
  ('form', 'uuid6', 'gender-attr-id', 'feminine-value-id');

-- Step 4: Create form translations (4 forms × 1 translation = 4)
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid7', 'uuid3', 'uuid2', 'boy'),
  ('uuid8', 'uuid4', 'uuid2', 'girl'),
  ('uuid9', 'uuid5', 'uuid2', 'boys'),
  ('uuid10', 'uuid6', 'uuid2', 'girls');
```

### Example 2: Simple Verb with One Translation (dormire - to sleep)

```sql
-- Step 1: Insert base word
INSERT INTO dictionary (id, italian, word_type)
VALUES ('uuid1', 'dormire', 'verb');

-- Tag conjugation type
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
VALUES ('word', 'uuid1', 'conjugation-type-attr-id', 'ire-value-id');

-- Step 2: Add translation with auxiliary
INSERT INTO word_translations (id, word_id, translation, display_priority)
VALUES ('uuid2', 'uuid1', 'to sleep', 1);

-- Tag auxiliary as avere
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
VALUES ('word_translation', 'uuid2', 'auxiliary-attr-id', 'avere-value-id');

-- Step 3: Generate 130 forms (51 simple + 49 compound + 30 progressive)
-- Simple form example: dormo (present indicative, 1st person singular)
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid3', 'uuid1', 'dormo');

INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  ('form', 'uuid3', 'verb-form-type-attr-id', 'simple-value-id'),
  ('form', 'uuid3', 'mood-attr-id', 'indicativo-value-id'),
  ('form', 'uuid3', 'tense-attr-id', 'presente-value-id'),
  ('form', 'uuid3', 'person-attr-id', 'prima-persona-value-id'),
  ('form', 'uuid3', 'number-attr-id', 'singolare-value-id');

-- Compound form example: ho dormito (passato prossimo, 1st person singular)
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid4', 'uuid1', 'ho dormito');

INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  ('form', 'uuid4', 'verb-form-type-attr-id', 'compound-value-id'),
  ('form', 'uuid4', 'mood-attr-id', 'indicativo-value-id'),
  ('form', 'uuid4', 'tense-attr-id', 'passato-prossimo-value-id'),
  ('form', 'uuid4', 'person-attr-id', 'prima-persona-value-id'),
  ('form', 'uuid4', 'number-attr-id', 'singolare-value-id'),
  ('form', 'uuid4', 'auxiliary-attr-id', 'avere-value-id');

-- Progressive form example: sto dormendo (present progressive, 1st person singular)
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid5', 'uuid1', 'sto dormendo');

INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  ('form', 'uuid5', 'verb-form-type-attr-id', 'progressive-value-id'),
  ('form', 'uuid5', 'mood-attr-id', 'indicativo-value-id'),
  ('form', 'uuid5', 'tense-attr-id', 'presente-progressivo-value-id'),
  ('form', 'uuid5', 'person-attr-id', 'prima-persona-value-id'),
  ('form', 'uuid5', 'number-attr-id', 'singolare-value-id');
-- NOTE: No auxiliary tag for progressive forms

-- Step 4: Create form translations (130 forms × 1 translation = 130)
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid6', 'uuid3', 'uuid2', 'I sleep'),
  ('uuid7', 'uuid4', 'uuid2', 'I have slept'),
  ('uuid8', 'uuid5', 'uuid2', 'I am sleeping');
-- ... (127 more)
```

### Example 3: Dual Translation Verb (parlare - to speak/to talk)

```sql
-- Step 1: Insert base word
INSERT INTO dictionary (id, italian, word_type)
VALUES ('uuid1', 'parlare', 'verb');

-- Step 2: Add 2 translations (both with avere)
INSERT INTO word_translations (id, word_id, translation, display_priority) VALUES
  ('uuid2', 'uuid1', 'to speak', 1),
  ('uuid3', 'uuid1', 'to talk', 2);

-- Both use avere
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  ('word_translation', 'uuid2', 'auxiliary-attr-id', 'avere-value-id'),
  ('word_translation', 'uuid3', 'auxiliary-attr-id', 'avere-value-id');

-- Step 3: Generate 130 forms (same as dormire)
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid4', 'uuid1', 'parlo');
-- ... (tag metadata)

-- Step 4: Create form translations (130 forms × 2 translations = 260)
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid5', 'uuid4', 'uuid2', 'I speak'),   -- form × translation 1
  ('uuid6', 'uuid4', 'uuid3', 'I talk');    -- form × translation 2
-- ... (258 more)
```

### Example 4: Dual Auxiliary Verb (finire - to finish/to end)

```sql
-- Step 1: Insert base word
INSERT INTO dictionary (id, italian, word_type)
VALUES ('uuid1', 'finire', 'verb');

-- Step 2: Add 2 translations with DIFFERENT auxiliaries
INSERT INTO word_translations (id, word_id, translation, display_priority) VALUES
  ('uuid2', 'uuid1', 'to finish', 1),  -- uses avere
  ('uuid3', 'uuid1', 'to end', 2);     -- uses essere

-- Tag different auxiliaries
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  ('word_translation', 'uuid2', 'auxiliary-attr-id', 'avere-value-id'),
  ('word_translation', 'uuid3', 'auxiliary-attr-id', 'essere-value-id');

-- Step 3: Generate 179 forms (51 simple + 98 compound + 30 progressive)

-- Simple form: finisco (links to both translations)
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid4', 'uuid1', 'finisco');
-- ... (tag metadata)

-- Compound form with AVERE: ho finito (links ONLY to "to finish")
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid5', 'uuid1', 'ho finito');
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  -- ... (other metadata)
  ('form', 'uuid5', 'auxiliary-attr-id', 'avere-value-id');

-- Compound form with ESSERE: è finito (links ONLY to "to end")
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid6', 'uuid1', 'è finito');
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  -- ... (other metadata)
  ('form', 'uuid6', 'auxiliary-attr-id', 'essere-value-id');

-- Progressive form: sto finendo (links to both translations)
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid7', 'uuid1', 'sto finendo');
-- ... (tag metadata, NO auxiliary tag)

-- Step 4: Create form translations
-- Simple forms: 51 × 2 = 102
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid8', 'uuid4', 'uuid2', 'I finish'),
  ('uuid9', 'uuid4', 'uuid3', 'I end');

-- Compound avere forms: 49 × 1 = 49 (only "to finish")
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid10', 'uuid5', 'uuid2', 'I have finished');

-- Compound essere forms: 49 × 1 = 49 (only "to end")
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid11', 'uuid6', 'uuid3', 'it has ended');

-- Progressive forms: 30 × 2 = 60
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid12', 'uuid7', 'uuid2', 'I am finishing'),
  ('uuid13', 'uuid7', 'uuid3', 'I am ending');

-- Total: 102 + 49 + 49 + 60 = 260 form_translations
```

### Example 5: Restriction-Based Verb (lavarsi - reflexive with plural restriction)

```sql
-- Step 1: Insert base word
INSERT INTO dictionary (id, italian, word_type)
VALUES ('uuid1', 'lavarsi', 'verb');

-- Tag as reflexive
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
VALUES ('word', 'uuid1', 'reflexive-attr-id', 'reflexive-value-id');

-- Step 2: Add 2 translations with restriction on second
INSERT INTO word_translations (id, word_id, translation, display_priority) VALUES
  ('uuid2', 'uuid1', 'to wash oneself', 1),      -- no restriction
  ('uuid3', 'uuid1', 'to wash each other', 2);   -- plural-only

-- Both use essere
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  ('word_translation', 'uuid2', 'auxiliary-attr-id', 'essere-value-id'),
  ('word_translation', 'uuid3', 'auxiliary-attr-id', 'essere-value-id');

-- Tag restriction on second translation
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id)
VALUES ('word_translation', 'uuid3', 'word-restriction-attr-id', 'plural-only-value-id');

-- Step 3: Generate 130 forms (standard)

-- Singular form: mi lavo (1st person singular)
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid4', 'uuid1', 'mi lavo');
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  -- ... (metadata)
  ('form', 'uuid4', 'number-attr-id', 'singolare-value-id');

-- Plural form: ci laviamo (1st person plural)
INSERT INTO word_forms (id, word_id, form_text)
VALUES ('uuid5', 'uuid1', 'ci laviamo');
INSERT INTO entity_meta_values (entity_type, entity_id, attribute_id, value_id) VALUES
  -- ... (metadata)
  ('form', 'uuid5', 'number-attr-id', 'plurale-value-id');

-- Step 4: Create form translations with restriction logic
-- Singular forms (65): Link ONLY to "to wash oneself" (1 translation)
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid6', 'uuid4', 'uuid2', 'I wash myself');  -- ONLY uuid2

-- Plural forms (65): Link to BOTH translations (2 translations)
INSERT INTO form_translations (id, form_id, word_translation_id, translation) VALUES
  ('uuid7', 'uuid5', 'uuid2', 'we wash ourselves'),  -- uuid2
  ('uuid8', 'uuid5', 'uuid3', 'we wash each other'); -- uuid3

-- Total: 65 × 1 + 65 × 2 = 195 form_translations
```

---

## Summary Checklist

When adding a new word, ensure:

### Dictionary Entry
- [ ] Base form is correct (masculine singular for nouns/adjectives, infinitive for verbs)
- [ ] `word_type` is valid and lowercase
- [ ] Phonetic and IPA pronunciations added (optional but recommended)

### Word-Level Metadata
- [ ] `gender` tagged (required for nouns)
- [ ] `conjugation_type` tagged (recommended for verbs)
- [ ] `reflexive` tagged (if applicable)
- [ ] `form_pattern` tagged (required for adjectives)
- [ ] `word_restriction` tagged (if applicable)
- [ ] `cefr_level` and `frequency_tier` tagged (optional)

### Translations
- [ ] At least 1 translation exists
- [ ] Primary translation has `display_priority = 1`
- [ ] `auxiliary` tagged for ALL verb translations (required)
- [ ] `usage_notes` filled out (explain when/how to use)
- [ ] `transitivity`, `verb_type`, `register` tagged (as applicable)
- [ ] `word_restriction` tagged on translations if needed

### Forms
- [ ] Form count matches expected for word type
- [ ] All forms have required metadata tags
- [ ] Congiuntivo forms start with "che "
- [ ] Imperativo forms end with "!"
- [ ] Compound forms follow: [auxiliary] + [participle]
- [ ] Progressive forms follow: [stare] + [gerund]
- [ ] No duplicate forms exist

### Form-Level Metadata
- [ ] `verb_form_type` tagged (simple/compound/progressive)
- [ ] `mood` tagged (required for verbs)
- [ ] `tense` tagged (required for verbs)
- [ ] `person` tagged (required except infinitive/participle/gerund)
- [ ] `number` tagged (required except infinitive/participle/gerund)
- [ ] `auxiliary` tagged (compound forms only)
- [ ] `form_irregular` tagged (if form is irregular)

### Form Translations
- [ ] Every form has at least 1 translation
- [ ] Compound forms link to translations with matching auxiliary
- [ ] Restrictions are applied correctly
- [ ] English translations are complete and accurate
- [ ] Multiplication formula applied correctly (form × applicable translations)

---

**End of Guide**

For questions or clarifications, refer to the database schema or consult existing examples in the `dictionary`, `word_forms`, `word_translations`, and `form_translations` tables.
