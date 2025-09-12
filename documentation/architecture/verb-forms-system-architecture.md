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

### 2.2 Complete Mood/Tense Matrix from epicRequiredForms

The system defines **26 essential form categories** that every verb should potentially have:

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

### 2.3 Frequency/CEFR Classification System

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

#### direct-reflexive
- **Purpose**: Marks verbs that require reflexive pronouns and dual translation system
- **Examples**: lavarsi (to wash oneself/each other), alzarsi (to get up/help each other up)
- **Impact**: Forms include inherent clitics (mi lavo, ti lavi, si lava) with both direct reflexive and reciprocal meanings
- **Required Translations**: Every reflexive verb must have both direct reflexive and reciprocal translations

#### modal-verb  
- **Purpose**: Identifies modal auxiliaries
- **Examples**: potere (can), dovere (must), volere (want)
- **Impact**: Can take infinitive complements, auxiliary selection varies

#### impersonal-verb
- **Purpose**: Verbs that only occur in 3rd person
- **Examples**: bisognare (to be necessary), importare (to matter)
- **Impact**: Only 3rd person forms are materialized

#### meteorological-verb
- **Purpose**: Atmospheric/meteorological verbs
- **Examples**: piovere (to rain), nevicare (to snow)  
- **Impact**: Typically impersonal, uses essere auxiliary

#### defective-verb
- **Purpose**: Verbs missing certain forms
- **Examples**: solere (to be accustomed), vigere (to be in force)
- **Impact**: Only forms that actually exist are materialized

---

## 3. Complete Mood & Tense Architecture

### 3.1 All 7 Moods with Their Tenses Explained

#### Indicativo (Indicative Mood)
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

#### Congiuntivo (Subjunctive Mood)
The subjunctive expresses subjectivity, doubt, emotion, and hypothetical situations.

**Simple Tenses**:
- `congiuntivo-presente` - Present subjectivity (che io parli = that I speak)
- `congiuntivo-imperfetto` - Past subjectivity (che io parlassi = that I spoke)

**Compound Tenses**:
- `congiuntivo-passato` - Perfect subjectivity (che io abbia parlato = that I have spoken)
- `congiuntivo-trapassato` - Pluperfect subjectivity (che io avessi parlato = that I had spoken)

**Progressive Tenses**:
- `congiuntivo-presente-progressivo` - Ongoing subjunctive (che io stia parlando = that I am speaking)

#### Condizionale (Conditional Mood)
The conditional expresses hypothetical situations, polite requests, and uncertain information.

**Simple Tenses**:
- `condizionale-presente` - Present hypothetical (io parlerei = I would speak)

**Compound Tenses**:
- `condizionale-passato` - Past hypothetical (avrei parlato = I would have spoken)

**Progressive Tenses**:
- `condizionale-presente-progressivo` - Ongoing hypothetical (starei parlando = I would be speaking)

#### Imperativo (Imperative Mood)
The imperative expresses commands, requests, and instructions.

**Simple Tenses**:
- `imperativo-presente` - Present command (parla! = speak!)

**Compound Tenses**:
- `imperativo-passato` - Perfect command (abbi parlato! = have spoken! - rare)

#### Infinito (Infinitive Mood)
The infinitive provides the basic, unconjugated verb form.

**Simple Tenses**:
- `infinito-presente` - Present infinitive (parlare = to speak)

**Compound Tenses**:
- `infinito-passato` - Perfect infinitive (aver parlato = to have spoken)

#### Participio (Participle Mood)
Participles function as adjectives and building blocks for compound tenses.

**Simple Tenses**:
- `participio-presente` - Present participle (parlante = speaking)
- `participio-passato` - Past participle (parlato = spoken)

#### Gerundio (Gerund Mood)
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
- **Tags**: Stored in `entity_meta_values` table with progressive tense, person, number, `progressive`, `stare-auxiliary` references

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
Each entry in `word_translations` contains `context_metadata.auxiliary` specifying:
- `"avere"` - For transitive actions and direct objects
- `"essere"` - For intransitive actions, motion, state changes

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
The system validates auxiliary assignment against transitivity:
- `context_metadata.transitivity: "transitive"` should use `auxiliary: "avere"`
- `context_metadata.transitivity: "intransitive"` should use `auxiliary: "essere"`
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

### 4.3 Translation-level Auxiliary Assignments

The auxiliary assignment architecture works as follows:

#### Assignment Location
```
word_translations.context_metadata.auxiliary: "avere" | "essere"
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
4. Reflexive verbs (`usage: "direct-reflexive"`) must use `"essere"`

### 4.4 Progressive Tense Patterns (stare usage)

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
4. Tag with `progressive` and `stare-auxiliary`

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
Reciprocal translations are marked with:
```
context_metadata: {
  usage: "reciprocal",
  plurality: "plural-only"
}
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
- Tag as `defective-verb` at word level
- Only materialize forms that linguistically exist
- Validation system expects fewer forms for defective verbs

### 5.3 Impersonal/Weather Verbs

#### Impersonal Verb Classification
- **Marker**: `impersonal-verb` and/or `meteorological-verb` tags
- **Constraint**: Only 3rd person singular forms are valid
- **Examples**: bisognare, importare, piovere, nevicare

#### Form Materialization Strategy
- **Skip**: 1st/2nd person forms (io, tu, noi, voi)
- **Include**: Only `terza-persona singolare` forms
- **Auxiliary**: Typically essere (meteorological phenomena)

#### Weather Verb Extensions
Some weather verbs can metaphorically use other persons:
- `piovere` literally: "piove" (it rains)
- `piovere` metaphorically: "piovono critiche" (criticisms rain down)

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
1. **Direct Reflexive Translation**: `usage: "direct-reflexive"`, covers all persons (io, tu, lui/lei, noi, voi, loro)
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
- **"solo-plurale" restriction**: Translations marked with plural-only constraints (like reciprocals) only receive form_translations for plural forms
- **"solo-singolare" restriction**: Translations with singular-only constraints only get singular form_translations
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

**For a reciprocal translation ("solo-plurale" restriction)**:
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

### 7.1 How word_forms Table Stores All Data

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

### 7.2 Normalized Tagging Architecture via entity_meta_values

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
- **Translation-level**: auxiliary, transitivity, usage (direct-reflexive/reciprocal), number restrictions
- **Word-level**: conjugation_type, cefr_level, frequency_tier, reflexive status

**Optional tags** (stored selectively):
- **optional_tag_word**: Word-level descriptive tags
- **optional_tag_form**: Form-level descriptive tags  
- **optional_tag_translation**: Translation-level descriptive tags

#### Translation Tags via entity_meta_values
Translation metadata (auxiliary type, reflexive/reciprocal usage, number restrictions) are **also** stored in the normalized system:

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

### 7.3 form_translations Assignment Matrix

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

1. **Translation specifies auxiliary**: `context_metadata.auxiliary: "avere"`
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
- Forms with "avere-auxiliary" metadata must link to translations with "avere" auxiliary metadata
- Forms with "essere-auxiliary" metadata must link to translations with "essere" auxiliary metadata  
- Translations with "direct-reflexive" usage must have "essere" auxiliary metadata

**Semantic Validation**:
- Translations with "reciprocal" usage and "plural-only" restriction can only link to plural-person forms
- Verbs with "impersonal-verb" metadata can only have forms with "terza-persona" + "singolare" metadata
- Building block forms (participles, gerunds) must exist before compound form materialization
- Metadata propagation rules are enforced through the entity_meta_values propagation fields

This comprehensive relationship system ensures data integrity while providing maximum flexibility for pedagogical and linguistic requirements.

---

## 8. Complete Form Inventories and Critical Verb Type Examples

This section provides comprehensive form inventories showing EVERY form and form_translation for major verb categories in the Misti system. Each scenario demonstrates complete metadata structures, coverage matrices, and architectural patterns.

### Scenario A: Normal Verb - "mangiare" (to eat) - Complete Form Inventory

#### Dictionary Entry
```sql
-- dictionary table
id: 550e8400-e29b-41d4-a716-446655440000
lemma: "mangiare"
word_type: "verb"
```

#### Word-Level Metadata (via entity_meta_values)
```sql
-- entity_type='word', entity_id=550e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "are-conjugation"    (conjugation_type)
value_id → meta_values.value: "freq-top100"        (frequency_tier)
value_id → meta_values.value: "CEFR-A1"            (cefr_level)
value_id → meta_values.value: "transitive"         (primary_transitivity)
```

#### Translation: "to eat" (primary meaning)
```sql
-- word_translations table
id: 660e8400-e29b-41d4-a716-446655440001
word_id: 550e8400-e29b-41d4-a716-446655440000
translation: "to eat"
display_priority: 1
context_metadata: {
  "auxiliary": "avere",
  "transitivity": "transitive"
}
```

#### Complete Form Inventory (137 Total Forms)

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|---------------------|
| 001 | mangio | indicativo | presente | prima-persona | singolare | simple | presente, simple | I eat |
| 002 | mangi | indicativo | presente | seconda-persona | singolare | simple | presente, simple | you eat |
| 003 | mangia | indicativo | presente | terza-persona | singolare | simple | presente, simple | he/she eats |
| 004 | mangiamo | indicativo | presente | prima-persona | plurale | simple | presente, simple | we eat |
| 005 | mangiate | indicativo | presente | seconda-persona | plurale | simple | presente, simple | you eat |
| 006 | mangiano | indicativo | presente | terza-persona | plurale | simple | presente, simple | they eat |
| 007 | mangiavo | indicativo | imperfetto | prima-persona | singolare | simple | imperfetto, simple | I was eating |
| 008 | mangiavi | indicativo | imperfetto | seconda-persona | singolare | simple | imperfetto, simple | you were eating |
| 009 | mangiava | indicativo | imperfetto | terza-persona | singolare | simple | imperfetto, simple | he/she was eating |
| 010 | mangiavamo | indicativo | imperfetto | prima-persona | plurale | simple | imperfetto, simple | we were eating |
| 011 | mangiavate | indicativo | imperfetto | seconda-persona | plurale | simple | imperfetto, simple | you were eating |
| 012 | mangiavano | indicativo | imperfetto | terza-persona | plurale | simple | imperfetto, simple | they were eating |
| 013 | mangiai | indicativo | passato-remoto | prima-persona | singolare | simple | passato-remoto, simple | I ate |
| 014 | mangiasti | indicativo | passato-remoto | seconda-persona | singolare | simple | passato-remoto, simple | you ate |
| 015 | mangiò | indicativo | passato-remoto | terza-persona | singolare | simple | passato-remoto, simple | he/she ate |
| 016 | mangiammo | indicativo | passato-remoto | prima-persona | plurale | simple | passato-remoto, simple | we ate |
| 017 | mangiaste | indicativo | passato-remoto | seconda-persona | plurale | simple | passato-remoto, simple | you ate |
| 018 | mangiarono | indicativo | passato-remoto | terza-persona | plurale | simple | passato-remoto, simple | they ate |
| 019 | mangerò | indicativo | futuro-semplice | prima-persona | singolare | simple | futuro-semplice, simple | I will eat |
| 020 | mangerai | indicativo | futuro-semplice | seconda-persona | singolare | simple | futuro-semplice, simple | you will eat |
| 021 | mangerà | indicativo | futuro-semplice | terza-persona | singolare | simple | futuro-semplice, simple | he/she will eat |
| 022 | mangeremo | indicativo | futuro-semplice | prima-persona | plurale | simple | futuro-semplice, simple | we will eat |
| 023 | mangerete | indicativo | futuro-semplice | seconda-persona | plurale | simple | futuro-semplice, simple | you will eat |
| 024 | mangeranno | indicativo | futuro-semplice | terza-persona | plurale | simple | futuro-semplice, simple | they will eat |
| 025 | mangi | congiuntivo | congiuntivo-presente | prima-persona | singolare | simple | congiuntivo-presente, simple | (that) I eat |
| 026 | mangi | congiuntivo | congiuntivo-presente | seconda-persona | singolare | simple | congiuntivo-presente, simple | (that) you eat |
| 027 | mangi | congiuntivo | congiuntivo-presente | terza-persona | singolare | simple | congiuntivo-presente, simple | (that) he/she eats |
| 028 | mangiamo | congiuntivo | congiuntivo-presente | prima-persona | plurale | simple | congiuntivo-presente, simple | (that) we eat |
| 029 | mangiate | congiuntivo | congiuntivo-presente | seconda-persona | plurale | simple | congiuntivo-presente, simple | (that) you eat |
| 030 | mangino | congiuntivo | congiuntivo-presente | terza-persona | plurale | simple | congiuntivo-presente, simple | (that) they eat |
| 031 | mangiassi | congiuntivo | congiuntivo-imperfetto | prima-persona | singolare | simple | congiuntivo-imperfetto, simple | (that) I ate |
| 032 | mangiassi | congiuntivo | congiuntivo-imperfetto | seconda-persona | singolare | simple | congiuntivo-imperfetto, simple | (that) you ate |
| 033 | mangiasse | congiuntivo | congiuntivo-imperfetto | terza-persona | singolare | simple | congiuntivo-imperfetto, simple | (that) he/she ate |
| 034 | mangiassimo | congiuntivo | congiuntivo-imperfetto | prima-persona | plurale | simple | congiuntivo-imperfetto, simple | (that) we ate |
| 035 | mangiaste | congiuntivo | congiuntivo-imperfetto | seconda-persona | plurale | simple | congiuntivo-imperfetto, simple | (that) you ate |
| 036 | mangiassero | congiuntivo | congiuntivo-imperfetto | terza-persona | plurale | simple | congiuntivo-imperfetto, simple | (that) they ate |
| 037 | mangerei | condizionale | condizionale-presente | prima-persona | singolare | simple | condizionale-presente, simple | I would eat |
| 038 | mangeresti | condizionale | condizionale-presente | seconda-persona | singolare | simple | condizionale-presente, simple | you would eat |
| 039 | mangerebbe | condizionale | condizionale-presente | terza-persona | singolare | simple | condizionale-presente, simple | he/she would eat |
| 040 | mangeremmo | condizionale | condizionale-presente | prima-persona | plurale | simple | condizionale-presente, simple | we would eat |
| 041 | mangereste | condizionale | condizionale-presente | seconda-persona | plurale | simple | condizionale-presente, simple | you would eat |
| 042 | mangerebbero | condizionale | condizionale-presente | terza-persona | plurale | simple | condizionale-presente, simple | they would eat |
| 043 | mangia | imperativo | imperativo-presente | seconda-persona | singolare | simple | imperativo-presente, simple | eat! |
| 044 | mangi | imperativo | imperativo-presente | terza-persona | singolare | simple | imperativo-presente, simple | let him/her eat! |
| 045 | mangiamo | imperativo | imperativo-presente | prima-persona | plurale | simple | imperativo-presente, simple | let's eat! |
| 046 | mangiate | imperativo | imperativo-presente | seconda-persona | plurale | simple | imperativo-presente, simple | eat! |
| 047 | mangino | imperativo | imperativo-presente | terza-persona | plurale | simple | imperativo-presente, simple | let them eat! |
| 048 | mangiare | infinito | infinito-presente | - | - | simple | infinito-presente, simple | to eat |
| 049 | mangiante | participio | participio-presente | - | - | simple | participio-presente, simple | eating |
| 050 | mangiato | participio | participio-passato | - | - | simple | participio-passato, simple | eaten |
| 051 | mangiando | gerundio | gerundio-presente | - | - | simple | gerundio-presente, simple | eating |

