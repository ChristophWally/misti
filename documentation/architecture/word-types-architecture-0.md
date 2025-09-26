# Misti Dictionary - Word Types Architecture

> **Comprehensive Guide to Word Type Implementation and Logic**
>
> This document outlines the complete architecture for handling all Italian word types in the Misti dictionary system, from the currently implemented types to planned expansions.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Universal Metadata System](#2-universal-metadata-system)
3. [Complete Meta Values Reference](#3-complete-meta-values-reference)
4. [Currently Implemented Word Types](#4-currently-implemented-word-types)
5. [Planned Word Types](#5-planned-word-types)
   - 5.1 [Preposition](#51-preposition)
   - 5.2 [Determiner](#52-determiner)
   - 5.3 [Conjunction](#53-conjunction)
   - 5.4 [Pronoun](#54-pronoun)
   - 5.5 [Interjections](#55-interjections)
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

## 3. Complete Meta Values Reference

This section provides comprehensive documentation of all metadata attributes and their values based on the actual database schema and usage patterns in the Misti dictionary system.

### 3.1 Universal Attributes (Applied to All Word Types)

#### CEFR Level (`metaattr003`)
**Purpose**: Learning difficulty classification based on Common European Framework of Reference for Languages
**Source Level**: word
**Display Level**: word
**Database Usage**: 24 words assigned (A1: 11, A2: 4, others: 1 each)

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `A1` | A1 | Beginner level - basic everyday expressions | 11 |
| `A2` | A2 | Elementary level - basic personal information | 4 |
| `B1` | B1 | Intermediate level - familiar topics | 1 |
| `B2` | B2 | Upper intermediate level - complex topics | 1 |
| `C1` | C1 | Advanced level - wide range of topics | 1 |
| `C2` | C2 | Proficiency level - near-native competence | 1 |
| `native` | NAT | Native speaker vocabulary | 1 |
| `academic` | ACAD | Academic or specialized terminology | 1 |
| `literary` | LIT | Literary or classical usage | 1 |
| `specialized` | SPEC | Technical or domain-specific terms | 1 |
| `business` | BIZ | Business and professional vocabulary | 1 |
| `regional` | REG | Regional or dialectal usage | 1 |

#### Frequency Tier (`metaattr007`)
**Purpose**: Usage frequency ranking for learning priority
**Source Level**: word
**Display Level**: word
**Database Usage**: 20 words assigned across all tiers

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `top100` | T100 | Most common 100 words | 7 |
| `top500` | T500 | Most common 500 words | 7 |
| `top1000` | T1K | Most common 1000 words | 3 |
| `top2500` | T2.5K | Most common 2500 words | 1 |
| `top5000` | T5K | Most common 5000 words | 1 |
| `top10000` | T10K | Most common 10000 words | 1 |

#### Irregular Forms (`metaattr005`)
**Purpose**: Form deviates from conjugation pattern
**Source Level**: form
**Display Level**: word
**Database Usage**: 137 forms marked as irregular

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `irregular` | irreg | Form deviates from conjugation pattern | 137 |

#### Interrogative Function (`metaattr056`)
**Purpose**: Cross-word-type attribute marking words that function as question words
**Source Level**: word
**Display Level**: word
**Database Usage**: Applied to interrogative pronouns, adjectives, and adverbs for cross-filtering

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `interrogative` | INTER | Marks words that form questions: chi (who), cosa (what), come (how), quando (when), dove (where), quale (which), quanto (how much) | TBD |

### 3.2 Verb-Specific Attributes

#### Auxiliary Verb (`metaattr002`)
**Purpose**: Auxiliary verb for compound tenses
**Source Level**: translation
**Display Level**: word
**Database Usage**: 23 translations assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `avere` | AVERE | Uses auxiliary verb avere: ho parlato | 13 |
| `essere` | ESSERE | Uses auxiliary verb essere: sono andato | 10 |

#### Conjugation Type (`metaattr004`)
**Purpose**: Basic conjugation pattern family
**Source Level**: word
**Display Level**: word
**Database Usage**: 13 words classified

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `are` | ARE | First conjugation: parlare, amare | 6 |
| `ere` | ERE | Second conjugation: credere, vendere | 3 |
| `ire` | IRE | Third conjugation: dormire, partire | 2 |
| `ire-isc` | ISCO | Third conjugation with -isc-: finire, capire | 2 |

#### Mood (`metaattr010`)
**Purpose**: Primary grammatical categorization
**Source Level**: form
**Display Level**: form
**Database Usage**: 606 forms assigned across all moods

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `indicativo` | IND | Indicative mood - statements of fact | 358 |
| `congiuntivo` | CONG | Subjunctive mood - doubt, emotion, opinion | 133 |
| `condizionale` | COND | Conditional mood - hypothetical situations | 60 |
| `imperativo` | IMP | Imperative mood - commands | 29 |
| `gerundio` | GER | Gerund mood - verbal noun | 9 |
| `infinito` | INF | Infinitive mood - unconjugated verb form | 9 |
| `participio` | PART | Participle mood - verbal adjective | 8 |

#### Tense (`metaattr019`)
**Purpose**: Specific temporal/aspectual identification
**Source Level**: form
**Display Level**: form
**Database Usage**: 606 forms with detailed tense assignments

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `presente` | PRES | Present indicative: io parlo | 40 |
| `presente-progressivo` | PPROG | Present progressive: io sto parlando | 36 |
| `condizionale-presente` | CONDPRES | Present conditional: io parlerei | 36 |
| `passato-prossimo` | PP | Present perfect: io ho parlato | 36 |
| `passato-remoto` | PREM | Simple past: io parlai | 36 |
| `imperfetto` | IMPF | Imperfect indicative: io parlavo | 36 |
| `futuro-semplice` | FUT | Simple future: io parlerò | 36 |
| `congiuntivo-presente` | CPRES | Present subjunctive: che io parli | 36 |
| `congiuntivo-imperfetto` | CIMPF | Imperfect subjunctive: che io parlassi | 36 |
| `imperativo-presente` | IMPPRES | Present imperative: parla!, parlate! | 31 |
| `trapassato-prossimo` | TPP | Past perfect: io avevo parlato | 30 |
| `imperfetto-progressivo` | IPROG | Past progressive: io stavo parlando | 30 |
| `futuro-anteriore` | FA | Future perfect: io avrò parlato | 30 |
| `condizionale-passato` | CONDPASS | Past conditional: io avrei parlato | 30 |
| `congiuntivo-passato` | CPASS | Present perfect subjunctive: che io abbia parlato | 25 |
| `trapassato-remoto` | TR | Past anterior: io ebbi parlato | 24 |
| `congiuntivo-trapassato` | CTRAP | Past perfect subjunctive: che io avessi parlato | 24 |
| `futuro-progressivo` | FPROG | Future progressive: io starò parlando | 24 |
| `participio-passato` | PARTPASS | Past participle: parlato | 7 |
| `gerundio-presente` | GERPRES | Present gerund: parlando | 6 |
| `infinito-presente` | INFPRES | Present infinitive: parlare | 6 |
| `infinito-passato` | INFPASS | Past infinitive: avere parlato | 5 |
| `gerundio-passato` | GERPASS | Past gerund: avendo parlato | 5 |
| `participio-presente` | PARTPRES | Present participle: parlante | 5 |

#### Person (`metaattr014`)
**Purpose**: Subject person classification
**Source Level**: form
**Display Level**: form
**Database Usage**: 591 forms assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `seconda-persona` | 2P | Second person - tu, voi | 202 |
| `terza-persona` | 3P | Third person - lui/lei, loro | 196 |
| `prima-persona` | 1P | First person - io, noi | 193 |

#### Transitivity (`metaattr020`)
**Purpose**: Can take direct objects
**Source Level**: translation
**Display Level**: word
**Database Usage**: 13 translations assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `transitive` | TRANS | Can take direct objects: vedere qualcosa | 5 |
| `intransitive` | INTRANS | Cannot take direct objects: andare | 4 |
| `ambitransitive` | AMBI | Can be used transitively or intransitively | 4 |

#### Reflexive (`metaattr017`)
**Purpose**: Requires reflexive pronouns (lavare vs lavarsi)
**Source Level**: word
**Display Level**: word
**Database Usage**: 107 words assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `reflexive` | refl | Requires reflexive pronouns (lavare vs lavarsi) | 107 |

#### Verb Type (`metaattr021`)
**Purpose**: Comprehensive verb classification including reflexive, modal, impersonal, and grammatical types
**Source Level**: translation
**Display Level**: translation
**Database Usage**: 3 translations assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `meteorological-verb` | - | Weather verbs: piovere (rain), nevicare (snow), grandinare (hail) - third person singular only | 1 |
| `direct-reflexive` | DIR_REFL | Action on oneself: mi lavo (I wash myself) | 1 |
| `reciprocal` | RECIP | Mutual action: ci laviamo (we wash each other) | 1 |
| `modal-verb` | - | Modal auxiliary verbs: dovere (must), potere (can), volere (want), sapere (know how) | 0 |
| `impersonal-verb` | - | Impersonal verbs: importare (matter), bisognare (need), servire (be needed) - used without specific subject | 0 |
| `defective-verb` | - | Defective verbs: vigere (be in force), solere (be accustomed), vertere (turn) - missing some forms | 0 |

#### Verb Form Type (`metaattr022`)
**Purpose**: Construction method classification
**Source Level**: form
**Display Level**: form
**Database Usage**: 629 forms assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `simple` | SIMP | Single-word forms: parlo, parlavo | 323 |
| `compound` | COMP | Auxiliary + participle: ho parlato | 216 |
| `progressive` | PROG | Stare + gerund: sto parlando | 90 |

### 3.3 Noun-Specific Attributes

#### Noun Gender (`metaattr011`)
**Purpose**: Inherent grammatical gender of nouns
**Source Level**: word
**Display Level**: word
**Database Usage**: 6 words assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `masculine` | M | Masculine grammatical gender (il tavolo) | 3 |
| `feminine` | F | Feminine grammatical gender (la tavola) | 2 |
| `common-gender` | C | Can be either masculine or feminine | 1 |

#### Number (`metaattr012`)
**Purpose**: Singular/plural distinction
**Source Level**: form
**Display Level**: word
**Database Usage**: 603 forms assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `singolare` | SG | Singular number | 302 |
| `plurale` | PL | Plural number | 301 |

#### Number Restriction (`metaattr013`)
**Purpose**: Grammatical restrictions on number, person, or mood usage
**Source Level**: word
**Display Level**: word
**Database Usage**: 4 words with restrictions

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `plural-only` | SOLO_PL | Used only in plural form | 2 |
| `singular-only` | SOLO_SG | Used only in singular form | 1 |
| `third-singular-only` | - | Used only in third person singular (meteorological verbs like piovere) | 1 |
| `third-person-only` | - | Used only in third person (impersonal verbs like importare) | 0 |
| `missing-first-second-person` | - | Missing first and second person forms (defective verbs like vigere) | 0 |
| `missing-imperative` | - | Cannot form imperative commands (defective verbs like solere) | 0 |

#### Plural Formation (`metaattr026`)
**Purpose**: Italian noun pluralization pattern classification for standard formations
**Source Level**: word
**Display Level**: word
**Database Usage**: 5 words assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `plural-e` | PL_E | Feminine -a ending nouns → -e plural formation (casa → case) | 3 |
| `plural-i` | PL_I | Masculine -o ending nouns → -i plural formation (libro → libri) | 2 |

### 3.4 Adjective-Specific Attributes

#### Form Pattern (`metaattr006`)
**Purpose**: Agreement form variations for adjectives
**Source Level**: word
**Display Level**: word
**Database Usage**: 4 words assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `form-4` | 4F | Full agreement: rosso/rossa/rossi/rosse | 2 |
| `form-2` | 2F | Limited agreement: grande/grandi | 2 |

#### Gradable (`metaattr009`)
**Purpose**: Can form comparative/superlative forms
**Source Level**: word
**Display Level**: word
**Database Usage**: 5 words assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `full-gradability` | GRAD_BOTH | Can form both analytical and synthetic comparatives: più bello, bellissimo | 3 |
| `analytical-gradability` | ANALYT | Can form analytical comparatives with più/meno: più intelligente | 1 |
| `non-gradable` | NONGRAD | Cannot form comparatives: morto, perfetto | 1 |

#### Gender Usage (`metaattr008`)
**Purpose**: Gender restriction for this specific meaning
**Source Level**: translation
**Display Level**: translation
**Database Usage**: 3 translations assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `male-only` | M_ONLY | Translation only applies to males: handsome (bello) | 2 |
| `female-only` | F_ONLY | Translation only applies to females | 1 |

### 3.5 Adverb-Specific Attributes

#### Adverb Type (`metaattr001`)
**Purpose**: Semantic/syntactic categorization of adverbs
**Source Level**: word
**Display Level**: word
**Database Usage**: 10 words assigned across all types

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `manner` | MAN | How something is done: velocemente, bene | 2 |
| `negation` | NEG | Negative constructions: non, niente, nessuno | 1 |
| `affirmation` | AFF | Confirmation: sì, certamente | 1 |
| `quantity` | QUANT | How much: molto, poco | 1 |
| `doubt` | DOUBT | Uncertainty: forse, probabilmente | 1 |
| `emphasis` | EMPH | Amplification/certainty: assolutamente, certamente | 1 |
| `evaluation` | EVAL | Speaker judgment/opinion: fortunatamente, purtroppo | 1 |
| `place` | PLACE | Where something happens: qui, là | 1 |
| `frequency` | FREQ | How often: spesso, mai | 1 |
| `time` | TIME | When something happens: oggi, sempre | 1 |

#### Adverb Government (`metaattr055`)
**Purpose**: Indicates which preposition (if any) the adverb governs in prepositional constructions
**Source Level**: word
**Display Level**: word
**Database Usage**: New attribute for systematic adverb-preposition patterns

**SQL Requirements**:
```sql
-- ADD TO meta_attributes table
INSERT INTO meta_attributes (id, stable_id, name, display_name, description, source_level, display_level)
VALUES (
  gen_random_uuid(),
  'metaattr055',
  'adverb_government',
  'Adverb Government',
  'Indicates which preposition (if any) the adverb governs in prepositional constructions',
  'word',
  'word'
);

-- ADD TO meta_values table
INSERT INTO meta_values (id, attribute_id, stable_id, value, shorthand, description) VALUES
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr055'), 'metaattr055val001', 'governs_a', 'GOV_A', 'Forms constructions with preposition "a": davanti a, dietro a'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr055'), 'metaattr055val002', 'governs_di', 'GOV_DI', 'Forms constructions with preposition "di": prima di, dopo di'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr055'), 'metaattr055val003', 'governs_da', 'GOV_DA', 'Forms constructions with preposition "da": lontano da'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr055'), 'metaattr055val004', 'invariable', 'INVAR', 'Cannot form prepositional constructions: qui, là, oggi, ieri');
```

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `governs_a` | GOV_A | Forms constructions with preposition "a": davanti a, dietro a | 0 |
| `governs_di` | GOV_DI | Forms constructions with preposition "di": prima di, dopo di | 0 |
| `governs_da` | GOV_DA | Forms constructions with preposition "da": lontano da | 0 |
| `invariable` | INVAR | Cannot form prepositional constructions: qui, là, oggi, ieri | 0 |

### 3.6 Standardized Functional Form Types

The misti system uses consistent functional form types that describe grammatical function:

#### **Core Form Types:**
- **`conjugation`** - All verb forms (finite and non-finite)
  - Uses `form_mood`, `form_tense`, `form_person` attributes for specifics
  - Examples: parlo, parlava, parlare, parlando, parlato

- **`number`** - All noun number forms
  - Uses `form_number` attribute: 'singular' or 'plural'
  - Examples: libri (plural of libro), forbice (singular of forbici)

- **`agreement`** - All adjective gender/number agreement forms
  - Uses `form_gender`, `form_number` metadata for specifics
  - Examples: bella, belli, belle (forms of bello)

- **`contraction`** - All preposition contracted forms
  - Uses `form_gender`, `form_number` metadata for article agreement
  - Examples: del, alla, nei (contractions of di, a, in + articles)

- **`expression`** - All interjection expression forms
  - Uses `expression_variant` attribute: 'base', 'exclamatory', 'lengthened', 'questioning', 'capitalized'
  - Examples: ah!, aaah, eh? (variants of ah, eh)

#### **Architectural Consistency:**
- **form_type** = Core grammatical function
- **Attributes** = Specific variants within that function
- **Metadata** = Gender/number/other linguistic properties

### 3.7 Universal Translation-Level Attributes

#### Position (`metaattr016`)
**Purpose**: Position preference for adjectives and adverbs
**Source Level**: translation
**Display Level**: translation
**Database Usage**: 11 translations assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `before/after` | POS_BOTH | Can appear in either position | 5 |
| `after` | AFTER | Typically appears after the noun/verb | 5 |
| `before` | BEFORE | Typically appears before the noun/verb | 1 |

#### Register (`metaattr018`)
**Purpose**: Social context appropriateness
**Source Level**: translation
**Display Level**: translation
**Database Usage**: 42 translations assigned

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `neutral` | R_NEUT | Standard register, neither formal nor informal | 36 |
| `formal` | FORM | Appropriate for formal/academic contexts | 4 |
| `casual` | CASU | Casual/colloquial usage | 2 |
| `mixed` | MIX | Used in both formal and informal contexts | 0 |

### 3.8 Optional Tags System

#### Optional Tags (`metaattr_optional_tag`)
**Purpose**: Unified optional contextual metadata tags applicable at any level - consolidates form, translation, and word optional tags
**Source Level**: word
**Display Level**: word
**Database Usage**: 47 different optional tags used

**Most Used Optional Tags**:
- `source-original-dictionary` (6 uses) - Migrated from word_translations.optional_tags array
- `usage-primary` (6 uses) - Migrated from word_translations.optional_tags array
- `semantic-type-aesthetic-quality` (4 uses) - Migrated from word_translations.optional_tags array
- `test_translation` (3 uses) - Migrated from word_translations.optional_tags array
- `voice:active` (2 uses) - Optional tag: voice:active
- `formality:informal` (2 uses) - Optional tag: formality:informal
- `certainty:high` (2 uses) - Optional tag: certainty:high

**Tag Categories Include**:
- **Confidence levels**: `confidence-high`, `confidence-medium`
- **Contexts**: `academic_context`, `technical_context`, `context-meeting-people`, `context-leaving`
- **Semantic domains**: `semantic-domain-architecture`, `semantic-domain-family`
- **Semantic types**: `semantic-type-aesthetic-quality`, `semantic-type-emotional-positive`, `semantic-type-general-positive`, `semantic-type-quality-assessment`
- **Topics**: `topic-abstract`, `topic-daily-life`, `topic-place`
- **Testing/Development**: `test_translation`, `test_form`, `test_data`, `edge_case_testing`
- **Quality markers**: `verified_quality`, `common_usage`, `regular_pattern`
- **Voice and formality**: `voice:active`, `formality:informal`, `certainty:high`

---

## 4. Currently Implemented Word Types

### 4.1 VERB

**Implementation Status**: ✅ **Fully Implemented**

**Architecture Summary**:
The verb system represents the most complex word type implementation, serving as the template for sophisticated form handling.

> **📋 Detailed Technical Documentation**: For comprehensive details on verb forms, conjugation patterns, auxiliary systems, and form-translation architecture, see the [Verb Forms System Architecture](./verb-forms-system-architecture.md) documentation.

**Word-Level Metadata** *(see [Section 3.2](#32-verb-specific-attributes) for complete value descriptions)*:
- `metaattr004` - **Conjugation Type**: `are` (6 uses), `ere` (3 uses), `ire` (2 uses), `ire-isc` (2 uses)
- `metaattr017` - **Reflexive**: `reflexive` (107 words) - for inherently reflexive verbs like "lavarsi"

**Translation-Level Metadata** *(see [Section 3.2](#32-verb-specific-attributes) for complete value descriptions)*:
- `metaattr002` - **Auxiliary Verb**: `avere` (13 uses), `essere` (10 uses) - for compound tenses
- `metaattr020` - **Transitivity**: `transitive` (5 uses), `intransitive` (4 uses), `ambitransitive` (4 uses)
- `metaattr021` - **Verb Type**: `direct-reflexive` (1 use), `reciprocal` (1 use), `meteorological-verb` (1 use)
- `metaattr018` - **Register**: `neutral` (36 uses), `formal` (4 uses), `casual` (2 uses) - see [Section 3.7](#37-universal-translation-level-attributes)

**Form-Level Metadata** *(see [Section 3.2](#32-verb-specific-attributes) for complete value descriptions)*:
- `metaattr010` - **Mood**: `indicativo` (358 forms), `congiuntivo` (133 forms), `condizionale` (60 forms), `imperativo` (29 forms), `gerundio` (9 forms), `infinito` (9 forms), `participio` (8 forms)
- `metaattr019` - **Tense**: 27 distinct tenses from `presente` (40 forms) to specialized forms like `gerundio-passato` (5 forms)
- `metaattr014` - **Person**: `seconda-persona` (202 forms), `terza-persona` (196 forms), `prima-persona` (193 forms)
- `metaattr012` - **Number**: `singolare` (302 forms), `plurale` (301 forms) - see [Section 3.3](#33-noun-specific-attributes)
- `metaattr022` - **Verb Form Type**: `simple` (323 forms), `compound` (216 forms), `progressive` (90 forms)

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

> **📋 Complete Technical Documentation**: For comprehensive implementation details including word-level architecture, complete SQL examples, form relationships, translation strategies, and educational integration, see [**VERB Complete Implementation Guide**](./word-types-architecture-1-verbs.md).
---

### 4.2 NOUN

**Implementation Status**: ✅ **Production-Ready - Comprehensive Implementation**

**Architecture Summary**:
The noun system provides sophisticated handling of common nouns and proper nouns with comprehensive metadata classification, algorithmic article generation, and educational progression support. The system includes 4 new specialized noun attributes and complete implementation coverage.

> **📋 Detailed Technical Documentation**: For comprehensive implementation details including complete SQL specifications, metadata architecture, article generation algorithms, and educational integration, see [**Noun Complete Implementation Guide**](./word-types-architecture-2-nouns.md).

**New Noun-Specific Metadata (4 New Attributes)**:
- `metaattr028` - **Noun Type**: `common` (general categories), `proper` (specific entities) - fundamental noun classification
- `metaattr029` - **Proper Noun Type**: `person`, `place`, `organization`, `work`, `brand` - semantic proper noun categorization
- `metaattr030` - **Count Mass**: `count` (enumerable: libro → libri), `mass` (continuous: acqua, coraggio) - countability classification
- `metaattr031` - **Article Pattern**: `definite-required` (la casa), `no-article` (Marco, Roma), `optional` (a casa, in città) - usage patterns

**Existing Metadata Integration** *(see [Section 3.3](#33-noun-specific-attributes) for complete value descriptions)*:
- `metaattr011` - **Noun Gender**: `masculine`, `feminine`, `common-gender` - inherent grammatical gender for article agreement
- `metaattr026` - **Plural Formation**: `plural-i` (masculine: libro → libri), `plural-e` (feminine: casa → case) - standard formation patterns
- `metaattr013` - **Number Restriction**: `singular-only` (mass nouns), `plural-only` (defective nouns) - morphological constraints

**Translation-Level Metadata** *(see [Section 3.7](#37-universal-translation-level-attributes) for complete value descriptions)*:
- `metaattr018` - **Register**: `neutral`, `formal`, `casual` - formality level for specific meanings
- `metaattr_optional_tag` - **Optional Topic Tags**: Cultural and semantic domain classification - see [Section 3.8](#38-optional-tags-system)

**Forms Storage Strategy**:
**Common Nouns**: Minimal forms storage - articles and regular plurals calculated algorithmically on frontend using gender and phonetic conditioning rules for optimal educational value.

**Proper Nouns**: Generally invariable with strategic forms storage only for irregular cases:
```sql
-- Standard proper nouns: base form only
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(roma_id, 'Roma', 'base'),
(marco_id, 'Marco', 'base');

-- Special cases with plural or variant forms
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(stati_uniti_id, 'Stati Uniti', 'plural_irregular'),
(alpi_id, 'Alpi', 'plural_irregular');
```

**Advanced Article Generation System**:
- **Definite Articles**: Sophisticated phonetic conditioning (il/lo/la/i/gli/le) based on initial consonant clusters, vowels, and special cases
- **Indefinite Articles**: Complete coverage (un/uno/una/un') with elision rules and phonetic patterns
- **Article Pattern Integration**: Metadata-driven article requirement classification for educational accuracy

**Algorithmic Article Generation Logic**:
```javascript
// Advanced article generation with phonetic conditioning
calculateDefiniteArticle(word, gender, isPlural) {
  const firstChar = word.charAt(0).toLowerCase();
  const firstTwo = word.substring(0, 2).toLowerCase();

  const specialConsonantClusters = ['sc', 'sp', 'st', 'sb', 'sf', 'sg', 'sl', 'sm', 'sn', 'sr', 'ss', 'sw', 'ps', 'pn', 'x', 'z', 'gn'];
  const requiresLo = /^[aeiou]/.test(firstChar) || specialConsonantClusters.some(cluster => firstTwo.includes(cluster));

  if (gender === 'masculine') {
    return isPlural ? (requiresLo ? 'gli' : 'i') : (requiresLo ? 'lo' : 'il');
  } else {
    return isPlural ? 'le' : (/^[aeiou]/.test(firstChar) ? "l'" : 'la');
  }
}
```

**Implementation Statistics**:
- **16 comprehensive example entries** across common and proper noun categories
- **4 new metadata attributes** with complete value specifications
- **12 new metadata values** covering all noun classification needs
- **Complete CEFR progression** from A1 essential nouns to B2 cultural concepts
- **Frequency-based learning order** optimizing high-impact vocabulary acquisition

**Educational Integration**:
- **Progressive Learning Support**: CEFR classification from A1 basic nouns (casa, libro) to B2 cultural proper nouns (Divina Commedia)
- **Frequency-Driven Presentation**: Essential vocabulary prioritized through frequency tier classification
- **Cultural Context Integration**: Proper noun metadata supports cultural competence development
- **Systematic Article Instruction**: Algorithmic generation teaches Italian phonetic conditioning rules

**Frontend Features**:
- **Advanced Article Display**: Shows all appropriate articles with phonetic explanations
- **Plural Formation Preview**: Displays expected plural with formation pattern indication
- **Comprehensive Gender Indicators**: Visual ♂/♀/⚥ symbols with article pattern context
- **Noun Type Classification**: Clear distinction between common/proper with subcategory display
- **Count/Mass Distinction**: Educational indicators for countability patterns
- **Essential vs. Detailed Tags**: Gender, article pattern, and CEFR prominently displayed; register and cultural context in detailed view

> **🎯 Production Status**: The noun system represents a fully implemented, production-ready architecture with sophisticated metadata classification, algorithmic article generation following authentic Italian phonetic rules, and comprehensive educational progression support. All components are ready for immediate deployment with complete SQL implementation specifications.
```

---

### 4.3 ADJECTIVE

**Implementation Status**: ✅ **Fully Implemented - Production-Ready Architecture**

**Architecture Summary**:
The adjective system provides comprehensive handling of Italian adjectives with sophisticated metadata classification, agreement patterns, and educational progression support. The implementation covers two major adjective categories with complete form paradigms and systematic position-based translation strategies.

> **📋 Detailed Technical Documentation**: For comprehensive implementation details including complete SQL specifications, metadata architecture, form generation patterns, and educational integration, see [**Italian Adjective Architecture - Complete Implementation Guide**](./word-types-architecture-3-adjectives.md).

**Two Major Categories**:
1. **Qualitative Adjectives** (16 base entries) - Descriptive adjectives expressing inherent qualities (bello, grande, rosso, piccolo, buono, nuovo, giovane, vecchio, blu, verde, italiano, francese) with full agreement paradigms
2. **Fixed Comparative Adjectives** (8 base entries) - Pre-comparative forms with independent meanings (superiore, maggiore, inferiore, minore, anteriore, posteriore, esteriore, interiore) that cannot take further comparative constructions

**Word-Level Metadata** *(see [Section 3.4](#34-adjective-specific-attributes) for complete value descriptions)*:
- `metaattr030` - **Adjective Type**: `qualitative` (16 words), `fixed-comparative` (8 words) - fundamental category classification for educational distinction and grammatical competence
- `metaattr009` - **Gradable**: `true` (qualitative adjectives), `false` (fixed comparatives) - comparative/superlative capability with grammatical accuracy
- `metaattr006` - **Form Pattern**: `4-form` (masculine/feminine distinction), `2-form` (common gender), `invariant` (no agreement) - systematic agreement pattern classification
- `metaattr011` - **Noun Gender**: inherited for agreement purposes - see [Section 3.3](#33-noun-specific-attributes)
- `metaattr056` - **Interrogative Function**: Cross-word-type attribute marking interrogative adjectives (quale, quanto) for filtering and grouping

**Translation-Level Metadata** *(see [Section 3.4](#34-adjective-specific-attributes) and [Section 3.7](#37-universal-translation-level-attributes) for complete value descriptions)*:
- `metaattr008` - **Gender Usage**: `male-only` (2 translations), `female-only` (1 translation) - gender-specific meanings like "handsome" (bello)
- `metaattr016` - **Position**: `before/after` (5 uses), `after` (5 uses), `before` (1 use) - placement relative to noun
- `metaattr018` - **Register**: `neutral`, `formal`, `casual` - formality level for specific meanings

**Forms Storage Strategy**:
Complete forms storage for all adjectives due to complexity of agreement patterns, position-dependent meanings, and high frequency usage. All gender/number combinations are stored as searchable entries in `word_forms` table:
- **4-Form Pattern**: Complete masculine/feminine × singular/plural coverage (bello/bella/belli/belle)
- **2-Form Pattern**: Singular/plural coverage with common gender (grande/grandi)
- **Invariant Pattern**: No agreement forms needed (blu remains unchanged)

**Agreement Form Coverage**: 32+ agreement forms total with complete gender/number metadata for each form

**Interrogative Adjectives**:
Italian interrogative adjectives form questions about identity, quantity, and selection:
- **quale/quali** (which) - selection interrogation: "Quale libro?" (Which book?)
- **quanto/quanta/quanti/quante** (how much/many) - quantity interrogation: "Quanta acqua?" (How much water?)

These adjectives are marked with `interrogative_function: interrogative` for cross-word-type filtering while maintaining their adjective classification and agreement patterns.

**Exclamatory Usage of Adjectives**:
Many Italian adjectives can be used exclamatorily to express strong reactions, surprise, or evaluation. When used in this context, they function grammatically as adjectives but serve pragmatic functions similar to interjections:

**Evaluative Exclamations**:
- **esatto!** (exactly!/correct!) - evaluative adjective: "Esatto! È proprio così!" (Exactly! That's exactly right!)
- **incredibile!** (incredible!/unbelievable!) - surprise adjective: "Incredibile che sia già finito!" (Incredible that it's already finished!)
- **assurdo!** (absurd!/ridiculous!) - negative evaluation: "Assurdo! Non ci posso credere!" (Absurd! I can't believe it!)

**Usage Notes**:
- These adjectives maintain their grammatical properties (agreement, gradability) even in exclamatory contexts
- Distinguished from true interjections by their ability to modify nouns: "Una situazione incredibile!" (An incredible situation!)
- Can form comparative and superlative constructions: "È incredibilissimo!" (It's extremely incredible!)
- Register varies from neutral (esatto) to informal (incredibile, assurdo) depending on context

**Implementation Statistics**:
- **24 total base entries** across two adjective categories
- **32+ agreement forms** with complete gender/number metadata
- **Complete metadata coverage** for all critical linguistic attributes
- **Systematic agreement generation** following mandatory Italian grammar rules
- **Educational progression** from A1 basic adjectives to B1 advanced constructions
- **Position-sensitive translations** supporting advanced comprehension

**Educational Integration**:
- **Progressive Learning Support**: CEFR classification from A1 basic adjectives (bello, grande, rosso) to B1 advanced forms (superiore, maggiore)
- **Frequency-Driven Presentation**: Essential vocabulary prioritized through frequency tier classification (top100-top2500)
- **Agreement Pattern Instruction**: Systematic 4-form and 2-form pattern recognition for grammatical competence
- **Position-Based Translation**: Pre-nominal vs. post-nominal meaning differences captured in context-dependent translations

**Frontend Features**:
- **Adjective Type Classification**: Clear distinction between qualitative/fixed-comparative with educational explanations
- **Agreement Preview**: Complete gender/number paradigm display with pattern recognition
- **Gradability Indicators**: Shows comparative/superlative capability with grammatical accuracy
- **Position-Sensitive Display**: Pre-nominal vs. post-nominal meaning variations
- **Essential vs. Detailed Tags**: Adjective type, gradability, and agreement pattern prominently displayed; register and position in detailed view

---

### 4.4 ADVERB

**Implementation Status**: ✅ **Fully Implemented - Comprehensive 13-Category Architecture**

**Architecture Summary**:
The adverb system provides comprehensive coverage of Italian adverbs with sophisticated semantic classification, government patterns, and cross-word-type features. The implementation encompasses four major functional categories with 13 total subcategories, systematic government pattern integration, and advanced educational progression support.

> **📋 Detailed Technical Documentation**: For comprehensive implementation details including complete SQL specifications, all 13 categories, government pattern systems, and educational integration, see [**Italian Adverb Architecture - Complete Implementation Guide**](./word-types-architecture-4-adverbs.md).

**Four Major Categories with 13 Subcategories**:
1. **Semantic Adverbs** (10 subcategories) - Content adverbs expressing manner, time, place, quantity, frequency, affirmation, negation, evaluation, emphasis, doubt
2. **Conjunctive Adverbs** - Discourse-connecting adverbs (tuttavia, infatti, dunque, pertanto) that link clauses and provide logical relationships
3. **Exclamative Adverbs** - Emotional expression adverbs (come!, dove!, quando!) for strong reactions, separate from interrogative forms
4. **Presentative Adverbs** - Introduction/presentation adverbs (ecco) with systematic clitic attachment patterns (eccomi, eccoti, eccolo)

**Word-Level Metadata** *(see [Section 3.5](#35-adverb-specific-attributes) for complete value descriptions)*:
- `metaattr001` - **Adverb Type**: 13 comprehensive categories covering all functional types - `manner`, `time`, `place`, `quantity`, `frequency`, `affirmation`, `negation`, `evaluation`, `emphasis`, `doubt`, `conjunctive`, `exclamative`, `presentative`
- `metaattr056` - **Interrogative Function**: Cross-word-type attribute marking interrogative adverbs (come, quando, dove, perché) for filtering and grouping across word types
- `metaattr055` - **Adverb Government**: Systematic classification for prepositional constructions with educational value:
  - `governs_a` - Spatial adverbs forming constructions with "a": davanti a, dietro a, accanto a, vicino a
  - `governs_di` - Temporal adverbs forming constructions with "di": prima di, dopo di, invece di
  - `governs_da` - Distance adverbs forming constructions with "da": lontano da, distante da
  - `invariable` - Simple adverbs that cannot form prepositional constructions: qui, là, oggi, ieri
- `metaattrXXX` - **Clitic Capability**: `supports_clitics` (presentative adverbs with clitic attachment patterns), `no_clitics` (standard invariable adverbs)

**Translation-Level Metadata** *(see [Section 3.7](#37-universal-translation-level-attributes) for complete value descriptions)*:
- `metaattr016` - **Position**: `before/after`, `after`, `before` - sentence position preferences
- `metaattr018` - **Register**: `neutral` (most common), `formal`, `casual` - formality level for specific uses

**Advanced Category Examples**:

**Conjunctive Adverbs** (Discourse Connection):
- **tuttavia** (however) - contrastive: "È difficile, tuttavia ci proverò" (It's difficult, however I'll try)
- **infatti** (indeed/in fact) - confirmatory: "È bravo, infatti ha vinto" (He's good, indeed he won)
- **dunque** (therefore) - consequential: "Piove, dunque resto a casa" (It's raining, therefore I stay home)
- **pertanto** (therefore/hence) - formal consequence: "È malato, pertanto non viene" (He's sick, therefore he's not coming)

**Exclamative Adverbs** (Emotional Expression):
- **come!** (how!) - emotional reaction: "Come sei bravo!" (How good you are!)
- **dove!** (where!) - strong reaction: "Dove sei stato!" (Where have you been!)
- **quando!** (when!) - impatience: "Quando arriverà!" (When will he arrive!)

**Presentative Adverbs** (Introduction/Presentation):
- **ecco** (here/there it is) - basic presentation: "Ecco il libro!" (Here's the book!)
- **eccomi** (here I am) - self-presentation with clitic attachment
- **eccoti/eccolo/eccola** (here you are/here he is/here she is) - systematic clitic patterns
- **eccoci/eccovi/eccoli/eccole** (here we are/here you all are/here they are) - complete paradigm

**Systematic Government Patterns** (Educational Value):
- **Spatial + "a"**: davanti a, dietro a, accanto a, vicino a (physical position)
- **Temporal + "di"**: prima di, dopo di, invece di (time relations)
- **Distance + "da"**: lontano da, distante da, via da (separation/origin)

**Cross-Word-Type Integration**:
- **Interrogative Adverbs**: Italian interrogative adverbs (come, quando, dove, perché) are marked with `interrogative_function: interrogative` for cross-word-type filtering while maintaining their adverb classification. This enables learners to find all question words together across adjectives, adverbs, and pronouns.

**Forms Storage Strategy**:
Minimal forms storage due to invariable nature, with strategic exceptions:
- **Base Forms Only**: Single canonical form per adverb for most categories (oggi, velocemente, bene)
- **Exclamative Separation**: Separate entries for exclamative forms (come vs come!) with distinct emotional/emphatic function
- **Presentative Contractions**: Complete clitic-attached forms stored (eccomi, eccoti, eccolo, eccola, eccoci, eccovi, eccoli, eccole)
- **Government Constructions**: Captured via metadata, not stored forms, for systematic pattern instruction

**Implementation Statistics**:
- **60+ total base entries** across four major categories with 13 subcategories
- **Complete metadata coverage** for all semantic and functional classifications
- **Systematic government patterns** for educational prepositional construction learning
- **Cross-word-type integration** through interrogative function attribute
- **Educational progression** from A1 basic adverbs to B2+ advanced discourse functions

**Educational Integration**:
- **Progressive Learning Support**: CEFR classification from A1 basic adverbs (bene, oggi, qui) to B2 advanced conjunctive discourse functions
- **Semantic Category Learning**: Systematic 13-category classification helps learners understand adverbial functions
- **Government Pattern Instruction**: Helps learners understand systematic adverb + preposition constructions, making apparent "compound prepositions" learnable
- **Cross-Word-Type Features**: Interrogative function enables learners to find all question words together while maintaining proper grammatical classification

**Advanced Architectural Features**:
- **13-Category Classification**: Complete functional coverage including new conjunctive, exclamative, and presentative categories
- **Government Pattern System**: Systematic adverb-preposition construction patterns with educational scaffolding
- **Cross-Word-Type Integration**: Interrogative function attribute enables filtering across adjectives, adverbs, and pronouns
- **Clitic Contraction Support**: Systematic presentative + clitic combinations (ecco + pronoun → eccomi, eccoti, etc.)
- **Discourse Function Recognition**: Conjunctive adverbs support advanced discourse competence development

**Frontend Features**:
- **Major Category Display**: Four-category organization (semantic, conjunctive, exclamative, presentative) with subcategory breakdown
- **Government Pattern Display**: Shows systematic adverb + preposition constructions with educational explanations
- **Clitic Combination Preview**: Displays all clitic-attached forms for presentative adverbs
- **Cross-Word-Type Filtering**: Interrogative adverbs grouped with interrogative adjectives and pronouns
- **Discourse Function Indicators**: Conjunctive adverbs marked with logical relationship types (contrast, confirmation, consequence)
- **Essential vs. Detailed Tags**: Adverb type and government pattern prominently displayed; register and position preferences in detailed view

**Advanced Filter Integration**:
```javascript
// Complete 13-category adverb type mapping
const adverbTypeMap = {
  // Semantic Adverbs (10 subcategories)
  'adverb-manner': 'manner',           // bene, male, velocemente
  'adverb-time': 'time',               // oggi, ieri, sempre, mai
  'adverb-place': 'place',             // qui, là, dove, sopra
  'adverb-quantity': 'quantity',       // molto, poco, abbastanza
  'adverb-frequency': 'frequency',     // spesso, raramente, mai
  'adverb-affirmation': 'affirmation', // sì, certamente, certo
  'adverb-negation': 'negation',       // no, non, nemmeno
  'adverb-evaluation': 'evaluation',   // appunto, infatti, fortunatamente
  'adverb-emphasis': 'emphasis',       // davvero, proprio, assolutamente
  'adverb-doubt': 'doubt',            // forse, probabilmente, magari
  // New Major Categories
  'adverb-conjunctive': 'conjunctive', // tuttavia, infatti, dunque
  'adverb-exclamative': 'exclamative', // come!, dove!, quando!
  'adverb-presentative': 'presentative' // ecco, eccomi, eccoti
};

// Cross-word-type interrogative filtering
const interrogativeFunctionMap = {
  'interrogative': 'question-words'    // come, quando, dove, chi, quale, quanto
};

// Government pattern classification for educational construction learning
const adverbGovernmentMap = {
  'governs_a': 'spatial-constructions',     // davanti a, dietro a, accanto a
  'governs_di': 'temporal-constructions',   // prima di, dopo di, invece di
  'governs_da': 'distance-constructions',   // lontano da, distante da
  'invariable': 'simple-adverbs'           // qui, là, oggi, ieri
};
```

---

## 5. Planned Word Types

*The following word types have initial architectural planning but are not yet implemented.*

### 5.1 PREPOSITION

**Implementation Status**: 📋 **Planned - Complete Architecture**

**Architecture Summary**:
The preposition system uses a clean atomic approach with systematic contraction patterns and semantic role classification. The system emphasizes true prepositions with algorithmic contracted form generation.

**Core Function**: Prepositions establish relationships between sentence elements, providing essential grammatical and semantic connections that clarify spatial, temporal, causal, and instrumental relationships in Italian sentences.

#### Three Major Categories

The Italian preposition system encompasses three distinct structural categories:

1. **Simple Prepositions** (9 entries): di, a, da, in, con, su, per, tra, fra - Core atomic prepositions with fundamental relationships
2. **Contracted Forms** (30 entries): del, al, dalla, nel, sulla, etc. - Mandatory combinations with definite articles following systematic patterns
3. **Complex Prepositions** (12+ entries): durante, attraverso, presso, mediante, nonostante - Single-word prepositional units with specialized functions

#### Architecture Overview

**Storage Strategy**: Store simple prepositions and complex forms, with algorithmic generation of contracted forms using systematic 5×6 contraction matrix.

**Metadata Architecture**:
- **Semantic role classification** for spatial, temporal, causal, instrumental relationships
- **Contraction behavior** (mandatory, optional, never) with systematic patterns
- **Government patterns** for complement structure
- **Universal attributes**: CEFR Level, Frequency Tier, Register

**Implementation Scale**: 50+ total entries across three categories with systematic contraction algorithms, ready-to-execute SQL implementation, and comprehensive semantic classification.

**Educational Integration**: Progressive learning support from A1 basic spatial relationships to B1+ complex semantic roles, with systematic contraction pattern instruction essential for Italian fluency.

> **📋 Complete Technical Documentation**: For comprehensive implementation details including word-level architecture, complete SQL examples, contraction algorithms, semantic classification, and educational integration, see [**Preposition Complete Implementation Guide**](./word-types-architecture-5-prepositions.md).

The preposition documentation provides production-ready implementation specifications with systematic contraction patterns, semantic role classification, and sophisticated educational architecture designed for effective Italian language learning.

---

### 5.2 DETERMINER

**Implementation Status**: 📋 **Fully Planned - Complete Architecture**

#### 5.2.1 What is a Determiner

Determiners are a fundamental class of words that introduce and modify nouns, providing essential information about specificity, quantity, possession, and reference. In Italian, determiners form a complex system that agrees with nouns in gender and number, making them crucial for proper sentence construction and comprehension.

**Core Function**: Determiners specify which noun is being referenced and provide context about its definiteness, quantity, or relationship to the speaker. Unlike adjectives, which describe qualities, determiners establish the referential framework for nouns.

#### 5.2.2 Six Major Categories

The Italian determiner system encompasses six distinct categories, each with specific morphological and semantic properties:

1. **Definite Articles** (il, la, lo, i, gli, le, l') - Specify known, specific entities with complex phonetic conditioning
2. **Indefinite Articles** (un, uno, una, un') - Introduce new or non-specific entities
3. **Demonstratives** (questo, questa, quello, quella + plurals) - Indicate spatial or temporal reference
4. **Possessives** (mio/mia, tuo/tua, suo/sua, nostro/nostra, vostro/vostra, loro + plurals) - Express ownership or relationship
5. **Quantifiers** (molto, poco, tutto, alcuni/alcune, ogni, qualche + variations) - Specify amount, quantity, or degree
6. **Interrogatives** (quale, quanto/quanta, che + plurals) - Form questions about identity or quantity

#### 5.2.3 Architecture Overview

**Storage Strategy**: Store ALL determiner forms rather than calculate, due to irregular patterns, phonetic conditioning, and critical searchability requirements for language learners.

**Metadata Architecture**:
- **metaattr028** - Determiner Type (5 values: article, demonstrative, possessive, quantifier, interrogative)
- **metaattr014** - Person (possessives only: prima-persona, seconda-persona, terza-persona)
- **metaattr011** - Gender (masculine, feminine, common-gender)
- **metaattr012** - Number (singular, plural)
- **Universal attributes**: CEFR Level, Frequency Tier

**Implementation Scale**: 29 total base entries across six categories with complete form paradigms, ready-to-execute SQL implementation, and comprehensive metadata coverage.

**Educational Integration**: Progressive learning support from A1 basic articles to B1 advanced quantifier constructions, with frequency-based presentation prioritizing high-impact determiners.

> **📋 Complete Technical Documentation**: For comprehensive implementation details including word-level architecture, complete SQL examples, form relationships, translation strategies, and educational integration, see [**Determiner Complete Implementation Guide**](./word-types-architecture-6-determiner.md).

The determiner documentation provides production-ready implementation specifications with complete metadata coverage, systematic form generation patterns, and sophisticated educational architecture designed for effective Italian language learning.

---

### 5.3 CONJUNCTION

**Implementation Status**: 📋 **Planned - Complete Architecture**

**Architecture Summary**:
The conjunction system uses a minimal forms approach with emphasis on grammatical relationship classification. Most conjunctions are invariable, requiring only elided forms for euphonic patterns.

**Core Function**: Conjunctions connect words, phrases, or clauses, providing essential grammatical relationships in Italian sentences. The system categorizes by coordination type and supports progressive learning from basic coordinators to complex subordinating relationships.

#### Three Major Categories

The Italian conjunction system encompasses three distinct functional categories:

1. **Coordinating Conjunctions** (6 entries): e, ma, però, o, oppure, ovvero - Connect equal grammatical elements
2. **Subordinating Conjunctions** (7 entries): perché, poiché, siccome, quando, mentre, se, qualora - Connect dependent to independent clauses
3. **Correlative Conjunctions** (3 entries): sia, né, nonostante - Work in pairs or express complex relationships

#### Architecture Overview

**Storage Strategy**: Minimal forms storage due to invariable nature, with elided forms only for euphonic patterns (`e`→`ed`, `o`→`od`).

**Metadata Architecture**:
- **conjunction_type** - Three functional categories (coordinating, subordinating, correlative)
- **Universal attributes**: CEFR Level, Frequency Tier, Register, Position

**Implementation Scale**: 16 total base entries across three categories with minimal form paradigms, ready-to-execute SQL implementation, and streamlined metadata coverage.

**Educational Integration**: Progressive learning support from A1 basic coordinators (`e`, `ma`, `o`) to B1+ complex subordinating relationships, with frequency-based presentation prioritizing high-impact conjunctions.

> **📋 Complete Technical Documentation**: For comprehensive implementation details including word-level architecture, complete SQL examples, form relationships, translation strategies, and educational integration, see [**Conjunction Complete Implementation Guide**](./word-types-architecture-7-conjunctions.md).

The conjunction documentation provides production-ready implementation specifications with linguistically accurate categorization, minimal complexity metadata system, and sophisticated educational architecture designed for effective Italian language learning.

---

### 5.4 PRONOUN

**Implementation Status**: 📋 **Planned - Complete Architecture**

**Architecture Summary**:
The pronoun system handles the complex Italian case system with comprehensive coverage of personal, clitic, relative, indefinite, and demonstrative pronouns including the particle NE.

**Core Function**: Pronouns replace nouns and noun phrases, providing essential reference mechanisms in Italian sentences. The system supports complex clitic positioning, case distinctions, and agreement patterns essential for natural Italian expression.

#### Six Major Categories

The Italian pronoun system encompasses six distinct functional categories:

1. **Personal Pronouns** (28+ entries): io, tu, lui, lei, noi, voi, loro - Complete case system with separate entries for each function
2. **Clitic Pronouns** (25+ entries): mi, ti, lo, la, ci, vi, li, le, combined forms - Essential for natural Italian expression
3. **Particle NE** (2 entries): ne, n' - Specialized clitic with partitive, locative, possessive functions
4. **Indefinite Pronouns** (12+ entries): qualcuno, nessuno, chiunque, qualcosa - Quantitative and qualitative reference
5. **Relative Pronouns** (8+ entries): che, cui, quale, chi - Complex clause-connecting system
6. **Demonstrative Pronouns** (12+ entries): questo, quello, ciò - Spatial and discourse reference

#### Architecture Overview

**Storage Strategy**: Complex form storage due to irregular patterns, case system complexity, and critical clitic positioning rules.

**Metadata Architecture**:
- **pronoun_type** - Six functional categories (personal, clitic, partitive, indefinite, relative, demonstrative)
- **syntactic_function** - Translation-level differentiation for multiple translations
- **Cross-word-type integration** - Uses existing interrogative_function attribute for question words
- **Complete case system** (nominative, accusative, dative, ablative)
- **Clitic positioning rules** and combined form handling
- **Universal attributes**: CEFR Level, Frequency Tier, Register, Person, Number

**Implementation Scale**: 65+ total base entries across six categories with minimal form paradigms (separate entries approach), ready-to-execute SQL implementation, and streamlined metadata coverage with existing attribute reuse.

**Educational Integration**: Progressive learning support from A1 basic personal pronouns to B2+ advanced clitic combinations, with systematic case system instruction essential for Italian fluency.

#### Interrogative Distribution

Interrogative pronouns (chi, cosa, quale, quanto) are distributed across appropriate base categories (relative, demonstrative, etc.) and identified using the existing cross-word-type interrogative_function attribute. This approach maintains proper grammatical classification while enabling learners to find all question words together through cross-category filtering.

> **📋 Complete Technical Documentation**: For comprehensive implementation details including word-level architecture, complete SQL examples, form relationships, case system handling, and educational integration, see [**Pronoun Complete Implementation Guide**](./word-types-architecture-8-pronouns.md).

The pronoun documentation provides production-ready implementation specifications with complete case system coverage, clitic positioning rules, and sophisticated educational architecture designed for effective Italian language learning.

---





### 5.5 INTERJECTIONS

**Implementation Status**: 📋 **Planned - Complete Architecture**

**Architecture Summary**:
The interjection system handles emotional expressions, greetings, and social interactions with comprehensive cultural context and register sensitivity.

**Core Function**: Interjections express emotions, reactions, and social interactions as autonomous linguistic units. The system supports cultural appropriateness and register awareness essential for natural Italian social competence.

#### Three Linguistic Categories

Following traditional Italian grammatical classification, the interjection system encompasses three distinct linguistic categories:

1. **Primary Interjections (11 entries)**: ah, oh, eh, uh, ahi, uff, beh, mah, boh, ecco, insomma - Pure vocal expressions (interiezioni proprie)
2. **Lexicalized Greeting Interjections (6 entries)**: ciao, salve, arrivederci, buongiorno, buonasera, buonanotte - Social formulas functioning interjectively
3. **Cultural Interjective Phrases (4 entries)**: mamma mia, perbacco, madonna, accidenti - Multi-word cultural expressions (locuzioni interiettive)

#### Architecture Overview

**Storage Strategy**: Minimal forms storage for invariable expressions with cultural context annotations and register classifications.

**Metadata Architecture**:
- **Interjection functional types** with emotional and social classification
- **Emotional tone** (positive, negative, neutral, surprise, doubt, high-sensitivity)
- **Cultural sensitivity** and register appropriateness
- **Form variant grammar rules** with specific linguistic constraints
- **Universal attributes**: CEFR Level, Frequency Tier, Register

**Implementation Scale**: 18+ authentic interjections across three linguistic categories with cultural context annotations, ready-to-execute SQL implementation, and comprehensive metadata coverage.

**Educational Integration**: Progressive learning support from A1 basic social interactions to B1+ cultural competence, with emphasis on register appropriateness and cultural sensitivity essential for successful Italian social integration.

> **📋 Complete Technical Documentation**: For comprehensive implementation details including word-level architecture, complete SQL examples, cultural context handling, register sensitivity, and educational integration, see [**Interjection Complete Implementation Guide**](./word-types-architecture-9-interjections.md).

The interjection documentation provides production-ready implementation specifications with cultural sensitivity guidance, register appropriateness classifications, and sophisticated educational architecture designed for effective Italian social competence development.

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
   - Variant form handling (e/ed)

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
