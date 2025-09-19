# Misti Verb Forms System Architecture

> **Comprehensive Explanatory Reference**  
> This document explains how the Misti verb forms system works at the architectural level. It describes what exists, why it was designed this way, and how all components interact to provide complete Italian verb conjugation coverage.

---

## Table of Contents

1. [Verb System Overview](#1-verb-system-overview)
2. [Verb Classification & Storage](#2-verb-classification--storage)
3. [Complete Mood & Tense Architecture](#3-complete-mood--tense-architecture)
4. [Auxiliary Verb System](#4-auxiliary-verb-system)
5. [Special Cases & Complex Logic](#5-special-cases--complex-logic)
6. [Form-Translation Assignment Architecture](#6-form-translation-assignment-architecture)
7. [Database Integration Architecture](#7-database-integration-architecture)
8. [Complete Form Inventories and Critical Verb Type Examples](#8-complete-form-inventories-and-critical-verb-type-examples)

---

## 1. Verb System Overview

### 1.1 What is the Complete Verb Forms Architecture?

The Misti verb forms system is built on a **materialization-centric architecture** where every verb form that students need to learn is pre-stored in the database as complete, ready-to-use entries. This design fundamentally differs from generation-on-demand systems.

**Core Principle**: All forms (simple, compound, and progressive) exist as individual `word_forms` records in the database. There is no dynamic generation at runtime - everything is pre-materialized and stored with complete metadata using the normalized `entity_meta_values` tagging system.

### 1.2 Why This Approach Was Chosen

This architecture was chosen for several critical reasons:

**Performance**: Pre-materialized forms eliminate complex runtime conjugation logic, providing instant access to any verb form without computation delays.

**Accuracy**: Each form can be individually verified, corrected, and enhanced with phonetic transcriptions, IPA notations, and usage notes. No algorithmic errors can propagate.

**Pedagogical Control**: Every form can have tailored translations, difficulty ratings, and learning progression markers based on actual pedagogical requirements rather than linguistic rules.

**Multi-language Support**: The universal terminology system allows the same data to power interfaces in different languages without architectural changes.

**Exception Handling**: Italian has numerous irregular verbs and special cases that are better handled through explicit storage than complex rule systems.

### 1.3 How It Maps to Italian Grammar

The system recognizes Italian's **7 distinct moods** (modi grammaticali):

1. **Indicativo** (Indicative) - Factual statements
2. **Congiuntivo** (Subjunctive) - Doubt, desire, emotion  
3. **Condizionale** (Conditional) - Hypothetical situations
4. **Imperativo** (Imperative) - Commands and requests
5. **Infinito** (Infinitive) - Base verb forms
6. **Participio** (Participle) - Adjectival and compound auxiliaries
7. **Gerundio** (Gerund) - Progressive and adverbial forms

Each mood contains multiple tenses, resulting in **26 distinct tense categories** that every verb can potentially express. The system ensures comprehensive coverage of this linguistic landscape.

---

## 2. Verb Classification & Storage

### 2.1 Conjugation Classes Explanation

Italian verbs are classified into **4 conjugation patterns** based on their infinitive endings:

#### are-conjugation (First Conjugation)
- **Pattern**: Verbs ending in `-are`
- **Examples**: parlare, amare, studiare
- **Characteristics**: Most regular pattern, largest group (~4000 verbs)
- **Present endings**: -o, -i, -a, -iamo, -ate, -ano

#### ere-conjugation (Second Conjugation)  
- **Pattern**: Verbs ending in `-ere`
- **Examples**: credere, vendere, mettere
- **Characteristics**: Many irregularities, especially in past participles
- **Present endings**: -o, -i, -e, -iamo, -ete, -ono

#### ire-conjugation (Third Conjugation)
- **Pattern**: Verbs ending in `-ire` without -isc- infix
- **Examples**: dormire, partire, sentire  
- **Characteristics**: Smaller group, relatively regular
- **Present endings**: -o, -i, -e, -iamo, -ite, -ono

#### ire-isc-conjugation (Third Conjugation with -isc-)
- **Pattern**: Verbs ending in `-ire` with -isc- infix in certain forms
- **Examples**: finire, pulire, costruire
- **Characteristics**: -isc- appears in 1st/2nd/3rd singular and 3rd plural present forms
- **Present endings**: -isco, -isci, -isce, -iamo, -ite, -iscono

### 2.2 Multi-Dimensional Verb Classification Architecture

The Misti system uses a **multi-dimensional approach** to verb classification, recognizing that verbs have multiple independent characteristics that must be tracked separately:

#### Behavioral Pattern Classification (verb_type)
This dimension captures **special behavioral patterns** that affect how verbs conjugate, what forms they have, or how they function grammatically:

- **metaattr021val[ID] (verb_type: "modal")** - Verbs that can take bare infinitives (dovere, potere, volere)
- **metaattr021val[ID] (verb_type: "dual-auxiliary")** - Verbs that use different auxiliaries based on meaning (correre, saltare)
- **metaattr021val[ID] (verb_type: "defective")** - Verbs missing certain persons/numbers (vigere, urgere)
- **metaattr021val[ID] (verb_type: "impersonal")** - Verbs primarily used in 3rd person (importare, bisognare)
- **metaattr021val[ID] (verb_type: "reflexive")** - Inherently reflexive verbs (svegliarsi, pentirsi)

#### Grammatical Property Classification (transitivity)
This dimension captures **grammatical argument structure** independent of behavioral patterns:

- **transitive** - Takes direct objects (mangiare qualcosa)
- **intransitive** - Cannot take direct objects (arrivare, dormire)
- **ambitransitive** - A SINGLE translation that can be used both transitively and intransitively (correre: "I run a race" / "I run fast" - same meaning, different object usage)

#### Why Multi-Dimensional Classification?
This separation is **linguistically accurate** because:

1. **Independence**: A verb can be modal AND transitive (dovere), or impersonal AND intransitive (importare)
2. **Precision**: Different translations of the same verb can have different transitivity without changing behavioral type
3. **Extensibility**: New behavioral patterns can be added without affecting grammatical classifications
4. **Pedagogical Clarity**: Students learn behavioral patterns and grammatical properties as separate concepts

#### Examples of Multi-Dimensional Classification:
```sql
-- Modal verb that can be transitive in some uses
verb_type: metaattr021val[ID] (verb_type: "modal")
transitivity: metaattr020val[ID] (transitivity: "transitive")

-- Weather verb that is grammatically intransitive
verb_type: metaattr021val[ID] (verb_type: "meteorological")
transitivity: metaattr020val[ID] (transitivity: "intransitive")

-- Dual auxiliary verb that can be used both ways
verb_type: metaattr021val[ID] (verb_type: "dual-auxiliary")
transitivity: metaattr020val[ID] (transitivity: "ambitransitive")
```

**IMPORTANT**: The `verb_type` attribute does **not** contain values like "transitive-verb" or "intransitive-verb" as these would inappropriately mix behavioral and grammatical dimensions.

### 2.3 Complete Mood/Tense Matrix from epicRequiredForms

The system defines **26 essential form categories** that verbs can potentially have:

#### Simple Tenses (Stored in Database) - 12 categories

**Indicativo (Indicative)**
- `presente` - Present tense (io parlo)
- `imperfetto` - Imperfect past (io parlavo)  
- `passato-remoto` - Remote past (io parlai)
- `futuro-semplice` - Simple future (io parlerò)

**Congiuntivo (Subjunctive)**
- `congiuntivo-presente` - Present subjunctive (che io parli)
- `congiuntivo-imperfetto` - Imperfect subjunctive (che io parlassi)

**Condizionale (Conditional)**
- `condizionale-presente` - Present conditional (io parlerei)

**Imperativo (Imperative)**
- `imperativo-presente` - Present imperative (parla!)

**Non-finite Forms**
- `infinito-presente` - Present infinitive (parlare)
- `participio-presente` - Present participle (parlante)  
- `participio-passato` - Past participle (parlato)
- `gerundio-presente` - Present gerund (parlando)

#### Compound Forms (Stored with Building Block References) - 14 categories

**CRITICAL CORRECTION**: Compound and progressive forms are **NOT generated dynamically**. They are **pre-stored** in the `word_forms` table with complete metadata, just like simple forms. The "generation" refers to the materialization process that creates these stored entries using auxiliary patterns + building blocks.

**Perfect Compounds** (Stored with auxiliary + past participle references):
- `passato-prossimo` - Present perfect (ho parlato)
- `trapassato-prossimo` - Pluperfect (avevo parlato)
- `futuro-anteriore` - Future perfect (avrò parlato)
- `trapassato-remoto` - Past anterior (ebbi parlato)
- `congiuntivo-passato` - Perfect subjunctive (che io abbia parlato)
- `congiuntivo-trapassato` - Pluperfect subjunctive (che io avessi parlato)
- `condizionale-passato` - Perfect conditional (avrei parlato)
- `infinito-passato` - Perfect infinitive (aver parlato)
- `gerundio-passato` - Perfect gerund (avendo parlato)

**Progressive Forms** (Stored with stare + present gerund references):
- `presente-progressivo` - Present progressive (sto parlando)
- `passato-progressivo` - Past progressive (stavo parlando)
- `futuro-progressivo` - Future progressive (starò parlando)
- `congiuntivo-presente-progressivo` - Subjunctive present progressive (che io stia parlando)
- `condizionale-presente-progressivo` - Conditional present progressive (starei parlando)

### 2.4 Frequency/CEFR Classification System

Verbs are prioritized using two complementary systems:

#### Frequency Classification
- `freq-top100` - Most essential 100 verbs
- `freq-top200` - Essential 200 verbs  
- `freq-top500` - Important 500 verbs
- `freq-top1000` - Common 1000 verbs
- `freq-top5000` - Extended vocabulary (5000 verbs)

#### CEFR (Common European Framework) Levels
- `CEFR-A1` - Absolute beginner (basic survival verbs)
- `CEFR-A2` - Elementary (extended basic verbs)
- `CEFR-B1` - Intermediate (complex situations)
- `CEFR-B2` - Upper-intermediate (nuanced expression)
- `CEFR-C1` - Advanced (sophisticated communication)
- `CEFR-C2` - Proficiency (near-native usage)

These classifications drive materialization priority - high-frequency, low-CEFR verbs get complete form sets first.

### 2.4 Verb Type Flags

Special behavioral markers are applied to verbs requiring non-standard handling:

#### metaattr021val[ID] (verb_type: "reflexive")
- **Purpose**: Marks verbs that require reflexive pronouns and dual translation system
- **Examples**: lavarsi (to wash oneself/each other), alzarsi (to get up/help each other up)
- **Impact**: Forms include inherent clitics (mi lavo, ti lavi, si lava) with both direct reflexive and reciprocal meanings
- **Required Translations**: Every reflexive verb must have both direct reflexive and reciprocal translations

#### metaattr021val[ID] (verb_type: "modal")
- **Purpose**: Identifies modal auxiliaries
- **Examples**: potere (can), dovere (must), volere (want)
- **Impact**: Can take infinitive complements, auxiliary selection varies

#### metaattr021val[ID] (verb_type: "impersonal")
- **Purpose**: Verbs that only occur in 3rd person
- **Examples**: bisognare (to be necessary), importare (to matter)
- **Impact**: Only 3rd person forms are materialized

#### metaattr021val[ID] (verb_type: "defective")
- **Purpose**: Verbs missing certain forms
- **Examples**: solere (to be accustomed), vigere (to be in force)
- **Impact**: Only forms that actually exist are materialized

---

## 3. Complete Mood & Tense Architecture

### 3.1 All 7 Moods with Their Tenses Explained

### Indicativo (Indicative Mood)

The indicative expresses factual, objective reality.

**Simple Tenses**:
- `presente` - Present reality (io parlo = I speak)
- `imperfetto` - Ongoing past (io parlavo = I was speaking)
- `passato-remoto` - Completed past (io parlai = I spoke)
- `futuro-semplice` - Future certainty (io parlerò = I will speak)

**Compound Tenses**:
- `passato-prossimo` - Recent past (ho parlato = I have spoken)
- `trapassato-prossimo` - Past perfect (avevo parlato = I had spoken)
- `futuro-anteriore` - Future perfect (avrò parlato = I will have spoken)
- `trapassato-remoto` - Past anterior (ebbi parlato = I had spoken - literary)

**Progressive Tenses**:
- `presente-progressivo` - Ongoing present (sto parlando = I am speaking)
- `passato-progressivo` - Ongoing past (stavo parlando = I was speaking)
- `futuro-progressivo` - Ongoing future (starò parlando = I will be speaking)

### Congiuntivo (Subjunctive Mood)

The subjunctive expresses subjectivity, doubt, emotion, and hypothetical situations.

**Simple Tenses**:
- `congiuntivo-presente` - Present subjectivity (che io parli = that I speak)
- `congiuntivo-imperfetto` - Past subjectivity (che io parlassi = that I spoke)

**Compound Tenses**:
- `congiuntivo-passato` - Perfect subjectivity (che io abbia parlato = that I have spoken)
- `congiuntivo-trapassato` - Pluperfect subjectivity (che io avessi parlato = that I had spoken)

**Progressive Tenses**:
- `congiuntivo-presente-progressivo` - Ongoing subjunctive (che io stia parlando = that I am speaking)

### Condizionale (Conditional Mood)

The conditional expresses hypothetical situations, polite requests, and uncertain information.

**Simple Tenses**:
- `condizionale-presente` - Present hypothetical (io parlerei = I would speak)

**Compound Tenses**:
- `condizionale-passato` - Past hypothetical (avrei parlato = I would have spoken)

**Progressive Tenses**:
- `condizionale-presente-progressivo` - Ongoing hypothetical (starei parlando = I would be speaking)

### Imperativo (Imperative Mood)

The imperative expresses commands, requests, and instructions.

**Simple Tenses**:
- `imperativo-presente` - Present command (parla! = speak!)

**Compound Tenses**:
- `imperativo-passato` - Perfect command (abbi parlato! = have spoken! - rare)

### Infinito (Infinitive Mood)

The infinitive provides the basic, unconjugated verb form.

**Simple Tenses**:
- `infinito-presente` - Present infinitive (parlare = to speak)

**Compound Tenses**:
- `infinito-passato` - Perfect infinitive (aver parlato = to have spoken)

### Participio (Participle Mood)

Participles function as adjectives and building blocks for compound tenses.

**Simple Tenses**:
- `participio-presente` - Present participle (parlante = speaking)
- `participio-passato` - Past participle (parlato = spoken)

### Gerundio (Gerund Mood)

Gerunds express ongoing actions and function adverbially.

**Simple Tenses**:
- `gerundio-presente` - Present gerund (parlando = speaking/while speaking)

**Compound Tenses**:
- `gerundio-passato` - Perfect gerund (avendo parlato = having spoken)

### 3.2 Person/Number Requirements per Tense

Different tenses have different person/number requirements:

#### Finite Forms (Most tenses)
Require all 6 person/number combinations:
- `prima-persona singolare` (io)
- `seconda-persona singolare` (tu)  
- `terza-persona singolare` (lui/lei)
- `prima-persona plurale` (noi)
- `seconda-persona plurale` (voi)
- `terza-persona plurale` (loro)

#### Imperative Exception
Missing 1st person singular (no "io" commands):
- `seconda-persona singolare` (tu - parla!)
- `terza-persona singolare` (Lei - parli! - formal)
- `prima-persona plurale` (noi - parliamo!)
- `seconda-persona plurale` (voi - parlate!)
- `terza-persona plurale` (Loro - parlino! - formal)

#### Non-finite Forms
Person/number invariable:
- `infinito-presente/passato` - no person/number marking
- `participio-presente/passato` - no person/number marking  
- `gerundio-presente/passato` - no person/number marking

### 3.3 Simple vs Compound vs Progressive Form Relationships

#### Simple Forms (Base Storage)
- **Storage**: Directly stored in `word_forms` table
- **Structure**: Single word (parlo, parlavo, parlerò)
- **Tags**: Include mood, tense, person, number, `simple`
- **Purpose**: Foundation forms and standalone expressions

#### Compound Forms (Pre-stored with Component References)
- **Storage**: Pre-stored in `word_forms` table with complete form text and metadata
- **Structure**: Auxiliary + past participle (ho parlato, avevo parlato)
- **Materialization Components**: 
  - Auxiliary patterns from `/Users/Work/misti/lib/auxPatterns.ts` 
  - Past participles from stored `participio-passato` forms
- **Creation Process**: `AuxiliaryPatternService` combines components during materialization, then stores complete forms
- **Tags**: Stored in `entity_meta_values` table with compound tense, person, number, `compound`, auxiliary type references

#### Progressive Forms (Pre-stored with Component References)  
- **Storage**: Pre-stored in `word_forms` table with complete form text and metadata
- **Structure**: Stare + present gerund (sto parlando, stavo parlando)
- **Materialization Components**:
  - Stare auxiliary patterns (different for each tense)
  - Present gerunds from stored `gerundio-presente` forms
- **Creation Process**: Same materialization service as compound forms, different auxiliary patterns
- **Tags**: Stored in `entity_meta_values` table with progressive tense, person, number, `progressive` references

### 3.4 Building Block Forms (Essential for Generation)

Three forms are **critical** for the materialization architecture:

#### Past Participle (participio-passato)
- **Required for**: All 8 compound perfect tenses
- **Storage**: `word_forms` table with tags `['participio', 'participio-passato', 'simple']`
- **Examples**: parlato, creduto, finito
- **Irregulars**: fatto (fare), detto (dire), stato (essere/stare)
- **Impact if missing**: Cannot materialize any compound tense for that verb

#### Present Gerund (gerundio-presente)  
- **Required for**: All 5 progressive tenses
- **Storage**: `word_forms` table with tags `['gerundio', 'gerundio-presente', 'simple']`
- **Examples**: parlando, credendo, finendo  
- **Irregulars**: facendo (fare), dicendo (dire), stando (stare)
- **Impact if missing**: Cannot materialize any progressive tense for that verb

#### Present Infinitive (infinito-presente)
- **Required for**: Negative imperatives, clitic attachment (future scope)
- **Storage**: `word_forms` table with tags `['infinito', 'infinito-presente', 'simple']`
- **Examples**: parlare, credere, finire
- **Note**: Usually identical to dictionary headword
- **Impact if missing**: Cannot form negative commands (non parlare!)

---

## 4. Auxiliary Verb System

### 4.1 How avere/essere Selection Works

Auxiliary selection in Italian follows semantic and syntactic principles stored at the **translation level**, not the word level.

#### Translation-Level Assignment
Each translation has auxiliary metadata stored via entity_meta_values:
- `auxiliary: "avere"` - For transitive actions and direct objects
- `auxiliary: "essere"` - For intransitive actions, motion, state changes

#### Semantic Guidelines Implemented

**Essere Verbs** (state-change-verbs):
- Motion with destination: andare, venire, arrivare
- State changes: diventare, nascere, morire  
- Existence changes: apparire, scomparire
- Reflexive actions: lavarsi, alzarsi

**Avere Verbs** (action-verbs):
- Transitive actions: mangiare, bere, leggere
- Creation/production: fare, costruire, cucinare
- General activities: parlare, lavorare, giocare

#### Transitivity Validation
The system validates auxiliary assignment against transitivity via entity_meta_values:
- `transitivity: "transitive"` typically uses `auxiliary: "avere"`
- `transitivity: "intransitive"` typically uses `auxiliary: "essere"`
- Mismatches trigger validation warnings

### 4.2 Past Participle Agreement Rules  

Past participle agreement follows Italian grammar rules implemented in the auxiliary patterns:

#### With essere (implemented)
Past participle **must agree** with subject:
- `lui è andato` (masculine singular)
- `lei è andata` (feminine singular)  
- `loro sono andati` (masculine/mixed plural)
- `loro sono andate` (feminine plural)

#### With avere (implemented)
Past participle **remains unchanged** by default:
- `io ho mangiato` (regardless of speaker gender)
- `lei ha mangiato` (participle doesn't change)
- Direct object agreement (future scope): `li ho visti` vs `li ho mangiati`

#### Agreement Storage
Agreement variants are stored as separate `word_forms` entries:
- `andato` (masculine singular)
- `andata` (feminine singular)
- `andati` (masculine plural)
- `andate` (feminine plural)

Each form has appropriate gender/number tags for correct selection.

### 4.3 Compound Form Storage Rules

#### Base Male Form Storage Architecture
Compound forms with essere auxiliary are stored using **base masculine form only** to eliminate gender/number agreement complications at the storage level.

**Storage Rules**:
- **Store**: "sono andato" (not "sono andato/a")
- **Store**: "è lavato" (not "è lavato/a")
- **Store**: "siamo andati" (not "siamo andati/e")
- **Store**: "sarà corso" (not "sarà corso/a")

#### Agreement Elimination Strategy
The system removes "/a", "/e" suffixes from stored compound forms:
- **Database Storage**: Base masculine form only
- **Frontend Display**: Agreement handled at display/presentation level, not storage level
- **User Interface**: Agreement logic applies appropriate endings based on subject gender/number

#### Examples in Practice
**essere Compound Storage**:
```sql
-- Stored in word_forms.form_text
"sono andato"    -- NOT "sono andato/a"
"sei partito"    -- NOT "sei partito/a"
"siamo usciti"   -- NOT "siamo usciti/e"
"sono arrivate"  -- Exception: explicitly feminine plural contexts
```

**Frontend Agreement Logic**:
```javascript
// Display logic applies agreement at runtime
if (subject.gender === 'feminine') {
  displayForm = baseForm.replace(/o$/, 'a');  // andato → andata
  displayForm = displayForm.replace(/i$/, 'e'); // andati → andate
}
```

#### Benefits of Base Male Form Storage
- **Storage Efficiency**: Single form per tense/person/number combination
- **Data Consistency**: Eliminates agreement variant proliferation in database
- **Agreement Flexibility**: Frontend can apply any agreement rule without schema changes
- **Reduced Complexity**: Compound form materialization simplified

This storage architecture ensures compound forms are stored consistently while maintaining full agreement capabilities through frontend logic.

### 4.4 Translation-level Auxiliary Assignments

The auxiliary assignment architecture works as follows:

#### Assignment Location
Translation auxiliary assignment via entity_meta_values:
```sql
-- entity_type='word_translation', entity_id=<translation_id>
value_id → metaattr002val[ID] (auxiliary: "avere")
-- OR
value_id → metaattr002val[ID] (auxiliary: "essere")
```

#### Assignment Logic per Translation
Different meanings of the same verb can have different auxiliaries:

**Example: correre (to run)**
- Translation 1: "to run (sport)" → `auxiliary: "avere"` (transitive reading)
- Translation 2: "to rush to" → `auxiliary: "essere"` (motion reading)

This allows the same verb to have different stored compound forms based on meaning.

#### Validation Rules
The system enforces:
1. Every translation **must** specify an auxiliary
2. Auxiliary must be exactly `"avere"` or `"essere"`  
3. Auxiliary should be consistent with transitivity metadata
4. Reflexive verbs (`usage: "reflexive"`) must use `"essere"`

### 4.5 Progressive Tense Patterns (stare usage)

Progressive forms use **stare** as auxiliary, never avere/essere:

#### Stare Pattern Implementation
The `AUXILIARY_PATTERNS` in `/Users/Work/misti/lib/auxPatterns.ts` includes 74 pre-computed stare conjugations:

**Present Progressive**: sto/stai/sta/stiamo/state/stanno + gerund
**Past Progressive**: stavo/stavi/stava/stavamo/stavate/stavano + gerund  
**Future Progressive**: starò/starai/starà/staremo/starete/staranno + gerund

#### Progressive Generation Process
1. Load appropriate stare pattern for tense/person/number
2. Retrieve stored present gerund for the verb
3. Combine: `stare_auxiliary` + ` ` + `gerund_form`
4. Tag with `progressive` and appropriate tense metadata

#### Progressive Auxiliary Independence
Progressive forms are **completely independent** of avere/essere auxiliary assignment:
- `andare` normally uses essere: `sono andato`
- But progressive always uses stare: `sto andando` (never `sono andando`)

This eliminates auxiliary selection complexity for progressive tenses.

---

## 5. Special Cases & Complex Logic

### 5.1 Reflexive and Reciprocal Verb Architecture

#### Linguistic Foundation
Italian reflexive verbs present a unique architectural challenge because the same morphological form (reflexive pronoun + verb) expresses two fundamentally different semantic relationships. This creates a mandatory dual translation system.

#### Reciprocal Verbs and Number Restrictions
Reciprocal verbs express mutual actions and have special constraints:

#### Reciprocal Identification
Reciprocal translations are marked via entity_meta_values:
```sql
-- entity_type='word_translation', entity_id=<translation_id>
value_id → metaattr021val[ID] (verb_type: "reciprocal")
value_id → metaattr013val[ID] (number_restriction: "plural-only")
```

#### Number Restrictions Implementation
- **Only plural persons allowed**: noi, voi, loro (1st, 2nd, 3rd plural)
- **Singular persons forbidden**: io, tu, lui/lei cannot perform reciprocal actions
- **Form filtering**: Only plural-tagged forms are linked to reciprocal translations

#### Examples in Practice
- `incontrarsi` (to meet each other):
  - ✅ `ci incontriamo` (we meet each other)
  - ✅ `vi incontrate` (you meet each other)  
  - ✅ `si incontrano` (they meet each other)
  - ❌ `mi incontro` (impossible - can't meet yourself)

#### Direct Reflexive vs Reciprocal Distinction
**Same form, different meanings**:
- `si salutano` (direct reflexive) = "they greet themselves" (each person says goodbye to their own reflection)
- `si salutano` (reciprocal) = "they greet each other" (mutual greeting between people)

**Disambiguation strategies**:
- Context usually clarifies meaning
- "L'un l'altro" or "a vicenda" can be added for reciprocal emphasis
- "Se stessi/se stesse" can be added for reflexive emphasis

#### Validation Logic
The system validates that:
- Reciprocal translations only have `form_translations` entries linking to plural forms
- Direct reflexive translations have entries for all person/number combinations
- Both translation types exist for every reflexive verb

### 5.2 Modal Verbs and Defective Verbs

#### Modal Verb Architecture
Modal verbs (`potere`, `dovere`, `volere`) have special properties:

**Auxiliary Selection Flexibility**:
- Modal + infinitive takes auxiliary of the infinitive verb
- `ho potuto mangiare` (mangiare uses avere)
- `sono potuto andare` (andare uses essere)

**Implementation Strategy**:
- Store both auxiliary variants for modals
- Let translation-level assignment handle selection
- Multiple translations can specify different auxiliaries for different contexts

#### Defective Verb Handling
Defective verbs miss certain forms entirely:

**Missing Form Detection**:
- `solere` (to be accustomed) - only 3rd person forms exist
- `vigere` (to be in force) - only infinitive and 3rd person present
- `concernere` (to concern) - missing many finite forms

**Implementation Approach**:
- Tag as `metaattr021val[ID] (verb_type: "defective")` at word level
- Only materialize forms that linguistically exist
- Validation system expects fewer forms for defective verbs

### 5.3 Impersonal Verbs

#### Impersonal Verb Classification
- **Marker**: `metaattr021val[ID] (verb_type: "impersonal")` tags
- **Constraint**: Only 3rd person singular forms are valid
- **Examples**: bisognare, importare

#### Form Materialization Strategy
- **Skip**: 1st/2nd person forms (io, tu, noi, voi)
- **Include**: Only `terza-persona singolare` forms
- **Auxiliary**: Typically essere for state-describing impersonals

#### Impersonal Verb Extensions
Some impersonal verbs can be used with other persons in specific contexts:
- `importare` literally: "importa" (it matters)
- `importare` extended: "importiamo prodotti" (we import products)

The system handles this through multiple translations with different `plurality` constraints.

### 5.4 Reflexive Verb Patterns

#### Reflexive Architecture Overview
Reflexive verbs require integrated pronouns that change form based on person:

**Pronoun Set**: mi, ti, si, ci, vi, si
**Integration**: Pronouns are **stored as part of the form**, not added dynamically

#### Critical Linguistic Requirement: Dual Translation System
Every reflexive verb **must have both** direct reflexive AND reciprocal translations, as Italian uses the same morphological structure (reflexive pronouns + verb) to express fundamentally different semantic relationships:

**Direct Reflexive**: Action directed toward oneself
- "si lavano" = "they wash themselves" (each person washes their own body)
- Can be replaced with "se stessi/se stesse" (themselves)
- Subject and object refer to the same entities

**Reciprocal**: Mutual action between multiple participants  
- "si lavano" = "they wash each other" (mutual washing action)
- Can be clarified with "l'un l'altro" or "a vicenda" when ambiguous
- Multiple subjects performing actions on each other

#### Translation Storage Requirements
Each reflexive verb must store:
1. **Direct Reflexive Translation**: `usage: "reflexive"`, covers all persons (io, tu, lui/lei, noi, voi, loro)
2. **Reciprocal Translation**: `usage: "reciprocal"`, `plurality: "plural-only"`, covers only plural persons (noi, voi, loro)

#### Base Clitic Forms Storage
Every reflexive verb stores "base clitic forms":

**Examples for `lavarsi` - Direct Reflexive**:
- `mi lavo` (I wash myself)
- `ti lavi` (you wash yourself)  
- `si lava` (he/she washes himself/herself)
- `ci laviamo` (we wash ourselves)
- `vi lavate` (you wash yourselves)
- `si lavano` (they wash themselves)

**Examples for `lavarsi` - Reciprocal**:
- ❌ `mi lavo` (impossible - cannot wash oneself reciprocally)
- ❌ `ti lavi` (impossible - cannot wash oneself reciprocally)
- ❌ `si lava` (impossible - cannot wash oneself reciprocally)
- ✅ `ci laviamo` (we wash each other)
- ✅ `vi lavate` (you wash each other)
- ✅ `si lavano` (they wash each other)

#### Clitic Integration Scope
**Current scope**: Base subject clitics only
**Future scope**: Complex combinations (lavati!, me lo lavo)

**Base clitics** (included):
- Subject reflexives: mi lavo, ti lavi, si lava
- Reciprocals: ci vediamo, vi parlate, si salutano

**Complex clitics** (excluded from EPIC scope):
- Enclitic imperatives: lavati!, alzatevi!
- Multiple pronouns: me lo dai, glielo porto  
- Complex combinations: me ne vado, se ne va

#### Reflexive Auxiliary Rules
All reflexive constructions **must use essere auxiliary**:
- `mi sono lavato` (never `mi ho lavato`)
- `ti eri alzato` (never `ti avevi alzato`)
- `si saranno vestiti` (never `si avranno vestiti`)

This is enforced through validation rules that ensure reflexive verbs have `auxiliary: "essere"` in all translations.

---

## 6. Form-Translation Assignment Architecture

### 6.1 Why Form Translations Coverage is Complex

The architecture requires **strategic coverage** between forms and translations, but coverage requirements are more complex than simple auxiliary patterns.

#### Number Restrictions from Meta Attributes
Meta attributes affect coverage requirements significantly:
- **"plural-only" restriction**: Translations marked with plural-only constraints (like reciprocals) only receive form_translations for plural forms
- **"singular-only" restriction**: Translations with singular-only constraints only get singular form_translations
- **No restriction**: Translations get form_translations for all appropriate forms

#### Coverage Matrix Complexity
Each form_translation links to exactly:
- **1 translation**: Specific meaning/usage context  
- **1 form**: Specific conjugated form

**Coverage calculation per translation**:
- Normal translation: ~130 forms total (simple + compound + progressive)
- Reciprocal translation: ~65 forms total (only plural persons)
- Impersonal translation: ~22 forms total (only 3rd person singular)

#### Semantic Precision Requirements
Different translations of the same verb may have different:
- **Auxiliary requirements**: correre (race/rush) → avere vs essere
- **Usage constraints**: incontrarsi (meet alone/meet each other) → any vs plural-only  
- **Register differences**: andare (go/leave) → informal vs formal
- **Number restrictions**: reciprocal verbs vs direct reflexive versions

#### Learning Progression Control
Students need to encounter:
- **Beginner translations** first (simple, common meanings)
- **Advanced translations** later (nuanced, contextual meanings)
- **Form-specific explanations** for complex tenses
- **Restricted forms** only when linguistically appropriate

#### UI Flexibility Requirements
The interface must show:
- **Translation variety** for the same form across different meanings
- **Contextual appropriateness** for each form-translation pairing
- **Progressive disclosure** based on student level
- **Filtered coverage** respecting number/person restrictions

### 6.2 Complete Coverage Matrix Requirements

#### Expected Coverage Calculation
Coverage calculations must account for number restrictions from meta attributes:

**For a normal verb translation (no restrictions)**:
- **Simple forms**: ~51 forms per verb (all moods/tenses/persons)
- **Compound forms**: ~49 forms per auxiliary pattern  
- **Progressive forms**: ~30 forms (same for all meanings)
- **Total per translation**: ~130 form_translations

**For a reciprocal translation ("plural-only" restriction)**:
- **Simple forms**: ~17 forms (only plural persons: noi, voi, loro)
- **Compound forms**: ~16 forms per auxiliary pattern (only plurals)
- **Progressive forms**: ~10 forms (only plural persons)
- **Total per translation**: ~43 form_translations

**For an impersonal translation ("solo-terza-persona-singolare")**:
- **Simple forms**: ~4 forms (only lui/lei across tenses)
- **Compound forms**: ~4 forms per auxiliary pattern
- **Progressive forms**: ~3 forms
- **Total per translation**: ~11 form_translations

#### Form_Translation Relationship Rules
- Each form_translation links to **exactly 1 translation** and **exactly 1 form**
- Coverage matrix must respect meta attribute restrictions per translation
- Missing coverage for restricted forms is expected and correct
- Over-coverage (restricted forms getting inappropriate translations) triggers validation warnings

#### Coverage Validation
The system expects:
- **Normal verbs**: Each translation covers all appropriate forms based on restrictions
- **Reciprocal verbs**: Only plural forms linked to reciprocal meanings
- **Impersonal verbs**: Only 3rd person forms linked  
- **Defective verbs**: Reduced form sets based on linguistic reality
- **Meta attribute compliance**: Form_translation coverage respects number/person restrictions

#### Assignment Quality Scoring
Each form-translation assignment includes:
- `assignment_method`: How the assignment was created (manual/automatic)
- `confidence_score`: Quality rating (0-100) for the pairing
- `restriction_compliance`: Whether assignment respects meta attribute restrictions

### 6.3 Confidence Scoring and Assignment Methods

#### Assignment Methods Implemented
- **`manual`**: Human-verified assignments (highest confidence)
- **`automatic-auxiliary`**: Generated based on auxiliary matching
- **`automatic-semantic`**: Generated using semantic similarity
- **`default`**: Fallback assignments for completeness

#### Confidence Score Factors
Scores are calculated based on:
- **Linguistic appropriateness**: Does the translation fit the form?
- **Frequency alignment**: Common forms get common translations first
- **Pedagogical value**: Learning-relevant pairings score higher
- **Contextual accuracy**: Formal forms get formal translations

#### Assignment Prioritization
Higher-confidence assignments appear first in:
- **Student interfaces**: Most relevant translation shown by default
- **Practice exercises**: Better pairings used for examples
- **Progression tracking**: High-confidence forms tested earlier

### 6.4 Translation Filtering Logic for UI

#### Display Priority System
Translations are ordered by:
1. **`display_priority`**: Explicit ordering (1 = primary, 2 = secondary, etc.)
2. **`confidence_score`**: Assignment quality for the specific form
3. **`frequency_estimate`**: How commonly this meaning is used

#### Context-Aware Filtering
The UI applies filters based on:
- **Student level**: CEFR A1 students see only basic translations
- **Form complexity**: Complex tenses show more sophisticated meanings
- **Usage patterns**: Formal forms prefer formal translations

#### Progressive Disclosure Strategy  
- **Beginner**: Single, primary translation per form
- **Intermediate**: 2-3 translations showing variety
- **Advanced**: Full translation range including subtle distinctions
- **Expert**: All available translations including rare/archaic uses

---

## 7. Database Integration Architecture

### 7.1 Translation Data Structure Architecture

The translation layer is **fundamental to understanding** how form-translation assignments work, as it bridges the gap between word meanings and their conjugated expressions through the normalized metavals system.

#### word_translations Table Structure
The `word_translations` table stores individual meanings/usages for each word:

```sql
word_translations (
  id: uuid PRIMARY KEY,
  word_id: uuid FOREIGN KEY → dictionary.id,
  translation: text,           -- English translation
  display_priority: integer,   -- Ordering for UI display (1 = primary)
  usage_notes: text,           -- Optional explanatory notes
  frequency_estimate: integer, -- Usage frequency ranking
  created_at: timestamptz
)
```

#### Critical Translation Metadata via entity_meta_values

**ALL translation metadata** is stored through the normalized entity_meta_values system. Translations do **NOT** have a `context_metadata` JSON field - this is architecturally incorrect.

**Translation Metadata Categories**:
1. **Core Required Metadata** (every translation must have):
   - `auxiliary`: `avere` or `essere` (drives compound form generation)
   - `transitivity`: `transitive`, `intransitive`, or `ambitransitive`

2. **Usage Constraint Metadata** (optional but critical for reflexive verbs):
   - `verb_type`: `reflexive` or `reciprocal` (for reflexive verbs)
   - `number_restriction`: `plural-only`, `singular-only`, `third-person-only`, `third-singular-only`

3. **Optional Descriptive Metadata**:
   - `register`: `formal`, `casual`, `neutral`, `mixed`
   - `cefr_level`: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`
   - `frequency_tier`: `top100`, `top500`, `top1000`, `top2500`, `top5000`, `top10000`

#### Translation Metadata Examples Using Real Metavals Schema

**Example 1: Normal Transitive Translation (mangiare)**
```sql
-- Translation: "to eat"
-- entity_type='word_translation', entity_id=<translation_id>
value_id → metaattr002val[ID] (auxiliary: "avere")
value_id → metaattr020val[ID] (transitivity: "transitive")
value_id → metaattr007val[ID] (frequency_tier: "top500")
value_id → metaattr003val[ID] (cefr_level: "A1")
```

**Example 2: Direct Reflexive Translation (lavarsi)**
```sql
-- Translation: "to wash oneself"
-- entity_type='word_translation', entity_id=<translation_id>
value_id → metaattr002val[ID] (auxiliary: "essere")
value_id → metaattr020val[ID] (transitivity: "intransitive")
value_id → metaattr021val[ID] (verb_type: "reflexive")
value_id → metaattr003val[ID] (cefr_level: "A2")
```

**Example 3: Reciprocal Translation (lavarsi)**
```sql
-- Translation: "to wash each other"
-- entity_type='word_translation', entity_id=<translation_id>
value_id → metaattr002val[ID] (auxiliary: "essere")
value_id → metaattr020val[ID] (transitivity: "intransitive")
value_id → metaattr021val[ID] (verb_type: "reciprocal")
value_id → metaattr013val[ID] (number_restriction: "plural-only")
value_id → metaattr003val[ID] (cefr_level: "B1")
```

**Example 4: Ambitransitive Translation (correre)**
```sql
-- Translation: "to run (single meaning usable both transitively and intransitively)"
-- entity_type='word_translation', entity_id=<translation_id>
value_id → metaattr002val[ID] (auxiliary: "avere")
value_id → metaattr020val[ID] (transitivity: "ambitransitive")
value_id → metaattr007val[ID] (frequency_tier: "top1000")
```

#### How Translation Metadata Drives Form-Translation Assignment

The entity_meta_values relationships for translations **directly control**:

1. **Auxiliary Selection**: Translation's `auxiliary` metaval determines which compound forms are generated
2. **Number Filtering**: `number_restriction` metavals filter which persons/numbers get form_translations
3. **Usage Context**: `verb_type` metavals (reflexive vs reciprocal) affect form assignment logic
4. **Display Priority**: Multiple translations with different metavals create layered meaning systems

#### Translation-to-Form Relationship Architecture

Each `form_translations` record links exactly **one translation** to exactly **one form**:

```sql
form_translations (
  id: uuid PRIMARY KEY,
  form_id: bigint FOREIGN KEY → word_forms.id,
  word_translation_id: uuid FOREIGN KEY → word_translations.id,
  translation: text,          -- Contextualized English for this specific form
  assignment_method: text,    -- "manual", "automatic-auxiliary", "automatic-semantic"
  confidence_score: numeric   -- Quality rating 0-100
)
```

**Assignment Respects Translation Metadata**:
- Forms only get linked to translations where metaval constraints match
- `plural-only` translations only link to plural forms (noi, voi, loro)
- `third-singular-only` translations only link to lui/lei forms
- `auxiliary` mismatch prevents form_translation creation

### 7.2 How word_forms Table Stores All Data

The `word_forms` table is the **central storage** for all conjugated forms:

#### Core Structure (Corrected)
```sql
word_forms (
  id: bigint PRIMARY KEY,
  word_id: uuid FOREIGN KEY → dictionary.id,
  form_text: text,           -- The actual conjugated form
  form_type: text,           -- 'conjugation' for verb forms
  phonetic_form: text,       -- Pronunciation guide
  ipa: text,                 -- International Phonetic Alphabet
  created_at: timestamptz
)
```

**CRITICAL CORRECTION**: The `word_forms` table does **NOT** contain a `tags: text[]` field. This is architecturally incorrect.

#### Normalized Tagging System via entity_meta_values
All grammatical metadata is stored in the **normalized tagging system**:

**entity_meta_values Structure**:
```sql
entity_meta_values (
  entity_type: text,         -- 'form' for word_forms
  entity_id: uuid,           -- References word_forms.id
  value_id: uuid,            -- References meta_values.id
  derived_from: text,        -- NULL for direct assignments
  propagation_source_id: uuid, -- NULL for direct assignments
  propagation_method: text   -- NULL for direct assignments
)
```

**meta_values Structure**:
```sql
meta_values (
  id: uuid PRIMARY KEY,
  value: text,               -- "indicativo", "imperfetto", etc.
  shorthand: text,           -- Short display version
  stable_id: text,           -- System identifier
  attribute_id: uuid         -- Links to meta_attributes
)
```

#### Example Metadata for "parlavo"
Instead of a tags array, the form has linked metadata entries:

```sql
-- In entity_meta_values (entity_type='form', entity_id=<parlavo_form_id>)
value_id → meta_values.value: "indicativo"    (mood)
value_id → meta_values.value: "imperfetto"    (tense)
value_id → meta_values.value: "prima-persona" (person)
value_id → meta_values.value: "singolare"     (number)
value_id → meta_values.value: "simple"        (form_type)
```

#### Example Metadata for "ho parlato"
Compound forms also use the normalized system:

```sql
-- In entity_meta_values (entity_type='form', entity_id=<ho_parlato_form_id>)
value_id → meta_values.value: "passato-prossimo" (compound tense)
value_id → meta_values.value: "prima-persona"   (person)
value_id → meta_values.value: "singolare"       (number)
value_id → meta_values.value: "compound"        (form_type)
value_id → meta_values.value: "avere-auxiliary" (auxiliary used)
```

#### Universal Terminology Compliance
All metadata values use **language-agnostic universal terms** stored in `meta_values.value`:
- `prima-persona` instead of `io`
- `singolare` instead of locale-specific terms
- `indicativo` instead of various language equivalents

This allows the same data to power interfaces in multiple languages through the normalized reference system.

### 7.3 Normalized Tagging Architecture via entity_meta_values

The system uses a **three-tier normalized metadata architecture** that replaces array-based tagging:

#### Three-Tier Architecture
1. **meta_attributes**: Defines metadata categories and rules
2. **meta_values**: Contains actual metadata values linked to attributes
3. **entity_meta_values**: Assigns metadata values to entities

#### entity_meta_values Structure (Authoritative)
```sql
entity_meta_values (
  entity_type: text,         -- 'word', 'form', 'word_translation', 'form_translation'
  entity_id: uuid,           -- References the specific record ID
  value_id: uuid,            -- References meta_values.id (not attribute_value text)
  created_at: timestamptz,
  created_by: uuid,
  derived_from: text,        -- 'form', 'translation', etc. (NULL = direct assignment)
  propagation_source_id: uuid, -- The specific child entity that caused propagation
  propagation_method: text,  -- 'ANY_MATCH', 'COMBINE', 'FIRST_WINS', etc.
  PRIMARY KEY (entity_type, entity_id, value_id)
)
```

#### Core vs Optional Metadata Categories
**Core metadata** (stored for all entities):
- **Form-level**: tense, mood, person, number, verb_form_type
- **Translation-level**: auxiliary, transitivity, usage (reflexive/reciprocal), number restrictions
- **Word-level**: conjugation_type, cefr_level, frequency_tier + reflexive status

**Optional tags** (stored selectively):
- **optional_tag_word**: Word-level descriptive tags
- **optional_tag_form**: Form-level descriptive tags  
- **optional_tag_translation**: Translation-level descriptive tags

#### Translation Tags via entity_meta_values
Translation metadata (auxiliary type + reflexive/reciprocal usage, number restrictions) are **also** stored in the normalized system:

```sql
-- Translation with reciprocal usage + number restriction
-- entity_type='word_translation', entity_id=<translation_id>
value_id → meta_values.value: "reciprocal"     (usage type)
value_id → meta_values.value: "plural-only"    (number restriction)
value_id → meta_values.value: "essere"         (auxiliary)
```

#### Benefits of Normalized Architecture
- **Storage Efficiency**: Eliminates expensive GIN indexes on arrays/JSONB
- **Referential Integrity**: Foreign key constraints maintain data consistency
- **Query Performance**: Btree indexes on UUID keys provide predictable performance
- **Extensibility**: New metadata can be added through meta_values without schema changes
- **Traceability**: Propagation fields track derived metadata sources
- **Universal Access**: Same system handles core metadata and optional tags

### 7.4 form_translations Assignment Matrix

The `form_translations` table creates the **many-to-many relationship** between forms and translations:

#### Table Structure
```sql
form_translations (
  id: uuid PRIMARY KEY,
  form_id: bigint FOREIGN KEY → word_forms.id,
  word_translation_id: uuid FOREIGN KEY → word_translations.id,
  translation: text,          -- English translation of this form
  assignment_method: text,    -- How this pairing was created
  confidence_score: numeric   -- Quality rating (0-100)
)
```

#### Assignment Matrix Logic
Each form can be assigned to multiple translations, and each translation can cover multiple forms:

**Example for `parlare`**:
- Form: `parlo` (present 1st singular)
  - Translation A: "to speak" → "I speak" (confidence: 95)
  - Translation B: "to talk" → "I talk" (confidence: 90)
  - Translation C: "to address" → "I address" (confidence: 75)

#### Coverage Completeness Tracking
The system validates that:
- **Every form** has at least one translation assignment
- **Every translation** covers appropriate forms for its meaning  
- **High-confidence assignments** exist for pedagogically important forms
- **Coverage gaps** are identified and flagged for remediation

### 7.4 Cross-table Relationship Patterns

The verb forms system involves **4 primary tables** with complex relationships:

#### Primary Relationship Chain
```
dictionary (words)
    ↓ 1:N
word_translations (meanings)
    ↓ 1:N  
word_forms (conjugated forms)
    ↓ N:N
form_translations (assignment matrix)
```

#### Auxiliary Pattern Integration
The auxiliary patterns from `/Users/Work/misti/lib/auxPatterns.ts` integrate with the database:

1. **Translation specifies auxiliary**: Via entity_meta_values `auxiliary: "avere"` or `auxiliary: "essere"`
2. **Pattern lookup**: Based on tense/person/number
3. **Building block retrieval**: Past participle/gerund from `word_forms`  
4. **Materialization process**: Auxiliary + building block = stored compound form
5. **Assignment creation**: Generated form linked to appropriate translations

#### Validation Relationship Rules
The system enforces referential integrity:

**Cross-table Validation**:
- `form_translations.form_id` must reference existing `word_forms.id`
- `form_translations.word_translation_id` must reference existing `word_translations.id`
- `word_forms.word_id` must reference existing `dictionary.id`
- `entity_meta_values.value_id` must reference existing `meta_values.id`
- `entity_meta_values.entity_id` must match valid entity IDs based on entity_type

**Auxiliary Consistency** (via normalized metadata):
- Forms with compound verb_form_type must link to translations with matching auxiliary metadata
- Translations with "reflexive" verb_type must have "essere" auxiliary metadata

**Semantic Validation**:
- Translations with "reciprocal" usage and "plural-only" restriction can only link to plural-person forms
- Verbs with "impersonal" metadata can only have forms with "terza-persona" + "singolare" metadata
- Building block forms (participles, gerunds) must exist before compound form materialization
- Metadata propagation rules are enforced through the entity_meta_values propagation fields

This comprehensive relationship system ensures data integrity while providing maximum flexibility for pedagogical and linguistic requirements.

### 7.6 Irregular Form Tagging Architecture

The Misti system uses a **bottom-up irregular tagging approach** where irregularity is identified at the form level and propagates upward to flag words as irregular.

#### Form-Level Irregular Tagging
Irregular forms are tagged individually using form-level metadata:
```sql
-- entity_type='form', entity_id=<irregular_form_id>
value_id → metaattr005val032 (irregularity: "irregular")
```

#### Propagation to Word Level
When any form of a verb is tagged as irregular, the word automatically inherits irregular status:

**Automatic Propagation Logic**:
1. **Form Analysis**: System scans all forms for irregularity markers
2. **Word-Level Propagation**: If ANY form has irregular tagging, word gets `metaattr021val[ID] (verb_type: "irregular")`
3. **Complete Coverage**: Ensures all irregular verbs are properly flagged regardless of which specific forms are irregular

#### Architectural Benefits
- **Precision**: Only actually irregular forms are tagged, not entire conjugations
- **Flexibility**: New irregular patterns can be tagged without changing word-level categories
- **Educational Value**: Students can see exactly which forms are irregular vs regular
- **Database Integrity**: Word-level irregular flags are derived from form-level evidence

This bottom-up approach ensures that irregular classification is based on actual morphological evidence rather than linguistic assumptions.

### 7.5 Word Structure and Dictionary Table Architecture

The `dictionary` table serves as the **foundational word registry** that stores core Italian verbs and their essential characteristics:

#### Dictionary Table Structure
```sql
dictionary (
  id: uuid PRIMARY KEY,
  lemma: text,              -- The infinitive form (parlare, essere, avere)
  primary_definition: text, -- Brief English definition
  gender: text,             -- NULL for verbs (used for nouns/adjectives)
  created_at: timestamptz
)
```

#### Word-Level Metavalues that Affect Form Generation

Word-level metavalues are stored via `entity_meta_values` where `entity_type='word'` and `entity_id=dictionary.id`. These metavalues fundamentally control how verb forms are generated and structured:

**Core Conjugation Metavalues**:
- `value_id → metaattr001val[ID]` (conjugation_class: "are-conjugation")
- `value_id → metaattr001val[ID]` (conjugation_class: "ere-conjugation") 
- `value_id → metaattr001val[ID]` (conjugation_class: "ire-conjugation")
- `value_id → metaattr001val[ID]` (conjugation_class: "ire-isc-conjugation")

**Behavioral Pattern Metavalues**:
- `value_id → metaattr021val[ID]` (verb_type: "modal") - Affects auxiliary selection and form compatibility
- `value_id → metaattr021val[ID]` (verb_type: "impersonal") - Restricts person/number generation
- `value_id → metaattr021val[ID]` (verb_type: "meteorological") - Limits to 3rd singular forms
- `value_id → metaattr021val[ID]` (verb_type: "defective") - Excludes certain forms from generation
- `value_id → metaattr021val[ID]` (verb_type: "reflexive") - Requires reflexive pronoun integration

**Form Restriction Metavalues**:
- `value_id → metaattr013val[ID]` (number_restriction: "third-person-only") - Limits person generation
- `value_id → metaattr013val[ID]` (number_restriction: "third-singular-only") - Most restrictive
- `value_id → metaattr013val[ID]` (number_restriction: "plural-only") - For reciprocal meanings

**Pedagogical Metavalues**:
- `value_id → metaattr003val[ID]` (cefr_level: "B1") - Affects form prioritization in learning contexts
- `value_id → metaattr007val[ID]` (frequency_tier: "top1000") - Influences form presentation order
- `value_id → metaattr018val[ID]` (register: "formal") - Affects contextual form selection

#### Metavalue Propagation from Word to Forms

The architecture includes **automatic propagation** where word-level metavalues cascade to all generated forms:

1. **Direct Propagation**: Word-level `cefr_level` and `frequency_tier` automatically apply to all forms
2. **Conditional Propagation**: `verb_type` values modify form generation rules rather than tagging forms
3. **Restriction Enforcement**: `number_restriction` values prevent creation of incompatible forms entirely

This word-level architecture ensures that every verb's complete conjugation paradigm reflects its intrinsic linguistic and pedagogical characteristics.

---

## 8. Complete Form Inventories and Critical Verb Type Examples

This section provides comprehensive form inventories showing EVERY form and form_translation for major verb categories in the Misti system. Each scenario demonstrates complete metadata structures, coverage matrices, and architectural patterns.

### Navigation:
- [8.1 Regular Verb Patterns - "mangiare"](#81-regular-verb---mangiare-to-eat)
- [8.2 Reflexive Verb Patterns - "lavarsi"](#82-reflexive-verb---lavarsi-to-wash-oneselfeach-other)
- [8.3 Dual Auxiliary Verb Patterns - "correre"](#83-dual-auxiliary-verb---correre-to-run)
- [8.4 Modal Verb Patterns - "dovere"](#84-modal-verb---dovere-to-have-to)
- [8.5 Defective Verb Patterns - "vigere"](#85-defective-verb---vigere-to-be-in-force)
- [8.6 Impersonal Verb Patterns - "importare"](#86-impersonal-verb---importare-to-matter)
- [8.7 Irregular Verb Patterns - "andare"](#87-irregular-verb---andare-to-go)

### 8.1 Regular Verb - "mangiare" (to eat)
**📋 Complete Details**: [Section 8.1: Regular Verb Patterns - "mangiare"](./verb-forms-architecture-8.1-regular-verb-patterns.md)

**Dictionary Entry**: `lemma: "mangiare", word_type: "verb"`

**Required Attribution Architecture**:
- **Word Level**: metaattr001val[ID] (conjugation_type: "are-conjugation"), metaattr003val[ID] (cefr_level: "A1"), metaattr007val[ID] (frequency_tier: "top100")
- **Translation Level**: metaattr002val[ID] (auxiliary: "avere"), metaattr020val[ID] (transitivity: "transitive")
- **Form Level**: metaattr010val[ID] (mood), metaattr019val[ID] (tense), metaattr014val[ID] (person), metaattr012val[ID] (number), metaattr022val[ID] (form_type)

**Key Architectural Pattern**: Standard are-conjugation baseline pattern with universal form coverage and single translation.
**Coverage**: 137 total forms (51 simple, 49 compound, 37 progressive)

---

### 8.2 Reflexive Verb - "lavarsi" (to wash oneself/each other)
**📋 Complete Details**: [Section 8.2: Reflexive Verb Patterns - "lavarsi"](./verb-forms-architecture-8.2-reflexive-verb-patterns.md)

**Dictionary Entry**: `lemma: "lavarsi", word_type: "verb"`

**Required Attribution Architecture**:
- **Word Level**: metaattr001val[ID] (conjugation_type: "are-conjugation"), metaattr021val[ID] (verb_type: "reflexive"), metaattr003val[ID] (cefr_level: "A2")
- **Translation Level**: metaattr002val[ID] (auxiliary: "essere"), metaattr021val[ID] (verb_type: "reflexive"/"reciprocal"), metaattr013val[ID] (number_restriction: "plural-only" for reciprocal)
- **Form Level**: Standard form metadata plus reflexive clitic integration

**Key Architectural Pattern**: Direct-reflexive pattern with dual translations - universal reflexive meaning plus plural-restricted reciprocal meaning.
**Coverage**: 182 total form_translations (137 reflexive + 45 reciprocal)

---

### 8.3 Dual Auxiliary Verb - "correre" (to run)
**📋 Complete Details**: [Section 8.3: Dual Auxiliary Verb Patterns - "correre"](./verb-forms-architecture-8.3-dual-auxiliary-verb-patterns.md)

**Dictionary Entry**: `lemma: "correre", word_type: "verb"`

**Required Attribution Architecture**:
- **Word Level**: metaattr001val[ID] (conjugation_type: "ere-conjugation"), metaattr003val[ID] (cefr_level: "B1"), metaattr007val[ID] (frequency_tier: "top500")
- **Translation Level**: metaattr002val[ID] (auxiliary: "avere"/"essere"), metaattr020val[ID] (transitivity: "transitive"/"intransitive")
- **Form Level**: Standard form metadata with shared simple/progressive forms across translations

**Key Architectural Pattern**: Dual-auxiliary pattern where meaning determines auxiliary selection - shared forms with different auxiliary assignments.
**Coverage**: 274 total form_translations (186 distinct forms with dual auxiliary assignments)

---

### 8.4 Modal Verb - "dovere" (to have to)
**📋 Complete Details**: [Section 8.4: Modal Verb Patterns - "dovere"](./verb-forms-architecture-8.4-modal-verb-patterns.md)

**Dictionary Entry**: `lemma: "dovere", word_type: "verb"`

**Required Attribution Architecture**:
- **Word Level**: metaattr001val[ID] (conjugation_type: "ere-conjugation"), metaattr021val[ID] (verb_type: "modal"), metaattr003val[ID] (cefr_level: "A1")
- **Translation Level**: metaattr002val[ID] (auxiliary: "avere"), metaattr021val[ID] (verb_type: "modal")
- **Form Level**: Standard form metadata with modal auxiliary inheritance behavior

**Key Architectural Pattern**: Modal-verb pattern with dual semantics and auxiliary inheritance - standalone uses "avere", modal+infinitive inherits auxiliary from dependent verb.
**Coverage**: 274 total form_translations (137 forms × 2 meanings)

---

### 8.5 Defective Verb - "vigere" (to be in force)
**📋 Complete Details**: [Section 8.5: Defective Verb Patterns - "vigere"](./verb-forms-architecture-8.5-defective-verb-patterns.md)

**Dictionary Entry**: `lemma: "vigere", word_type: "verb"`

**Required Attribution Architecture**:
- **Word Level**: metaattr001val[ID] (conjugation_type: "ere-conjugation"), metaattr021val[ID] (verb_type: "defective"), metaattr013val[ID] (number_restriction: "third-person-only")
- **Translation Level**: metaattr002val[ID] (auxiliary: "essere"), metaattr018val[ID] (register: "formal")
- **Form Level**: Standard form metadata with semantic restrictions preventing 1st/2nd person forms

**Key Architectural Pattern**: Defective-verb pattern with semantic constraints limiting forms to 3rd person only - laws/rules cannot "be in force" for specific people.
**Coverage**: 67 total forms (49.6% of standard paradigm - semantically restricted)

---

### 8.6 Impersonal Verb - "importare" (to matter)
**📋 Complete Details**: [Section 8.6: Impersonal Verb Patterns - "importare"](./verb-forms-architecture-8.6-impersonal-verb-patterns.md)

**Dictionary Entry**: `lemma: "importare", word_type: "verb"`

**Required Attribution Architecture**:
- **Word Level**: metaattr001val[ID] (conjugation_type: "are-conjugation"), metaattr021val[ID] (verb_type: "impersonal"), metaattr003val[ID] (cefr_level: "B1")
- **Translation Level**: metaattr002val[ID] (auxiliary: "essere"/"avere"), metaattr013val[ID] (number_restriction: "third-person-only" for impersonal), metaattr020val[ID] (transitivity: "transitive" for import)
- **Form Level**: Standard form metadata with selective translation coverage based on semantic appropriateness

**Key Architectural Pattern**: Impersonal-verb pattern with dual semantics - "to matter" (3rd person only) vs "to import" (all persons) using different auxiliaries.
**Coverage**: 162 total form_translations (25 impersonal + 137 transitive)

---

### 8.7 Irregular Verb - "andare" (to go)
**📋 Complete Details**: [Section 8.7: Irregular Verb Patterns - "andare"](./verb-forms-architecture-8.7-irregular-verb-patterns.md)

**Dictionary Entry**: `lemma: "andare", word_type: "verb"`

**Required Attribution Architecture**:
- **Word Level**: metaattr001val[ID] (conjugation_type: "ere-conjugation"), metaattr021val[ID] (verb_type: "irregular"), metaattr003val[ID] (cefr_level: "A1")
- **Translation Level**: metaattr002val[ID] (auxiliary: "essere"), metaattr020val[ID] (transitivity: "intransitive")
- **Form Level**: Standard form metadata plus irregularity markers for irregular forms

**Key Architectural Pattern**: Irregular-verb pattern with multiple stems and unpredictable changes - materialized forms rather than rule-based generation.
**Coverage**: 137 total forms (complete irregular paradigm with stem alternations)

---
## Updated Coverage Calculations Summary

### Complete Form_Translation Coverage Matrix

| Verb Pattern | Example | Total Forms | Translation 1 Coverage | Translation 2 Coverage | Total Form_Translations |
|--------------|---------|-------------|----------------------|----------------------|----------------------|
| Regular | mangiare | 137 | 137 (all forms) | - | 137 |
| Reflexive | lavarsi | 137 | 137 (all forms) | 45 (plural only) | 182 |
| Dual Auxiliary | correre | 186 | 137 (all forms) | 137 (all forms) | 274 |
| Modal | dovere | 137** | 137 (all standard forms) | 137 (all standard forms) | 274 |
| Defective | vigere | 67 | 67 (existing forms only) | - | 67 |
| Impersonal | importare | 137 | 25 (3rd person only) | 137 (all forms) | 162 |
| Irregular | andare | 137 | 137 (all forms) | - | 137 |

**Mathematical Explanations:**
- *Dual Auxiliary Corrected: correre has 186 total forms (51 simple + 49 compound with avere + 49 compound with essere + 37 progressive). Dual auxiliary creates additional compound forms with both avere and essere auxiliaries.
- **Modal Corrected: Only standard 137 forms stored in database. Modal constructions (dovere + infinitive) are frontend-generated, NOT stored as separate forms.

### Meta Attribute Integration Patterns

| Verb Pattern | Behavioral Pattern (verb_type) | Grammatical Property (transitivity) | Additional Restrictions | Storage Location |
|--------------|----------------------|---------------------|----------------------|-----------------|
| Regular | None | Derived from translations | None | entity_meta_values |
| Reflexive | metaattr021val[ID] (verb_type: "reflexive") | Derived from translations (intransitive) | metaattr021val[ID] (verb_type: "reflexive"/"reciprocal") | entity_meta_values |
| Dual Auxiliary | None (derived from translations) | Derived from translations (mixed) | Translation auxiliaries differ | entity_meta_values |
| Modal | metaattr021val[ID] (verb_type: "modal") | Derived from translations | None (modal behavior is frontend-handled) | entity_meta_values |
| Defective | metaattr021val[ID] (verb_type: "defective") | Derived from translations | metaattr013val[ID] (number_restriction: "third-person-only") | entity_meta_values |
| Impersonal | metaattr021val[ID] (verb_type: "impersonal") | Derived from translations (mixed) | metaattr013val[ID] (number_restriction: "third-person-only") | entity_meta_values |
| Irregular | metaattr021val[ID] (verb_type: "irregular") | Derived from translations (intransitive) | Form-level irregularity markers | entity_meta_values |