**Compound Forms with avere auxiliary (49 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|---------------------|
| 052 | ho mangiato | indicativo | passato-prossimo | prima-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | I have eaten |
| 053 | hai mangiato | indicativo | passato-prossimo | seconda-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | you have eaten |
| 054 | ha mangiato | indicativo | passato-prossimo | terza-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | he/she has eaten |
| 055 | abbiamo mangiato | indicativo | passato-prossimo | prima-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | we have eaten |
| 056 | avete mangiato | indicativo | passato-prossimo | seconda-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | you have eaten |
| 057 | hanno mangiato | indicativo | passato-prossimo | terza-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | they have eaten |
| 058 | avevo mangiato | indicativo | trapassato-prossimo | prima-persona | singolare | compound | trapassato-prossimo, compound, avere-auxiliary | I had eaten |
| 059 | avevi mangiato | indicativo | trapassato-prossimo | seconda-persona | singolare | compound | trapassato-prossimo, compound, avere-auxiliary | you had eaten |
| 060 | aveva mangiato | indicativo | trapassato-prossimo | terza-persona | singolare | compound | trapassato-prossimo, compound, avere-auxiliary | he/she had eaten |
| 061 | avevamo mangiato | indicativo | trapassato-prossimo | prima-persona | plurale | compound | trapassato-prossimo, compound, avere-auxiliary | we had eaten |
| 062 | avevate mangiato | indicativo | trapassato-prossimo | seconda-persona | plurale | compound | trapassato-prossimo, compound, avere-auxiliary | you had eaten |
| 063 | avevano mangiato | indicativo | trapassato-prossimo | terza-persona | plurale | compound | trapassato-prossimo, compound, avere-auxiliary | they had eaten |
| 064 | ebbi mangiato | indicativo | trapassato-remoto | prima-persona | singolare | compound | trapassato-remoto, compound, avere-auxiliary | I had eaten |
| 065 | avesti mangiato | indicativo | trapassato-remoto | seconda-persona | singolare | compound | trapassato-remoto, compound, avere-auxiliary | you had eaten |
| 066 | ebbe mangiato | indicativo | trapassato-remoto | terza-persona | singolare | compound | trapassato-remoto, compound, avere-auxiliary | he/she had eaten |
| 067 | avemmo mangiato | indicativo | trapassato-remoto | prima-persona | plurale | compound | trapassato-remoto, compound, avere-auxiliary | we had eaten |
| 068 | aveste mangiato | indicativo | trapassato-remoto | seconda-persona | plurale | compound | trapassato-remoto, compound, avere-auxiliary | you had eaten |
| 069 | ebbero mangiato | indicativo | trapassato-remoto | terza-persona | plurale | compound | trapassato-remoto, compound, avere-auxiliary | they had eaten |
| 070 | avrò mangiato | indicativo | futuro-anteriore | prima-persona | singolare | compound | futuro-anteriore, compound, avere-auxiliary | I will have eaten |
| 071 | avrai mangiato | indicativo | futuro-anteriore | seconda-persona | singolare | compound | futuro-anteriore, compound, avere-auxiliary | you will have eaten |
| 072 | avrà mangiato | indicativo | futuro-anteriore | terza-persona | singolare | compound | futuro-anteriore, compound, avere-auxiliary | he/she will have eaten |
| 073 | avremo mangiato | indicativo | futuro-anteriore | prima-persona | plurale | compound | futuro-anteriore, compound, avere-auxiliary | we will have eaten |
| 074 | avrete mangiato | indicativo | futuro-anteriore | seconda-persona | plurale | compound | futuro-anteriore, compound, avere-auxiliary | you will have eaten |
| 075 | avranno mangiato | indicativo | futuro-anteriore | terza-persona | plurale | compound | futuro-anteriore, compound, avere-auxiliary | they will have eaten |
| 076 | abbia mangiato | congiuntivo | congiuntivo-passato | prima-persona | singolare | compound | congiuntivo-passato, compound, avere-auxiliary | (that) I have eaten |
| 077 | abbia mangiato | congiuntivo | congiuntivo-passato | seconda-persona | singolare | compound | congiuntivo-passato, compound, avere-auxiliary | (that) you have eaten |
| 078 | abbia mangiato | congiuntivo | congiuntivo-passato | terza-persona | singolare | compound | congiuntivo-passato, compound, avere-auxiliary | (that) he/she has eaten |
| 079 | abbiamo mangiato | congiuntivo | congiuntivo-passato | prima-persona | plurale | compound | congiuntivo-passato, compound, avere-auxiliary | (that) we have eaten |
| 080 | abbiate mangiato | congiuntivo | congiuntivo-passato | seconda-persona | plurale | compound | congiuntivo-passato, compound, avere-auxiliary | (that) you have eaten |
| 081 | abbiano mangiato | congiuntivo | congiuntivo-passato | terza-persona | plurale | compound | congiuntivo-passato, compound, avere-auxiliary | (that) they have eaten |
| 082 | avessi mangiato | congiuntivo | congiuntivo-trapassato | prima-persona | singolare | compound | congiuntivo-trapassato, compound, avere-auxiliary | (that) I had eaten |
| 083 | avessi mangiato | congiuntivo | congiuntivo-trapassato | seconda-persona | singolare | compound | congiuntivo-trapassato, compound, avere-auxiliary | (that) you had eaten |
| 084 | avesse mangiato | congiuntivo | congiuntivo-trapassato | terza-persona | singolare | compound | congiuntivo-trapassato, compound, avere-auxiliary | (that) he/she had eaten |
| 085 | avessimo mangiato | congiuntivo | congiuntivo-trapassato | prima-persona | plurale | compound | congiuntivo-trapassato, compound, avere-auxiliary | (that) we had eaten |
| 086 | aveste mangiato | congiuntivo | congiuntivo-trapassato | seconda-persona | plurale | compound | congiuntivo-trapassato, compound, avere-auxiliary | (that) you had eaten |
| 087 | avessero mangiato | congiuntivo | congiuntivo-trapassato | terza-persona | plurale | compound | congiuntivo-trapassato, compound, avere-auxiliary | (that) they had eaten |
| 088 | avrei mangiato | condizionale | condizionale-passato | prima-persona | singolare | compound | condizionale-passato, compound, avere-auxiliary | I would have eaten |
| 089 | avresti mangiato | condizionale | condizionale-passato | seconda-persona | singolare | compound | condizionale-passato, compound, avere-auxiliary | you would have eaten |
| 090 | avrebbe mangiato | condizionale | condizionale-passato | terza-persona | singolare | compound | condizionale-passato, compound, avere-auxiliary | he/she would have eaten |
| 091 | avremmo mangiato | condizionale | condizionale-passato | prima-persona | plurale | compound | condizionale-passato, compound, avere-auxiliary | we would have eaten |
| 092 | avreste mangiato | condizionale | condizionale-passato | seconda-persona | plurale | compound | condizionale-passato, compound, avere-auxiliary | you would have eaten |
| 093 | avrebbero mangiato | condizionale | condizionale-passato | terza-persona | plurale | compound | condizionale-passato, compound, avere-auxiliary | they would have eaten |
| 094 | abbi mangiato | imperativo | imperativo-passato | seconda-persona | singolare | compound | imperativo-passato, compound, avere-auxiliary | have eaten! |
| 095 | abbia mangiato | imperativo | imperativo-passato | terza-persona | singolare | compound | imperativo-passato, compound, avere-auxiliary | let him/her have eaten! |
| 096 | abbiamo mangiato | imperativo | imperativo-passato | prima-persona | plurale | compound | imperativo-passato, compound, avere-auxiliary | let's have eaten! |
| 097 | abbiate mangiato | imperativo | imperativo-passato | seconda-persona | plurale | compound | imperativo-passato, compound, avere-auxiliary | have eaten! |
| 098 | abbiano mangiato | imperativo | imperativo-passato | terza-persona | plurale | compound | imperativo-passato, compound, avere-auxiliary | let them have eaten! |
| 099 | avendo mangiato | gerundio | gerundio-passato | - | - | compound | gerundio-passato, compound, avere-auxiliary | having eaten |
| 100 | aver mangiato | infinito | infinito-passato | - | - | compound | infinito-passato, compound, avere-auxiliary | to have eaten |

**Progressive Forms with stare auxiliary (35 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|---------------------|
| 101 | sto mangiando | indicativo | presente-progressivo | prima-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | I am eating |
| 102 | stai mangiando | indicativo | presente-progressivo | seconda-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | you are eating |
| 103 | sta mangiando | indicativo | presente-progressivo | terza-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | he/she is eating |
| 104 | stiamo mangiando | indicativo | presente-progressivo | prima-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary | we are eating |
| 105 | state mangiando | indicativo | presente-progressivo | seconda-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary | you are eating |
| 106 | stanno mangiando | indicativo | presente-progressivo | terza-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary | they are eating |
| 107 | stavo mangiando | indicativo | passato-progressivo | prima-persona | singolare | progressive | passato-progressivo, progressive, stare-auxiliary | I was eating |
| 108 | stavi mangiando | indicativo | passato-progressivo | seconda-persona | singolare | progressive | passato-progressivo, progressive, stare-auxiliary | you were eating |
| 109 | stava mangiando | indicativo | passato-progressivo | terza-persona | singolare | progressive | passato-progressivo, progressive, stare-auxiliary | he/she was eating |
| 110 | stavamo mangiando | indicativo | passato-progressivo | prima-persona | plurale | progressive | passato-progressivo, progressive, stare-auxiliary | we were eating |
| 111 | stavate mangiando | indicativo | passato-progressivo | seconda-persona | plurale | progressive | passato-progressivo, progressive, stare-auxiliary | you were eating |
| 112 | stavano mangiando | indicativo | passato-progressivo | terza-persona | plurale | progressive | passato-progressivo, progressive, stare-auxiliary | they were eating |
| 113 | starò mangiando | indicativo | futuro-progressivo | prima-persona | singolare | progressive | futuro-progressivo, progressive, stare-auxiliary | I will be eating |
| 114 | starai mangiando | indicativo | futuro-progressivo | seconda-persona | singolare | progressive | futuro-progressivo, progressive, stare-auxiliary | you will be eating |
| 115 | starà mangiando | indicativo | futuro-progressivo | terza-persona | singolare | progressive | futuro-progressivo, progressive, stare-auxiliary | he/she will be eating |
| 116 | staremo mangiando | indicativo | futuro-progressivo | prima-persona | plurale | progressive | futuro-progressivo, progressive, stare-auxiliary | we will be eating |
| 117 | starete mangiando | indicativo | futuro-progressivo | seconda-persona | plurale | progressive | futuro-progressivo, progressive, stare-auxiliary | you will be eating |
| 118 | staranno mangiando | indicativo | futuro-progressivo | terza-persona | plurale | progressive | futuro-progressivo, progressive, stare-auxiliary | they will be eating |
| 119 | stia mangiando | congiuntivo | congiuntivo-presente-progressivo | prima-persona | singolare | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary | (that) I be eating |
| 120 | stia mangiando | congiuntivo | congiuntivo-presente-progressivo | seconda-persona | singolare | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary | (that) you be eating |
| 121 | stia mangiando | congiuntivo | congiuntivo-presente-progressivo | terza-persona | singolare | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary | (that) he/she be eating |
| 122 | stiamo mangiando | congiuntivo | congiuntivo-presente-progressivo | prima-persona | plurale | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary | (that) we be eating |
| 123 | stiate mangiando | congiuntivo | congiuntivo-presente-progressivo | seconda-persona | plurale | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary | (that) you be eating |
| 124 | stiano mangiando | congiuntivo | congiuntivo-presente-progressivo | terza-persona | plurale | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary | (that) they be eating |
| 125 | stessi mangiando | congiuntivo | congiuntivo-imperfetto-progressivo | prima-persona | singolare | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary | (that) I were eating |
| 126 | stessi mangiando | congiuntivo | congiuntivo-imperfetto-progressivo | seconda-persona | singolare | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary | (that) you were eating |
| 127 | stesse mangiando | congiuntivo | congiuntivo-imperfetto-progressivo | terza-persona | singolare | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary | (that) he/she were eating |
| 128 | stessimo mangiando | congiuntivo | congiuntivo-imperfetto-progressivo | prima-persona | plurale | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary | (that) we were eating |
| 129 | steste mangiando | congiuntivo | congiuntivo-imperfetto-progressivo | seconda-persona | plurale | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary | (that) you were eating |
| 130 | stessero mangiando | congiuntivo | congiuntivo-imperfetto-progressivo | terza-persona | plurale | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary | (that) they were eating |
| 131 | starei mangiando | condizionale | condizionale-progressivo | prima-persona | singolare | progressive | condizionale-progressivo, progressive, stare-auxiliary | I would be eating |
| 132 | staresti mangiando | condizionale | condizionale-progressivo | seconda-persona | singolare | progressive | condizionale-progressivo, progressive, stare-auxiliary | you would be eating |
| 133 | starebbe mangiando | condizionale | condizionale-progressivo | terza-persona | singolare | progressive | condizionale-progressivo, progressive, stare-auxiliary | he/she would be eating |
| 134 | staremmo mangiando | condizionale | condizionale-progressivo | prima-persona | plurale | progressive | condizionale-progressivo, progressive, stare-auxiliary | we would be eating |
| 135 | stareste mangiando | condizionale | condizionale-progressivo | seconda-persona | plurale | progressive | condizionale-progressivo, progressive, stare-auxiliary | you would be eating |
| 136 | starebbero mangiando | condizionale | condizionale-progressivo | terza-persona | plurale | progressive | condizionale-progressivo, progressive, stare-auxiliary | they would be eating |
| 137 | stando mangiando | gerundio | gerundio-progressivo | - | - | progressive | gerundio-progressivo, progressive, stare-auxiliary | being eating |

**Form_Translations Coverage**: 137 form_translations total, all linking to single "to eat" translation. No restrictions apply - all forms covered.

---

### Scenario B: Reflexive Verb - "lavarsi" (to wash oneself/each other) - Complete Form Inventory

#### Dictionary Entry
```sql
-- dictionary table
id: 770e8400-e29b-41d4-a716-446655440000
lemma: "lavarsi"
word_type: "verb"
```

#### Word-Level Metadata
```sql
-- entity_type='word', entity_id=770e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "are-conjugation"  (conjugation_type)
value_id → meta_values.value: "direct-reflexive" (verb_type)
value_id → meta_values.value: "freq-top200"      (frequency_tier)
value_id → meta_values.value: "CEFR-A2"          (cefr_level)
```

#### Translation 1: Direct Reflexive "to wash oneself"
```sql
-- word_translations table
id: 880e8400-e29b-41d4-a716-446655440001
word_id: 770e8400-e29b-41d4-a716-446655440000
translation: "to wash oneself"
display_priority: 1
context_metadata: {
  "auxiliary": "essere",
  "usage": "direct-reflexive",
  "transitivity": "reflexive"
}
```

#### Translation 2: Reciprocal "to wash each other" (MANDATORY)
```sql
-- word_translations table  
id: 880e8400-e29b-41d4-a716-446655440002
word_id: 770e8400-e29b-41d4-a716-446655440000
translation: "to wash each other"
display_priority: 2
context_metadata: {
  "auxiliary": "essere",
  "usage": "reciprocal", 
  "plurality": "plural-only"
}
```

#### Complete Form Inventory with Integrated Clitics (137 Total Forms)

**Simple Forms with Reflexive Pronouns (51 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 201 | mi lavo | indicativo | presente | prima-persona | singolare | simple | presente, simple, reflexive, mi-clitic | I wash myself | - |
| 202 | ti lavi | indicativo | presente | seconda-persona | singolare | simple | presente, simple, reflexive, ti-clitic | you wash yourself | - |
| 203 | si lava | indicativo | presente | terza-persona | singolare | simple | presente, simple, reflexive, si-clitic | he/she washes himself/herself | - |
| 204 | ci laviamo | indicativo | presente | prima-persona | plurale | simple | presente, simple, reflexive, ci-clitic | we wash ourselves | we wash each other |
| 205 | vi lavate | indicativo | presente | seconda-persona | plurale | simple | presente, simple, reflexive, vi-clitic | you wash yourselves | you wash each other |
| 206 | si lavano | indicativo | presente | terza-persona | plurale | simple | presente, simple, reflexive, si-clitic | they wash themselves | they wash each other |
| 207 | mi lavavo | indicativo | imperfetto | prima-persona | singolare | simple | imperfetto, simple, reflexive, mi-clitic | I was washing myself | - |
| 208 | ti lavavi | indicativo | imperfetto | seconda-persona | singolare | simple | imperfetto, simple, reflexive, ti-clitic | you were washing yourself | - |
| 209 | si lavava | indicativo | imperfetto | terza-persona | singolare | simple | imperfetto, simple, reflexive, si-clitic | he/she was washing himself/herself | - |
| 210 | ci lavavamo | indicativo | imperfetto | prima-persona | plurale | simple | imperfetto, simple, reflexive, ci-clitic | we were washing ourselves | we were washing each other |
| 211 | vi lavavate | indicativo | imperfetto | seconda-persona | plurale | simple | imperfetto, simple, reflexive, vi-clitic | you were washing yourselves | you were washing each other |
| 212 | si lavavano | indicativo | imperfetto | terza-persona | plurale | simple | imperfetto, simple, reflexive, si-clitic | they were washing themselves | they were washing each other |
| 213 | mi lavai | indicativo | passato-remoto | prima-persona | singolare | simple | passato-remoto, simple, reflexive, mi-clitic | I washed myself | - |
| 214 | ti lavasti | indicativo | passato-remoto | seconda-persona | singolare | simple | passato-remoto, simple, reflexive, ti-clitic | you washed yourself | - |
| 215 | si lavò | indicativo | passato-remoto | terza-persona | singolare | simple | passato-remoto, simple, reflexive, si-clitic | he/she washed himself/herself | - |
| 216 | ci lavammo | indicativo | passato-remoto | prima-persona | plurale | simple | passato-remoto, simple, reflexive, ci-clitic | we washed ourselves | we washed each other |
| 217 | vi lavaste | indicativo | passato-remoto | seconda-persona | plurale | simple | passato-remoto, simple, reflexive, vi-clitic | you washed yourselves | you washed each other |
| 218 | si lavarono | indicativo | passato-remoto | terza-persona | plurale | simple | passato-remoto, simple, reflexive, si-clitic | they washed themselves | they washed each other |
| 219 | mi laverò | indicativo | futuro-semplice | prima-persona | singolare | simple | futuro-semplice, simple, reflexive, mi-clitic | I will wash myself | - |
| 220 | ti laverai | indicativo | futuro-semplice | seconda-persona | singolare | simple | futuro-semplice, simple, reflexive, ti-clitic | you will wash yourself | - |
| 221 | si laverà | indicativo | futuro-semplice | terza-persona | singolare | simple | futuro-semplice, simple, reflexive, si-clitic | he/she will wash himself/herself | - |
| 222 | ci laveremo | indicativo | futuro-semplice | prima-persona | plurale | simple | futuro-semplice, simple, reflexive, ci-clitic | we will wash ourselves | we will wash each other |
| 223 | vi laverete | indicativo | futuro-semplice | seconda-persona | plurale | simple | futuro-semplice, simple, reflexive, vi-clitic | you will wash yourselves | you will wash each other |
| 224 | si laveranno | indicativo | futuro-semplice | terza-persona | plurale | simple | futuro-semplice, simple, reflexive, si-clitic | they will wash themselves | they will wash each other |
| 225 | mi lavi | congiuntivo | congiuntivo-presente | prima-persona | singolare | simple | congiuntivo-presente, simple, reflexive, mi-clitic | (that) I wash myself | - |
| 226 | ti lavi | congiuntivo | congiuntivo-presente | seconda-persona | singolare | simple | congiuntivo-presente, simple, reflexive, ti-clitic | (that) you wash yourself | - |
| 227 | si lavi | congiuntivo | congiuntivo-presente | terza-persona | singolare | simple | congiuntivo-presente, simple, reflexive, si-clitic | (that) he/she wash himself/herself | - |
| 228 | ci laviamo | congiuntivo | congiuntivo-presente | prima-persona | plurale | simple | congiuntivo-presente, simple, reflexive, ci-clitic | (that) we wash ourselves | (that) we wash each other |
| 229 | vi laviate | congiuntivo | congiuntivo-presente | seconda-persona | plurale | simple | congiuntivo-presente, simple, reflexive, vi-clitic | (that) you wash yourselves | (that) you wash each other |
| 230 | si lavino | congiuntivo | congiuntivo-presente | terza-persona | plurale | simple | congiuntivo-presente, simple, reflexive, si-clitic | (that) they wash themselves | (that) they wash each other |
| 231 | mi lavassi | congiuntivo | congiuntivo-imperfetto | prima-persona | singolare | simple | congiuntivo-imperfetto, simple, reflexive, mi-clitic | (that) I washed myself | - |
| 232 | ti lavassi | congiuntivo | congiuntivo-imperfetto | seconda-persona | singolare | simple | congiuntivo-imperfetto, simple, reflexive, ti-clitic | (that) you washed yourself | - |
| 233 | si lavasse | congiuntivo | congiuntivo-imperfetto | terza-persona | singolare | simple | congiuntivo-imperfetto, simple, reflexive, si-clitic | (that) he/she washed himself/herself | - |
| 234 | ci lavassimo | congiuntivo | congiuntivo-imperfetto | prima-persona | plurale | simple | congiuntivo-imperfetto, simple, reflexive, ci-clitic | (that) we washed ourselves | (that) we washed each other |
| 235 | vi lavaste | congiuntivo | congiuntivo-imperfetto | seconda-persona | plurale | simple | congiuntivo-imperfetto, simple, reflexive, vi-clitic | (that) you washed yourselves | (that) you washed each other |
| 236 | si lavassero | congiuntivo | congiuntivo-imperfetto | terza-persona | plurale | simple | congiuntivo-imperfetto, simple, reflexive, si-clitic | (that) they washed themselves | (that) they washed each other |
| 237 | mi laverei | condizionale | condizionale-presente | prima-persona | singolare | simple | condizionale-presente, simple, reflexive, mi-clitic | I would wash myself | - |
| 238 | ti laveresti | condizionale | condizionale-presente | seconda-persona | singolare | simple | condizionale-presente, simple, reflexive, ti-clitic | you would wash yourself | - |
| 239 | si laverebbe | condizionale | condizionale-presente | terza-persona | singolare | simple | condizionale-presente, simple, reflexive, si-clitic | he/she would wash himself/herself | - |
| 240 | ci laveremmo | condizionale | condizionale-presente | prima-persona | plurale | simple | condizionale-presente, simple, reflexive, ci-clitic | we would wash ourselves | we would wash each other |
| 241 | vi lavereste | condizionale | condizionale-presente | seconda-persona | plurale | simple | condizionale-presente, simple, reflexive, vi-clitic | you would wash yourselves | you would wash each other |
| 242 | si laverebbero | condizionale | condizionale-presente | terza-persona | plurale | simple | condizionale-presente, simple, reflexive, si-clitic | they would wash themselves | they would wash each other |
| 243 | lavati | imperativo | imperativo-presente | seconda-persona | singolare | simple | imperativo-presente, simple, reflexive, ti-clitic | wash yourself! | - |
| 244 | si lavi | imperativo | imperativo-presente | terza-persona | singolare | simple | imperativo-presente, simple, reflexive, si-clitic | let him/her wash himself/herself! | - |
| 245 | laviamoci | imperativo | imperativo-presente | prima-persona | plurale | simple | imperativo-presente, simple, reflexive, ci-clitic | let's wash ourselves! | let's wash each other! |
| 246 | lavatevi | imperativo | imperativo-presente | seconda-persona | plurale | simple | imperativo-presente, simple, reflexive, vi-clitic | wash yourselves! | wash each other! |
| 247 | si lavino | imperativo | imperativo-presente | terza-persona | plurale | simple | imperativo-presente, simple, reflexive, si-clitic | let them wash themselves! | let them wash each other! |
| 248 | lavarsi | infinito | infinito-presente | - | - | simple | infinito-presente, simple, reflexive, si-clitic | to wash oneself | to wash each other |
| 249 | lavantesi | participio | participio-presente | - | - | simple | participio-presente, simple, reflexive, si-clitic | washing oneself | washing each other |
| 250 | lavato/a/i/e | participio | participio-passato | - | - | simple | participio-passato, simple, reflexive, agreement | washed | washed |
| 251 | lavandosi | gerundio | gerundio-presente | - | - | simple | gerundio-presente, simple, reflexive, si-clitic | washing oneself | washing each other |

**Compound Forms with essere + Agreement (49 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 252 | mi sono lavato/a | indicativo | passato-prossimo | prima-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, reflexive, agreement | I have washed myself | - |
| 253 | ti sei lavato/a | indicativo | passato-prossimo | seconda-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, reflexive, agreement | you have washed yourself | - |
| 254 | si è lavato/a | indicativo | passato-prossimo | terza-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, reflexive, agreement | he/she has washed himself/herself | - |
| 255 | ci siamo lavati/e | indicativo | passato-prossimo | prima-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary, reflexive, agreement | we have washed ourselves | we have washed each other |
| 256 | vi siete lavati/e | indicativo | passato-prossimo | seconda-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary, reflexive, agreement | you have washed yourselves | you have washed each other |
| 257 | si sono lavati/e | indicativo | passato-prossimo | terza-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary, reflexive, agreement | they have washed themselves | they have washed each other |
| 258 | mi ero lavato/a | indicativo | trapassato-prossimo | prima-persona | singolare | compound | trapassato-prossimo, compound, essere-auxiliary, reflexive, agreement | I had washed myself | - |
| 259 | ti eri lavato/a | indicativo | trapassato-prossimo | seconda-persona | singolare | compound | trapassato-prossimo, compound, essere-auxiliary, reflexive, agreement | you had washed yourself | - |
| 260 | si era lavato/a | indicativo | trapassato-prossimo | terza-persona | singolare | compound | trapassato-prossimo, compound, essere-auxiliary, reflexive, agreement | he/she had washed himself/herself | - |
| 261 | ci eravamo lavati/e | indicativo | trapassato-prossimo | prima-persona | plurale | compound | trapassato-prossimo, compound, essere-auxiliary, reflexive, agreement | we had washed ourselves | we had washed each other |
| 262 | vi eravate lavati/e | indicativo | trapassato-prossimo | seconda-persona | plurale | compound | trapassato-prossimo, compound, essere-auxiliary, reflexive, agreement | you had washed yourselves | you had washed each other |
| 263 | si erano lavati/e | indicativo | trapassato-prossimo | terza-persona | plurale | compound | trapassato-prossimo, compound, essere-auxiliary, reflexive, agreement | they had washed themselves | they had washed each other |
| 264 | mi fui lavato/a | indicativo | trapassato-remoto | prima-persona | singolare | compound | trapassato-remoto, compound, essere-auxiliary, reflexive, agreement | I had washed myself | - |
| 265 | ti fosti lavato/a | indicativo | trapassato-remoto | seconda-persona | singolare | compound | trapassato-remoto, compound, essere-auxiliary, reflexive, agreement | you had washed yourself | - |
| 266 | si fu lavato/a | indicativo | trapassato-remoto | terza-persona | singolare | compound | trapassato-remoto, compound, essere-auxiliary, reflexive, agreement | he/she had washed himself/herself | - |
| 267 | ci fummo lavati/e | indicativo | trapassato-remoto | prima-persona | plurale | compound | trapassato-remoto, compound, essere-auxiliary, reflexive, agreement | we had washed ourselves | we had washed each other |
| 268 | vi foste lavati/e | indicativo | trapassato-remoto | seconda-persona | plurale | compound | trapassato-remoto, compound, essere-auxiliary, reflexive, agreement | you had washed yourselves | you had washed each other |
| 269 | si furono lavati/e | indicativo | trapassato-remoto | terza-persona | plurale | compound | trapassato-remoto, compound, essere-auxiliary, reflexive, agreement | they had washed themselves | they had washed each other |
| 270 | mi sarò lavato/a | indicativo | futuro-anteriore | prima-persona | singolare | compound | futuro-anteriore, compound, essere-auxiliary, reflexive, agreement | I will have washed myself | - |
| 271 | ti sarai lavato/a | indicativo | futuro-anteriore | seconda-persona | singolare | compound | futuro-anteriore, compound, essere-auxiliary, reflexive, agreement | you will have washed yourself | - |
| 272 | si sarà lavato/a | indicativo | futuro-anteriore | terza-persona | singolare | compound | futuro-anteriore, compound, essere-auxiliary, reflexive, agreement | he/she will have washed himself/herself | - |
| 273 | ci saremo lavati/e | indicativo | futuro-anteriore | prima-persona | plurale | compound | futuro-anteriore, compound, essere-auxiliary, reflexive, agreement | we will have washed ourselves | we will have washed each other |
| 274 | vi sarete lavati/e | indicativo | futuro-anteriore | seconda-persona | plurale | compound | futuro-anteriore, compound, essere-auxiliary, reflexive, agreement | you will have washed yourselves | you will have washed each other |
| 275 | si saranno lavati/e | indicativo | futuro-anteriore | terza-persona | plurale | compound | futuro-anteriore, compound, essere-auxiliary, reflexive, agreement | they will have washed themselves | they will have washed each other |
| 276 | mi sia lavato/a | congiuntivo | congiuntivo-passato | prima-persona | singolare | compound | congiuntivo-passato, compound, essere-auxiliary, reflexive, agreement | (that) I have washed myself | - |
| 277 | ti sia lavato/a | congiuntivo | congiuntivo-passato | seconda-persona | singolare | compound | congiuntivo-passato, compound, essere-auxiliary, reflexive, agreement | (that) you have washed yourself | - |
| 278 | si sia lavato/a | congiuntivo | congiuntivo-passato | terza-persona | singolare | compound | congiuntivo-passato, compound, essere-auxiliary, reflexive, agreement | (that) he/she has washed himself/herself | - |
| 279 | ci siamo lavati/e | congiuntivo | congiuntivo-passato | prima-persona | plurale | compound | congiuntivo-passato, compound, essere-auxiliary, reflexive, agreement | (that) we have washed ourselves | (that) we have washed each other |
| 280 | vi siate lavati/e | congiuntivo | congiuntivo-passato | seconda-persona | plurale | compound | congiuntivo-passato, compound, essere-auxiliary, reflexive, agreement | (that) you have washed yourselves | (that) you have washed each other |
| 281 | si siano lavati/e | congiuntivo | congiuntivo-passato | terza-persona | plurale | compound | congiuntivo-passato, compound, essere-auxiliary, reflexive, agreement | (that) they have washed themselves | (that) they have washed each other |
| 282 | mi fossi lavato/a | congiuntivo | congiuntivo-trapassato | prima-persona | singolare | compound | congiuntivo-trapassato, compound, essere-auxiliary, reflexive, agreement | (that) I had washed myself | - |
| 283 | ti fossi lavato/a | congiuntivo | congiuntivo-trapassato | seconda-persona | singolare | compound | congiuntivo-trapassato, compound, essere-auxiliary, reflexive, agreement | (that) you had washed yourself | - |
| 284 | si fosse lavato/a | congiuntivo | congiuntivo-trapassato | terza-persona | singolare | compound | congiuntivo-trapassato, compound, essere-auxiliary, reflexive, agreement | (that) he/she had washed himself/herself | - |
| 285 | ci fossimo lavati/e | congiuntivo | congiuntivo-trapassato | prima-persona | plurale | compound | congiuntivo-trapassato, compound, essere-auxiliary, reflexive, agreement | (that) we had washed ourselves | (that) we had washed each other |
| 286 | vi foste lavati/e | congiuntivo | congiuntivo-trapassato | seconda-persona | plurale | compound | congiuntivo-trapassato, compound, essere-auxiliary, reflexive, agreement | (that) you had washed yourselves | (that) you had washed each other |
| 287 | si fossero lavati/e | congiuntivo | congiuntivo-trapassato | terza-persona | plurale | compound | congiuntivo-trapassato, compound, essere-auxiliary, reflexive, agreement | (that) they had washed themselves | (that) they had washed each other |
| 288 | mi sarei lavato/a | condizionale | condizionale-passato | prima-persona | singolare | compound | condizionale-passato, compound, essere-auxiliary, reflexive, agreement | I would have washed myself | - |
| 289 | ti saresti lavato/a | condizionale | condizionale-passato | seconda-persona | singolare | compound | condizionale-passato, compound, essere-auxiliary, reflexive, agreement | you would have washed yourself | - |
| 290 | si sarebbe lavato/a | condizionale | condizionale-passato | terza-persona | singolare | compound | condizionale-passato, compound, essere-auxiliary, reflexive, agreement | he/she would have washed himself/herself | - |
| 291 | ci saremmo lavati/e | condizionale | condizionale-passato | prima-persona | plurale | compound | condizionale-passato, compound, essere-auxiliary, reflexive, agreement | we would have washed ourselves | we would have washed each other |
| 292 | vi sareste lavati/e | condizionale | condizionale-passato | seconda-persona | plurale | compound | condizionale-passato, compound, essere-auxiliary, reflexive, agreement | you would have washed yourselves | you would have washed each other |
| 293 | si sarebbero lavati/e | condizionale | condizionale-passato | terza-persona | plurale | compound | condizionale-passato, compound, essere-auxiliary, reflexive, agreement | they would have washed themselves | they would have washed each other |
| 294 | sii lavato/a | imperativo | imperativo-passato | seconda-persona | singolare | compound | imperativo-passato, compound, essere-auxiliary, reflexive, agreement | have washed yourself! | - |
| 295 | si sia lavato/a | imperativo | imperativo-passato | terza-persona | singolare | compound | imperativo-passato, compound, essere-auxiliary, reflexive, agreement | let him/her have washed himself/herself! | - |
| 296 | siamoci lavati/e | imperativo | imperativo-passato | prima-persona | plurale | compound | imperativo-passato, compound, essere-auxiliary, reflexive, agreement | let's have washed ourselves! | let's have washed each other! |
| 297 | siatevi lavati/e | imperativo | imperativo-passato | seconda-persona | plurale | compound | imperativo-passato, compound, essere-auxiliary, reflexive, agreement | have washed yourselves! | have washed each other! |
| 298 | si siano lavati/e | imperativo | imperativo-passato | terza-persona | plurale | compound | imperativo-passato, compound, essere-auxiliary, reflexive, agreement | let them have washed themselves! | let them have washed each other! |
| 299 | essendosi lavato/a/i/e | gerundio | gerundio-passato | - | - | compound | gerundio-passato, compound, essere-auxiliary, reflexive, agreement | having washed oneself | having washed each other |
| 300 | essersi lavato/a/i/e | infinito | infinito-passato | - | - | compound | infinito-passato, compound, essere-auxiliary, reflexive, agreement | to have washed oneself | to have washed each other |

**Progressive Forms with stare (35 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 301 | mi sto lavando | indicativo | presente-progressivo | prima-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary, reflexive, mi-clitic | I am washing myself | - |
| 302 | ti stai lavando | indicativo | presente-progressivo | seconda-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary, reflexive, ti-clitic | you are washing yourself | - |
| 303 | si sta lavando | indicativo | presente-progressivo | terza-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | he/she is washing himself/herself | - |
| 304 | ci stiamo lavando | indicativo | presente-progressivo | prima-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary, reflexive, ci-clitic | we are washing ourselves | we are washing each other |
| 305 | vi state lavando | indicativo | presente-progressivo | seconda-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary, reflexive, vi-clitic | you are washing yourselves | you are washing each other |
| 306 | si stanno lavando | indicativo | presente-progressivo | terza-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | they are washing themselves | they are washing each other |
| 307 | mi stavo lavando | indicativo | passato-progressivo | prima-persona | singolare | progressive | passato-progressivo, progressive, stare-auxiliary, reflexive, mi-clitic | I was washing myself | - |
| 308 | ti stavi lavando | indicativo | passato-progressivo | seconda-persona | singolare | progressive | passato-progressivo, progressive, stare-auxiliary, reflexive, ti-clitic | you were washing yourself | - |
| 309 | si stava lavando | indicativo | passato-progressivo | terza-persona | singolare | progressive | passato-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | he/she was washing himself/herself | - |
| 310 | ci stavamo lavando | indicativo | passato-progressivo | prima-persona | plurale | progressive | passato-progressivo, progressive, stare-auxiliary, reflexive, ci-clitic | we were washing ourselves | we were washing each other |
| 311 | vi stavate lavando | indicativo | passato-progressivo | seconda-persona | plurale | progressive | passato-progressivo, progressive, stare-auxiliary, reflexive, vi-clitic | you were washing yourselves | you were washing each other |
| 312 | si stavano lavando | indicativo | passato-progressivo | terza-persona | plurale | progressive | passato-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | they were washing themselves | they were washing each other |
| 313 | mi starò lavando | indicativo | futuro-progressivo | prima-persona | singolare | progressive | futuro-progressivo, progressive, stare-auxiliary, reflexive, mi-clitic | I will be washing myself | - |
| 314 | ti starai lavando | indicativo | futuro-progressivo | seconda-persona | singolare | progressive | futuro-progressivo, progressive, stare-auxiliary, reflexive, ti-clitic | you will be washing yourself | - |
| 315 | si starà lavando | indicativo | futuro-progressivo | terza-persona | singolare | progressive | futuro-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | he/she will be washing himself/herself | - |
| 316 | ci staremo lavando | indicativo | futuro-progressivo | prima-persona | plurale | progressive | futuro-progressivo, progressive, stare-auxiliary, reflexive, ci-clitic | we will be washing ourselves | we will be washing each other |
| 317 | vi starete lavando | indicativo | futuro-progressivo | seconda-persona | plurale | progressive | futuro-progressivo, progressive, stare-auxiliary, reflexive, vi-clitic | you will be washing yourselves | you will be washing each other |
| 318 | si staranno lavando | indicativo | futuro-progressivo | terza-persona | plurale | progressive | futuro-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | they will be washing themselves | they will be washing each other |
| 319 | mi stia lavando | congiuntivo | congiuntivo-presente-progressivo | prima-persona | singolare | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary, reflexive, mi-clitic | (that) I be washing myself | - |
| 320 | ti stia lavando | congiuntivo | congiuntivo-presente-progressivo | seconda-persona | singolare | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary, reflexive, ti-clitic | (that) you be washing yourself | - |
| 321 | si stia lavando | congiuntivo | congiuntivo-presente-progressivo | terza-persona | singolare | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | (that) he/she be washing himself/herself | - |
| 322 | ci stiamo lavando | congiuntivo | congiuntivo-presente-progressivo | prima-persona | plurale | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary, reflexive, ci-clitic | (that) we be washing ourselves | (that) we be washing each other |
| 323 | vi stiate lavando | congiuntivo | congiuntivo-presente-progressivo | seconda-persona | plurale | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary, reflexive, vi-clitic | (that) you be washing yourselves | (that) you be washing each other |
| 324 | si stiano lavando | congiuntivo | congiuntivo-presente-progressivo | terza-persona | plurale | progressive | congiuntivo-presente-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | (that) they be washing themselves | (that) they be washing each other |
| 325 | mi stessi lavando | congiuntivo | congiuntivo-imperfetto-progressivo | prima-persona | singolare | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary, reflexive, mi-clitic | (that) I were washing myself | - |
| 326 | ti stessi lavando | congiuntivo | congiuntivo-imperfetto-progressivo | seconda-persona | singolare | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary, reflexive, ti-clitic | (that) you were washing yourself | - |
| 327 | si stesse lavando | congiuntivo | congiuntivo-imperfetto-progressivo | terza-persona | singolare | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | (that) he/she were washing himself/herself | - |
| 328 | ci stessimo lavando | congiuntivo | congiuntivo-imperfetto-progressivo | prima-persona | plurale | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary, reflexive, ci-clitic | (that) we were washing ourselves | (that) we were washing each other |
| 329 | vi steste lavando | congiuntivo | congiuntivo-imperfetto-progressivo | seconda-persona | plurale | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary, reflexive, vi-clitic | (that) you were washing yourselves | (that) you were washing each other |
| 330 | si stessero lavando | congiuntivo | congiuntivo-imperfetto-progressivo | terza-persona | plurale | progressive | congiuntivo-imperfetto-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | (that) they were washing themselves | (that) they were washing each other |
| 331 | mi starei lavando | condizionale | condizionale-progressivo | prima-persona | singolare | progressive | condizionale-progressivo, progressive, stare-auxiliary, reflexive, mi-clitic | I would be washing myself | - |
| 332 | ti staresti lavando | condizionale | condizionale-progressivo | seconda-persona | singolare | progressive | condizionale-progressivo, progressive, stare-auxiliary, reflexive, ti-clitic | you would be washing yourself | - |
| 333 | si starebbe lavando | condizionale | condizionale-progressivo | terza-persona | singolare | progressive | condizionale-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | he/she would be washing himself/herself | - |
| 334 | ci staremmo lavando | condizionale | condizionale-progressivo | prima-persona | plurale | progressive | condizionale-progressivo, progressive, stare-auxiliary, reflexive, ci-clitic | we would be washing ourselves | we would be washing each other |
| 335 | vi stareste lavando | condizionale | condizionale-progressivo | seconda-persona | plurale | progressive | condizionale-progressivo, progressive, stare-auxiliary, reflexive, vi-clitic | you would be washing yourselves | you would be washing each other |
| 336 | si starebbero lavando | condizionale | condizionale-progressivo | terza-persona | plurale | progressive | condizionale-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | they would be washing themselves | they would be washing each other |
| 337 | standosi lavando | gerundio | gerundio-progressivo | - | - | progressive | gerundio-progressivo, progressive, stare-auxiliary, reflexive, si-clitic | being washing oneself | being washing each other |

**Form_Translations Coverage Analysis:**
- **Translation 1 (Direct Reflexive)**: 137 form_translations (all forms covered)
- **Translation 2 (Reciprocal)**: 45 form_translations (only plural forms: noi, voi, loro)
- **Total Coverage**: 182 form_translations across both meanings

---

### Scenario C: Dual Auxiliary Verb - "correre" (to run) - Complete Form Inventory  

#### Dictionary Entry
```sql
-- dictionary table
id: 990e8400-e29b-41d4-a716-446655440000
lemma: "correre"
word_type: "verb"
```

#### Word-Level Metadata
```sql
-- entity_type='word', entity_id=990e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "ere-conjugation" (conjugation_type)
value_id → meta_values.value: "freq-top500"     (frequency_tier)
value_id → meta_values.value: "CEFR-B1"         (cefr_level)
value_id → meta_values.value: "transitive-verb" (verb_type)
```

#### Translation 1: "to run" (sport/exercise - transitive with avere)
```sql
-- word_translations table
id: aa0e8400-e29b-41d4-a716-446655440001
word_id: 990e8400-e29b-41d4-a716-446655440000
translation: "to run (sport)"
display_priority: 1
context_metadata: {
  "auxiliary": "avere",
  "transitivity": "transitive",
  "context": "sport/exercise"
}
```

#### Translation 2: "to rush to" (motion with destination - intransitive with essere)
```sql
-- word_translations table
id: aa0e8400-e29b-41d4-a716-446655440002
word_id: 990e8400-e29b-41d4-a716-446655440000
translation: "to rush to"
display_priority: 2
context_metadata: {
  "auxiliary": "essere", 
  "transitivity": "intransitive",
  "verb_type": "transitive-verb"
}
```

#### Complete Form Inventory - Shared and Auxiliary-Specific (219 Total Forms)

**Simple Forms - Shared Across Both Meanings (51 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 401 | corro | indicativo | presente | prima-persona | singolare | simple | presente, simple | I run (sport) | I rush |
| 402 | corri | indicativo | presente | seconda-persona | singolare | simple | presente, simple | you run (sport) | you rush |
| 403 | corre | indicativo | presente | terza-persona | singolare | simple | presente, simple | he/she runs (sport) | he/she rushes |
| 404 | corriamo | indicativo | presente | prima-persona | plurale | simple | presente, simple | we run (sport) | we rush |
| 405 | correte | indicativo | presente | seconda-persona | plurale | simple | presente, simple | you run (sport) | you rush |
| 406 | corrono | indicativo | presente | terza-persona | plurale | simple | presente, simple | they run (sport) | they rush |
| ... | (45 additional simple forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 448 | correre | infinito | infinito-presente | - | - | simple | infinito-presente, simple | to run (sport) | to rush to |
| 449 | corrente | participio | participio-presente | - | - | simple | participio-presente, simple | running | rushing |
| 450 | corso | participio | participio-passato | - | - | simple | participio-passato, simple | run | rushed |
| 451 | correndo | gerundio | gerundio-presente | - | - | simple | gerundio-presente, simple | running | rushing |

**Compound Forms with avere - Translation 1 Only (49 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 452 | ho corso | indicativo | passato-prossimo | prima-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | I have run (sport) | - |
| 453 | hai corso | indicativo | passato-prossimo | seconda-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | you have run (sport) | - |
| 454 | ha corso | indicativo | passato-prossimo | terza-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | he/she has run (sport) | - |
| 455 | abbiamo corso | indicativo | passato-prossimo | prima-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | we have run (sport) | - |
| 456 | avete corso | indicativo | passato-prossimo | seconda-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | you have run (sport) | - |
| 457 | hanno corso | indicativo | passato-prossimo | terza-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | they have run (sport) | - |
| ... | (43 additional compound forms with avere) | ... | ... | ... | ... | ... | ... | ... | ... |
| 500 | aver corso | infinito | infinito-passato | - | - | compound | infinito-passato, compound, avere-auxiliary | to have run (sport) | - |

**Compound Forms with essere - Translation 2 Only (49 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 501 | sono corso/a | indicativo | passato-prossimo | prima-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, agreement | - | I have rushed |
| 502 | sei corso/a | indicativo | passato-prossimo | seconda-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, agreement | - | you have rushed |
| 503 | è corso/a | indicativo | passato-prossimo | terza-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, agreement | - | he/she has rushed |
| 504 | siamo corsi/e | indicativo | passato-prossimo | prima-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary, agreement | - | we have rushed |
| 505 | siete corsi/e | indicativo | passato-prossimo | seconda-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary, agreement | - | you have rushed |
| 506 | sono corsi/e | indicativo | passato-prossimo | terza-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary, agreement | - | they have rushed |
| ... | (43 additional compound forms with essere) | ... | ... | ... | ... | ... | ... | ... | ... |
| 549 | essere corso/a/i/e | infinito | infinito-passato | - | - | compound | infinito-passato, compound, essere-auxiliary, agreement | - | to have rushed |

**Progressive Forms - Shared Across Both Meanings (35 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 550 | sto correndo | indicativo | presente-progressivo | prima-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | I am running (sport) | I am rushing |
| 551 | stai correndo | indicativo | presente-progressivo | seconda-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | you are running (sport) | you are rushing |
| 552 | sta correndo | indicativo | presente-progressivo | terza-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | he/she is running (sport) | he/she is rushing |
| ... | (32 additional progressive forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 584 | stando correndo | gerundio | gerundio-progressivo | - | - | progressive | gerundio-progressivo, progressive, stare-auxiliary | being running | being rushing |

**Form_Translations Coverage Analysis:**
- **Translation 1 (Sport - avere)**: 135 form_translations (51 simple + 49 avere compounds + 35 progressives)
- **Translation 2 (Motion - essere)**: 135 form_translations (51 simple + 49 essere compounds + 35 progressives)  
- **Total Coverage**: 270 form_translations across both meanings
- **Critical Point**: 219 distinct forms, but 270 total form_translations due to shared simple/progressive forms

---

### Scenario D: Modal Verb - "dovere" (must/to have to) - Complete Form Inventory

#### Dictionary Entry
```sql
-- dictionary table  
id: bb0e8400-e29b-41d4-a716-446655440000
lemma: "dovere"
word_type: "verb"
```

#### Word-Level Metadata
```sql
-- entity_type='word', entity_id=bb0e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "ere-conjugation"    (conjugation_type)
value_id → meta_values.value: "modal-verb"         (verb_type)
value_id → meta_values.value: "freq-top50"         (frequency_tier)
value_id → meta_values.value: "CEFR-A1"            (cefr_level)
```

#### Meta Attribute Integration
The meta attribute `modal-verb` is stored in `entity_meta_values`:
```sql
-- meta_attributes contains: attribute_name="verb_type", category="grammatical"
-- meta_values contains: value="modal-verb", stable_id="modal_verb", attribute_id=<verb_type_attr_id>
-- entity_meta_values links: entity_type='word', entity_id=<dovere_id>, value_id=<modal_verb_value_id>
```

#### Translation 1: "must/to have to" (obligation)
```sql
-- word_translations table
id: cc0e8400-e29b-41d4-a716-446655440001  
word_id: bb0e8400-e29b-41d4-a716-446655440000
translation: "must/to have to"
display_priority: 1
context_metadata: {
  "auxiliary": "avere",
  "modal_pattern": "dovere + infinitive",
  "usage": "modal"
}
```

#### Translation 2: "to owe" (debt/obligation)
```sql
-- word_translations table
id: cc0e8400-e29b-41d4-a716-446655440002
word_id: bb0e8400-e29b-41d4-a716-446655440000
translation: "to owe"
display_priority: 2  
context_metadata: {
  "auxiliary": "avere",
  "transitivity": "transitive",
  "usage": "transitive"
}
```

#### Modal-Specific Architecture Pattern
Modal verbs have unique auxiliary behavior:
- **Standalone usage**: Always use their own assigned auxiliary (dovere → avere)
- **Modal + infinitive usage**: Inherit auxiliary from the dependent infinitive
  - "ho dovuto mangiare" (mangiare uses avere)
  - "sono dovuto andare" (andare uses essere)

#### Complete Form Inventory (270 Total Forms)

**Simple Forms - Core Modal Conjugations (51 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 601 | devo | indicativo | presente | prima-persona | singolare | simple | presente, simple, modal | I must | I owe |
| 602 | devi | indicativo | presente | seconda-persona | singolare | simple | presente, simple, modal | you must | you owe |
| 603 | deve | indicativo | presente | terza-persona | singolare | simple | presente, simple, modal | he/she must | he/she owes |
| 604 | dobbiamo | indicativo | presente | prima-persona | plurale | simple | presente, simple, modal | we must | we owe |
| 605 | dovete | indicativo | presente | seconda-persona | plurale | simple | presente, simple, modal | you must | you owe |  
| 606 | devono | indicativo | presente | terza-persona | plurale | simple | presente, simple, modal | they must | they owe |
| ... | (45 additional simple forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 648 | dovere | infinito | infinito-presente | - | - | simple | infinito-presente, simple, modal | to have to | to owe |
| 649 | dovente | participio | participio-presente | - | - | simple | participio-presente, simple, modal | having to | owing |
| 650 | dovuto | participio | participio-passato | - | - | simple | participio-passato, simple, modal | had to | owed |
| 651 | dovendo | gerundio | gerundio-presente | - | - | simple | gerundio-presente, simple, modal | having to | owing |

**Compound Forms with avere - Standalone Usage (49 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 652 | ho dovuto | indicativo | passato-prossimo | prima-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary, modal | I have had to | I have owed |
| 653 | hai dovuto | indicativo | passato-prossimo | seconda-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary, modal | you have had to | you have owed |
| ... | (47 additional compound forms with avere) | ... | ... | ... | ... | ... | ... | ... | ... |
| 700 | aver dovuto | infinito | infinito-passato | - | - | compound | infinito-passato, compound, avere-auxiliary, modal | to have had to | to have owed |

**Compound Forms with essere - Inherited from Infinitive (49 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 701 | sono dovuto/a | indicativo | passato-prossimo | prima-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, modal, agreement | I have had to (motion context) | - |
| 702 | sei dovuto/a | indicativo | passato-prossimo | seconda-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, modal, agreement | you have had to (motion context) | - |
| ... | (47 additional compound forms with essere) | ... | ... | ... | ... | ... | ... | ... | ... |
| 749 | essere dovuto/a/i/e | infinito | infinito-passato | - | - | compound | infinito-passato, compound, essere-auxiliary, modal, agreement | to have had to (motion context) | - |

**Progressive Forms - Modal in Progressive Context (35 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 750 | sto dovendo | indicativo | presente-progressivo | prima-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary, modal | I am having to | I am owing |
| 751 | stai dovendo | indicativo | presente-progressivo | seconda-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary, modal | you are having to | you are owing |
| ... | (33 additional progressive forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 784 | stando dovendo | gerundio | gerundio-progressivo | - | - | progressive | gerundio-progressivo, progressive, stare-auxiliary, modal | being having to | being owing |

**Modal Pattern Forms - Special Constructions (86 additional forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 785 | ho dovuto mangiare | compound-modal | passato-prossimo-modal | prima-persona | singolare | compound-modal | passato-prossimo, compound, avere-auxiliary, modal-infinitive | I have had to eat | - |
| 786 | sono dovuto/a andare | compound-modal | passato-prossimo-modal | prima-persona | singolare | compound-modal | passato-prossimo, compound, essere-auxiliary, modal-infinitive, agreement | I have had to go | - |
| ... | (84 additional modal pattern forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 870 | starò dovendo fare | progressive-modal | futuro-progressivo-modal | prima-persona | singolare | progressive-modal | futuro-progressivo, progressive, stare-auxiliary, modal-infinitive | I will be having to do | - |

**Form_Translations Coverage Analysis:**
- **Translation 1 (Must/Have to)**: 270 form_translations (all forms covered including modal patterns)
- **Translation 2 (Owe)**: 135 form_translations (excludes essere compounds and complex modal patterns)
- **Total Coverage**: 405 form_translations across both meanings
- **Modal Complexity**: Dual auxiliary system creates extensive form variation

---

### Scenario E: Defective Verb - "vigere" (to be in force) - Complete Form Inventory

#### Dictionary Entry
```sql
-- dictionary table
id: dd0e8400-e29b-41d4-a716-446655440000
lemma: "vigere"  
word_type: "verb"
```

#### Word-Level Metadata
```sql
-- entity_type='word', entity_id=dd0e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "ere-conjugation"    (conjugation_type)
value_id → meta_values.value: "defective-verb"     (verb_type)
value_id → meta_values.value: "freq-rare"          (frequency_tier)
value_id → meta_values.value: "CEFR-C1"            (cefr_level)
value_id → meta_values.value: "missing-first-second-person" (number_restriction)
```

#### Meta Attribute Integration for Defective Status
```sql
-- meta_attributes contains: attribute_name="verb_type", category="grammatical"  
-- meta_values contains: value="defective-verb", stable_id="defective_verb", attribute_id=<verb_type_attr_id>
-- entity_meta_values links: entity_type='word', entity_id=<vigere_id>, value_id=<defective_verb_value_id>

-- Additional restriction metadata
-- meta_attributes contains: attribute_name="number_restriction", category="morphological"
-- meta_values contains: value="missing-first-second-person", stable_id="missing_first_second_person"
```

#### Translation: "to be in force/to be valid" (legal/formal)
```sql
-- word_translations table
id: ee0e8400-e29b-41d4-a716-446655440001
word_id: dd0e8400-e29b-41d4-a716-446655440000
translation: "to be in force/to be valid" 
display_priority: 1
context_metadata: {
  "auxiliary": "essere",
  "transitivity": "intransitive",
  "usage": "formal",
  "register": "formal"
}
```

#### Defective Limitations Explanation
Vigere is defective due to semantic constraints:
- **Missing persons**: 1st and 2nd person forms don't exist (laws/rules don't "be in force" for specific people)
- **Missing imperative**: Cannot command someone to "be in force"  
- **Missing some compound tenses**: Certain temporal combinations are semantically impossible
- **3rd person focus**: Only "it is in force", "they are in force" make semantic sense

#### Complete Form Inventory - Only Existing Forms (67 Total Forms)

**Simple Forms - Only 3rd Person and Infinitive/Participle/Gerund (15 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|---------------------|
| 901 | vige | indicativo | presente | terza-persona | singolare | simple | presente, simple, defective, third-person-only | it is in force |
| 902 | vigono | indicativo | presente | terza-persona | plurale | simple | presente, simple, defective, third-person-only | they are in force |
| 903 | vigeva | indicativo | imperfetto | terza-persona | singolare | simple | imperfetto, simple, defective, third-person-only | it was in force |
| 904 | vigevano | indicativo | imperfetto | terza-persona | plurale | simple | imperfetto, simple, defective, third-person-only | they were in force |
| 905 | vigerà | indicativo | futuro-semplice | terza-persona | singolare | simple | futuro-semplice, simple, defective, third-person-only | it will be in force |
| 906 | vigeranno | indicativo | futuro-semplice | terza-persona | plurale | simple | futuro-semplice, simple, defective, third-person-only | they will be in force |
| 907 | viga | congiuntivo | congiuntivo-presente | terza-persona | singolare | simple | congiuntivo-presente, simple, defective, third-person-only | (that) it be in force |
| 908 | vigano | congiuntivo | congiuntivo-presente | terza-persona | plurale | simple | congiuntivo-presente, simple, defective, third-person-only | (that) they be in force |
| 909 | vigesse | congiuntivo | congiuntivo-imperfetto | terza-persona | singolare | simple | congiuntivo-imperfetto, simple, defective, third-person-only | (that) it were in force |
| 910 | vigessero | congiuntivo | congiuntivo-imperfetto | terza-persona | plurale | simple | congiuntivo-imperfetto, simple, defective, third-person-only | (that) they were in force |
| 911 | vigerebbe | condizionale | condizionale-presente | terza-persona | singolare | simple | condizionale-presente, simple, defective, third-person-only | it would be in force |
| 912 | vigerebbero | condizionale | condizionale-presente | terza-persona | plurale | simple | condizionale-presente, simple, defective, third-person-only | they would be in force |
| 913 | vigere | infinito | infinito-presente | - | - | simple | infinito-presente, simple, defective | to be in force |
| 914 | vigente | participio | participio-presente | - | - | simple | participio-presente, simple, defective | being in force |
| 915 | vigendo | gerundio | gerundio-presente | - | - | simple | gerundio-presente, simple, defective | being in force |

**Missing Simple Forms (36 forms that don't exist):**
- **All 1st person forms**: (io) vigo, vigevo, etc. - semantically impossible
- **All 2nd person forms**: (tu) vigi, vigevi, etc. - semantically impossible  
- **All imperative forms**: viggi!, vigate! - cannot command legal force
- **Passato remoto**: vigé, vigerono - rare/archaic usage
- **Past participle**: viguto - does not exist (uses "vigente" as adjective instead)

**Compound Forms - Limited to Existing Simple Forms (26 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|---------------------|
| 916 | è viguto | indicativo | passato-prossimo | terza-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, defective, third-person-only | it has been in force |
| 917 | sono viguti | indicativo | passato-prossimo | terza-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary, defective, third-person-only | they have been in force |
| 918 | era viguto | indicativo | trapassato-prossimo | terza-persona | singolare | compound | trapassato-prossimo, compound, essere-auxiliary, defective, third-person-only | it had been in force |
| 919 | erano viguti | indicativo | trapassato-prossimo | terza-persona | plurale | compound | trapassato-prossimo, compound, essere-auxiliary, defective, third-person-only | they had been in force |
| ... | (22 additional limited compound forms) | ... | ... | ... | ... | ... | ... | ... |
| 941 | essere viguto | infinito | infinito-passato | - | - | compound | infinito-passato, compound, essere-auxiliary, defective | to have been in force |

**Progressive Forms - Limited Context (26 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|---------------------|
| 942 | sta vigendo | indicativo | presente-progressivo | terza-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary, defective, third-person-only | it is being in force |
| 943 | stanno vigendo | indicativo | presente-progressivo | terza-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary, defective, third-person-only | they are being in force |
| 944 | stava vigendo | indicativo | passato-progressivo | terza-persona | singolare | progressive | passato-progressivo, progressive, stare-auxiliary, defective, third-person-only | it was being in force |
| 945 | stavano vigendo | indicativo | passato-progressivo | terza-persona | plurale | progressive | passato-progressivo, progressive, stare-auxiliary, defective, third-person-only | they were being in force |
| ... | (22 additional limited progressive forms) | ... | ... | ... | ... | ... | ... | ... |
| 967 | stando vigendo | gerundio | gerundio-progressivo | - | - | progressive | gerundio-progressivo, progressive, stare-auxiliary, defective | being being in force |

**Form_Translations Coverage Analysis:**
- **Single Translation**: 67 form_translations (only for linguistically valid forms)
- **Missing Coverage**: 68 forms that don't exist (normal verb would have 135 total)  
- **Coverage Percentage**: 49.6% of full conjugation paradigm
- **Validation Rule**: System expects reduced form count for defective-verb tagged entries

---

### Scenario F: Impersonal Verb - "importare" (to matter/import) - Complete Form Inventory

#### Dictionary Entry  
```sql
-- dictionary table
id: ff0e8400-e29b-41d4-a716-446655440000
lemma: "importare"
word_type: "verb"
```

#### Word-Level Metadata
```sql
-- entity_type='word', entity_id=ff0e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "are-conjugation"      (conjugation_type)
value_id → meta_values.value: "impersonal-verb"      (verb_type)  
value_id → meta_values.value: "freq-top1000"         (frequency_tier)
value_id → meta_values.value: "CEFR-B1"              (cefr_level)
value_id → meta_values.value: "third-person-only"    (number_restriction)
```

#### Meta Attribute Integration for Impersonal Status  
```sql
-- meta_attributes contains: attribute_name="verb_type", category="grammatical"
-- meta_values contains: value="impersonal-verb", stable_id="impersonal_verb", attribute_id=<verb_type_attr_id>
-- entity_meta_values links: entity_type='word', entity_id=<importare_id>, value_id=<impersonal_verb_value_id>

-- Person restriction metadata  
-- meta_attributes contains: attribute_name="number_restriction", category="morphological"
-- meta_values contains: value="third-person-only", stable_id="third_person_restriction"
```

#### Translation 1: "to matter" (impersonal usage - 3rd person only)
```sql
-- word_translations table
id: 110e8400-e29b-41d4-a716-446655440001
word_id: ff0e8400-e29b-41d4-a716-446655440000
translation: "to matter"
display_priority: 1
context_metadata: {
  "auxiliary": "essere",
  "usage": "impersonal",
  "plurality": "third-person-only"
}
```

#### Translation 2: "to import" (personal usage - all persons)
```sql
-- word_translations table  
id: 110e8400-e29b-41d4-a716-446655440002
word_id: ff0e8400-e29b-41d4-a716-446655440000
translation: "to import"
display_priority: 2
context_metadata: {
  "auxiliary": "avere",
  "transitivity": "transitive", 
  "usage": "transitive"
}
```

#### Dual Meaning Architecture Analysis
This verb demonstrates complex person restrictions:
- **"To matter" usage**: Only 3rd person ("it matters", "they matter") 
- **"To import" usage**: All persons ("I import", "you import", etc.)
- **Different auxiliaries**: essere for impersonal, avere for transitive
- **Form sharing**: Same forms, different translation coverage

#### Complete Form Inventory (135 Total Forms)

**Simple Forms - All Persons (51 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1001 | importo | indicativo | presente | prima-persona | singolare | simple | presente, simple | - | I import |
| 1002 | importi | indicativo | presente | seconda-persona | singolare | simple | presente, simple | - | you import |
| 1003 | importa | indicativo | presente | terza-persona | singolare | simple | presente, simple | it matters | he/she imports |
| 1004 | importiamo | indicativo | presente | prima-persona | plurale | simple | presente, simple | - | we import |
| 1005 | importate | indicativo | presente | seconda-persona | plurale | simple | presente, simple | - | you import |
| 1006 | importano | indicativo | presente | terza-persona | plurale | simple | presente, simple | they matter | they import |
| 1007 | importavo | indicativo | imperfetto | prima-persona | singolare | simple | imperfetto, simple | - | I was importing |
| 1008 | importavi | indicativo | imperfetto | seconda-persona | singolare | simple | imperfetto, simple | - | you were importing |
| 1009 | importava | indicativo | imperfetto | terza-persona | singolare | simple | imperfetto, simple | it mattered | he/she was importing |
| 1010 | importavamo | indicativo | imperfetto | prima-persona | plurale | simple | imperfetto, simple | - | we were importing |
| 1011 | importavate | indicativo | imperfetto | seconda-persona | plurale | simple | imperfetto, simple | - | you were importing |
| 1012 | importavano | indicativo | imperfetto | terza-persona | plurale | simple | imperfetto, simple | they mattered | they were importing |
| ... | (39 additional simple forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 1048 | importare | infinito | infinito-presente | - | - | simple | infinito-presente, simple | to matter | to import |
| 1049 | importante | participio | participio-presente | - | - | simple | participio-presente, simple | mattering | importing |
| 1050 | importato | participio | participio-passato | - | - | simple | participio-passato, simple | mattered | imported |
| 1051 | importando | gerundio | gerundio-presente | - | - | simple | gerundio-presente, simple | mattering | importing |

**Compound Forms with essere - "To Matter" Translation (17 forms - 3rd person + infinitive/participles):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1052 | è importato | indicativo | passato-prossimo | terza-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary | it has mattered | - |
| 1053 | sono importati | indicativo | passato-prossimo | terza-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary | they have mattered | - |
| 1054 | era importato | indicativo | trapassato-prossimo | terza-persona | singolare | compound | trapassato-prossimo, compound, essere-auxiliary | it had mattered | - |
| 1055 | erano importati | indicativo | trapassato-prossimo | terza-persona | plurale | compound | trapassato-prossimo, compound, essere-auxiliary | they had mattered | - |
| ... | (13 additional compound forms with essere - 3rd person only) | ... | ... | ... | ... | ... | ... | ... | ... |
| 1068 | essere importato | infinito | infinito-passato | - | - | compound | infinito-passato, compound, essere-auxiliary | to have mattered | - |

**Compound Forms with avere - "To Import" Translation (49 forms - all persons):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1069 | ho importato | indicativo | passato-prossimo | prima-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | - | I have imported |
| 1070 | hai importato | indicativo | passato-prossimo | seconda-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | - | you have imported |
| 1071 | ha importato | indicativo | passato-prossimo | terza-persona | singolare | compound | passato-prossimo, compound, avere-auxiliary | - | he/she has imported |
| 1072 | abbiamo importato | indicativo | passato-prossimo | prima-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | - | we have imported |
| 1073 | avete importato | indicativo | passato-prossimo | seconda-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | - | you have imported |
| 1074 | hanno importato | indicativo | passato-prossimo | terza-persona | plurale | compound | passato-prossimo, compound, avere-auxiliary | - | they have imported |
| ... | (43 additional compound forms with avere) | ... | ... | ... | ... | ... | ... | ... | ... |
| 1117 | aver importato | infinito | infinito-passato | - | - | compound | infinito-passato, compound, avere-auxiliary | - | to have imported |

**Progressive Forms - Restricted and Unrestricted (35 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1118 | sto importando | indicativo | presente-progressivo | prima-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | - | I am importing |
| 1119 | stai importando | indicativo | presente-progressivo | seconda-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | - | you are importing |
| 1120 | sta importando | indicativo | presente-progressivo | terza-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary | it is mattering | he/she is importing |
| 1121 | stiamo importando | indicativo | presente-progressivo | prima-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary | - | we are importing |
| 1122 | state importando | indicativo | presente-progressivo | seconda-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary | - | you are importing |
| 1123 | stanno importando | indicativo | presente-progressivo | terza-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary | they are mattering | they are importing |
| ... | (29 additional progressive forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 1152 | stando importando | gerundio | gerundio-progressivo | - | - | progressive | gerundio-progressivo, progressive, stare-auxiliary | being mattering | being importing |

**Form_Translations Coverage Analysis:**
- **Translation 1 ("To Matter")**: 25 form_translations (3rd person forms + infinitive/participle/gerund forms)  
  - Simple forms: 15 (only 3rd person + non-finite)
  - Compound forms: 17 (essere auxiliary, 3rd person only)
  - Progressive forms: 8 (only 3rd person + non-finite)
- **Translation 2 ("To Import")**: 135 form_translations (all forms covered)
  - Simple forms: 51 (all persons)  
  - Compound forms: 49 (avere auxiliary, all persons)
  - Progressive forms: 35 (all persons)
- **Total Coverage**: 160 form_translations across both meanings
- **Shared Forms**: 135 forms exist, but different coverage patterns create semantic precision

---

### Scenario G: Weather Verb - "piovere" (to rain) - Complete Form Inventory

#### Dictionary Entry
```sql
-- dictionary table
id: 220e8400-e29b-41d4-a716-446655440000
lemma: "piovere"  
word_type: "verb"
```

#### Word-Level Metadata
```sql
-- entity_type='word', entity_id=220e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "ere-conjugation"       (conjugation_type)
value_id → meta_values.value: "meteorological-verb"  (verb_type)
value_id → meta_values.value: "third-singular-only"   (number_restriction)
value_id → meta_values.value: "freq-top500"           (frequency_tier)
value_id → meta_values.value: "CEFR-A2"               (cefr_level)
```

#### Meta Attribute Integration for Weather Verb Status
```sql  
-- meta_attributes contains: attribute_name="verb_type", category="grammatical"
-- meta_values contains: value="meteorological-verb", stable_id="meteorological_verb", attribute_id=<verb_type_attr_id>
-- entity_meta_values links: entity_type='word', entity_id=<piovere_id>, value_id=<weather_verb_value_id>

-- Ultra-restrictive person limitation
-- meta_attributes contains: attribute_name="number_restriction", category="morphological"  
-- meta_values contains: value="third-singular-only", stable_id="third_singular_restriction"
```

#### Translation 1: "to rain" (literal meteorological)
```sql
-- word_translations table
id: 330e8400-e29b-41d4-a716-446655440001
word_id: 220e8400-e29b-41d4-a716-446655440000
translation: "to rain"
display_priority: 1
context_metadata: {
  "auxiliary": "essere",
  "usage": "meteorological", 
  "plurality": "third-singular-only"
}
```

#### Translation 2: "to rain down" (metaphorical usage)
```sql
-- word_translations table
id: 330e8400-e29b-41d4-a716-446655440002
word_id: 220e8400-e29b-41d4-a716-446655440000
translation: "to rain down"
display_priority: 2
context_metadata: {
  "auxiliary": "essere",
  "usage": "metaphorical",
  "plurality": "third-person-only"
}
```

#### Weather Verb Restrictions Explained
Weather verbs have the most restrictive person limitations:
- **Literal weather**: Only "it rains" (3rd person singular) - no plural
- **Metaphorical usage**: "they rain down" (3rd person plural allowed) for things falling like rain
- **No personal subjects**: Cannot say "I rain", "you rain" - semantically impossible
- **Atmospheric phenomena**: Subject is always understood as atmospheric conditions

#### Complete Form Inventory (39 Total Forms for Translation 1, 78 for Translation 2)

**Simple Forms - Third Person Singular Only for Literal Weather (17 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1201 | piove | indicativo | presente | terza-persona | singolare | simple | presente, simple, weather, third-singular-only | it rains | - |
| 1202 | pioveva | indicativo | imperfetto | terza-persona | singolare | simple | imperfetto, simple, weather, third-singular-only | it was raining | - |
| 1203 | piovve | indicativo | passato-remoto | terza-persona | singolare | simple | passato-remoto, simple, weather, third-singular-only | it rained | - |
| 1204 | pioverà | indicativo | futuro-semplice | terza-persona | singolare | simple | futuro-semplice, simple, weather, third-singular-only | it will rain | - |
| 1205 | piova | congiuntivo | congiuntivo-presente | terza-persona | singolare | simple | congiuntivo-presente, simple, weather, third-singular-only | (that) it rain | - |
| 1206 | piovesse | congiuntivo | congiuntivo-imperfetto | terza-persona | singolare | simple | congiuntivo-imperfetto, simple, weather, third-singular-only | (that) it rained | - |
| 1207 | pioverebbe | condizionale | condizionale-presente | terza-persona | singolare | simple | condizionale-presente, simple, weather, third-singular-only | it would rain | - |
| 1208 | piovere | infinito | infinito-presente | - | - | simple | infinito-presente, simple, weather | to rain | to rain down |
| 1209 | piovente | participio | participio-presente | - | - | simple | participio-presente, simple, weather | raining | raining down |
| 1210 | piovuto | participio | participio-passato | - | - | simple | participio-passato, simple, weather | rained | rained down |
| 1211 | piovendo | gerundio | gerundio-presente | - | - | simple | gerundio-presente, simple, weather | raining | raining down |

**Simple Forms - Third Person Plural for Metaphorical Usage Only (6 additional forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1212 | piovono | indicativo | presente | terza-persona | plurale | simple | presente, simple, weather, third-person-only | - | they rain down |
| 1213 | piovevano | indicativo | imperfetto | terza-persona | plurale | simple | imperfetto, simple, weather, third-person-only | - | they were raining down |
| 1214 | piovvero | indicativo | passato-remoto | terza-persona | plurale | simple | passato-remoto, simple, weather, third-person-only | - | they rained down |
| 1215 | pioveranno | indicativo | futuro-semplice | terza-persona | plurale | simple | futuro-semplice, simple, weather, third-person-only | - | they will rain down |
| 1216 | piovano | congiuntivo | congiuntivo-presente | terza-persona | plurale | simple | congiuntivo-presente, simple, weather, third-person-only | - | (that) they rain down |
| ... | (Additional metaphorical plural forms) | ... | ... | ... | ... | ... | ... | ... | ... |

**Compound Forms with essere - Singular Only for Literal Weather (11 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1218 | è piovuto | indicativo | passato-prossimo | terza-persona | singolare | compound | passato-prossimo, compound, essere-auxiliary, weather, third-singular-only | it has rained | - |
| 1219 | era piovuto | indicativo | trapassato-prossimo | terza-persona | singolare | compound | trapassato-prossimo, compound, essere-auxiliary, weather, third-singular-only | it had rained | - |
| 1220 | sarà piovuto | indicativo | futuro-anteriore | terza-persona | singolare | compound | futuro-anteriore, compound, essere-auxiliary, weather, third-singular-only | it will have rained | - |
| 1221 | sia piovuto | congiuntivo | congiuntivo-passato | terza-persona | singolare | compound | congiuntivo-passato, compound, essere-auxiliary, weather, third-singular-only | (that) it has rained | - |
| 1222 | fosse piovuto | congiuntivo | congiuntivo-trapassato | terza-persona | singolare | compound | congiuntivo-trapassato, compound, essere-auxiliary, weather, third-singular-only | (that) it had rained | - |
| 1223 | sarebbe piovuto | condizionale | condizionale-passato | terza-persona | singolare | compound | condizionale-passato, compound, essere-auxiliary, weather, third-singular-only | it would have rained | - |
| ... | (5 additional compound singular forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 1228 | essere piovuto | infinito | infinito-passato | - | - | compound | infinito-passato, compound, essere-auxiliary, weather | to have rained | to have rained down |

**Compound Forms - Plural for Metaphorical Usage (11 additional forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1229 | sono piovuti | indicativo | passato-prossimo | terza-persona | plurale | compound | passato-prossimo, compound, essere-auxiliary, weather, third-person-only | - | they have rained down |
| 1230 | erano piovuti | indicativo | trapassato-prossimo | terza-persona | plurale | compound | trapassato-prossimo, compound, essere-auxiliary, weather, third-person-only | - | they had rained down |
| ... | (9 additional compound plural forms) | ... | ... | ... | ... | ... | ... | ... | ... |

**Progressive Forms - Highly Limited (11 forms):**

| Form ID | Form Text | Mood | Tense | Person | Number | Variant Type | Meta Tags | Translation 1 Coverage | Translation 2 Coverage |
|---------|-----------|------|-------|--------|--------|-------------|-----------|----------------------|----------------------|
| 1240 | sta piovendo | indicativo | presente-progressivo | terza-persona | singolare | progressive | presente-progressivo, progressive, stare-auxiliary, weather, third-singular-only | it is raining | - |
| 1241 | stava piovendo | indicativo | passato-progressivo | terza-persona | singolare | progressive | passato-progressivo, progressive, stare-auxiliary, weather, third-singular-only | it was raining | - |
| 1242 | starà piovendo | indicativo | futuro-progressivo | terza-persona | singolare | progressive | futuro-progressivo, progressive, stare-auxiliary, weather, third-singular-only | it will be raining | - |
| ... | (5 additional progressive singular forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 1246 | stanno piovendo | indicativo | presente-progressivo | terza-persona | plurale | progressive | presente-progressivo, progressive, stare-auxiliary, weather, third-person-only | - | they are raining down |
| 1247 | stavano piovendo | indicativo | passato-progressivo | terza-persona | plurale | progressive | passato-progressivo, progressive, stare-auxiliary, weather, third-person-only | - | they were raining down |
| ... | (3 additional progressive plural forms) | ... | ... | ... | ... | ... | ... | ... | ... |
| 1250 | stando piovendo | gerundio | gerundio-progressivo | - | - | progressive | gerundio-progressivo, progressive, stare-auxiliary, weather | being raining | being raining down |

**Form_Translations Coverage Analysis:**
- **Translation 1 ("To Rain" - Literal)**: 39 form_translations
  - Simple forms: 17 (3rd singular + non-finite)
  - Compound forms: 11 (3rd singular + infinitive)
  - Progressive forms: 11 (3rd singular + non-finite)
- **Translation 2 ("To Rain Down" - Metaphorical)**: 28 form_translations  
  - Simple forms: 12 (3rd person both singular/plural + non-finite)
  - Compound forms: 11 (3rd person both numbers + infinitive)
  - Progressive forms: 5 (3rd person both numbers + non-finite)
- **Total Coverage**: 67 form_translations across both meanings
- **Most Restrictive**: Weather verbs have the smallest form coverage in the system

---

## Updated Coverage Calculations Summary

### Complete Form_Translation Coverage Matrix

| Verb Type | Scenario | Total Forms | Translation 1 Coverage | Translation 2 Coverage | Total Form_Translations |
|-----------|----------|-------------|----------------------|----------------------|----------------------|
| Normal | mangiare | 137 | 137 (all forms) | - | 137 |
| Reflexive | lavarsi | 137 | 137 (all forms) | 45 (plural only) | 182 |
| Dual Auxiliary | correre | 219* | 135 (shared + avere compounds) | 135 (shared + essere compounds) | 270 |
| Modal | dovere | 270** | 270 (all + modal patterns) | 135 (standard patterns only) | 405 |
| Defective | vigere | 67 | 67 (existing forms only) | - | 67 |
| Impersonal | importare | 135 | 25 (3rd person only) | 135 (all forms) | 160 |
| Weather | piovere | 67*** | 39 (3rd singular + non-finite) | 28 (3rd person + non-finite) | 67 |

**Notes:**
- *219 forms for correre: 51 shared simple + 35 shared progressive + 49 avere compounds + 49 essere compounds + 35 shared infinitive/participle/gerund
- **270 forms for dovere: 135 standard + 135 modal pattern variants
- ***67 forms for piovere: Heavily reduced due to weather verb restrictions

### Meta Attribute Integration Patterns

| Verb Type | Primary Meta Attribute | Additional Restrictions | Storage Location |
|-----------|----------------------|----------------------|-----------------|
| Normal | conjugation_type: "are-conjugation" | None | entity_meta_values |
| Reflexive | verb_type: "direct-reflexive" | usage: "direct-reflexive"/"reciprocal" | entity_meta_values + context_metadata |
| Dual Auxiliary | verb_type: "transitive-verb" | Derived from translation auxiliaries | entity_meta_values + context_metadata |
| Modal | verb_type: "modal-verb" | modal_pattern: "modal + infinitive" | entity_meta_values |
| Defective | verb_type: "defective-verb" | number_restriction: "missing-first-second-person" | entity_meta_values |
| Impersonal | verb_type: "impersonal-verb" | number_restriction: "third-person-only" | entity_meta_values |
| Weather | verb_type: "meteorological-verb" | number_restriction: "third-singular-only" | entity_meta_values |

This comprehensive expansion demonstrates how the Misti verb forms architecture handles the full spectrum of Italian verb complexity through systematic form materialization, metadata integration, and coverage validation.

---

## Architecture Summary

The Misti verb forms system represents a sophisticated **materialization-centric architecture** that pre-computes and stores every verb form students need, rather than generating them on demand. This approach prioritizes accuracy, performance, and pedagogical control over computational elegance.

**Key Architectural Principles**:

1. **Complete Materialization**: All forms (simple, compound, progressive) are pre-stored with complete metadata
2. **Translation-Centric Design**: Auxiliary selection and usage constraints are specified at the meaning level, not the word level
3. **Normalized Tagging**: All metadata stored via entity_meta_values system, eliminating array-based storage
4. **Dual Translation Requirement**: Reflexive verbs must have both direct reflexive and reciprocal translations
5. **Restriction-Aware Coverage**: Form_translations respect number/person restrictions from meta attributes
6. **Universal Terminology**: Language-agnostic internal representation enables multi-language interfaces
7. **Validation-First**: Comprehensive compliance checking ensures data quality at all architectural layers

This system successfully handles the full complexity of Italian verb conjugation while maintaining the flexibility needed for effective language learning applications.
