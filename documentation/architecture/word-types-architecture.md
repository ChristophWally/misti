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
     - 5.1.1 [What is a Preposition](#511-what-is-a-preposition)
     - 5.1.2 [Italian Preposition Examples](#512-italian-preposition-examples)
       - 5.1.2.1 [Core Simple Prepositions](#5121-core-simple-prepositions)
     - 5.1.3 [Irregularities and Special Cases](#513-irregularities-and-special-cases)
       - 5.1.3.1 [Articulated Prepositions (Contractions)](#5131-articulated-prepositions-contractions)
         - 5.1.3.1.1 [Phonetic Conditioning Rules](#51311-phonetic-conditioning-rules)
         - 5.1.3.1.2 [Complete Contraction Paradigm](#51312-complete-contraction-paradigm)
       - 5.1.3.2 [Adverb-Preposition Constructions](#5132-adverb-preposition-constructions-formerly-compound-prepositions)
     - 5.1.4 [Storage Strategy](#514-storage-strategy)
     - 5.1.5 [Word-Level Metadata](#515-word-level-metadata)
     - 5.1.6 [Translation Metadata and Strategy](#516-translation-metadata-and-strategy)
       - 5.1.6.1 [Translation Implementation Strategy](#5161-translation-implementation-strategy)
       - 5.1.6.2 [Core Preposition Translation Patterns](#5162-core-preposition-translation-patterns)
       - 5.1.6.3 [Extended Preposition Coverage](#5163-extended-preposition-coverage)
       - 5.1.6.4 [Comprehensive Implementation Strategy](#5164-comprehensive-implementation-strategy)
     - 5.1.7 [Form Metadata and Strategy](#517-form-metadata-and-strategy)
       - 5.1.7.1 [Forms Implementation Strategy](#5171-forms-implementation-strategy)
     - 5.1.8 [Systematic Adverb-Preposition Construction Patterns](#518-systematic-adverb-preposition-construction-patterns)
       - 5.1.8.1 [Pattern 1: Spatial Adverbs + "a"](#5181-pattern-1-spatial-adverbs--a)
       - 5.1.8.2 [Pattern 2: Temporal Adverbs + "di"](#5182-pattern-2-temporal-adverbs--di)
       - 5.1.8.3 [Pattern 3: Distance Adverbs + "da"](#5183-pattern-3-distance-adverbs--da)
       - 5.1.8.4 [Educational Benefits of Pattern Recognition](#5184-educational-benefits-of-pattern-recognition)
       - 5.1.8.5 [Implementation in Misti Dictionary](#5185-implementation-in-misti-dictionary)
   - 5.2 [Determiner](#52-determiner)
     - 5.2.1 [What is a Determiner](#521-what-is-a-determiner)
     - 5.2.2 [Italian Determiner Categories](#522-italian-determiner-categories)
     - 5.2.3 [Forms Architecture Strategy](#523-forms-architecture-strategy)
     - 5.2.4 [Storage Strategy](#524-storage-strategy)
     - 5.2.5 [Word-Level Metadata](#525-word-level-metadata)
     - 5.2.6 [Translation Metadata and Strategy](#526-translation-metadata-and-strategy)
     - 5.2.7 [Form Metadata and Strategy](#527-form-metadata-and-strategy)
     - 5.2.8 [Educational Architecture Insights](#528-educational-architecture-insights)
     - 5.2.9 [Implementation Examples](#529-implementation-examples)
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
**Database Usage**: 11 words assigned across all types

| Value | Shorthand | Description | Usage Count |
|-------|-----------|-------------|-------------|
| `manner` | MAN | How something is done: velocemente, bene | 2 |
| `negation` | NEG | Negative constructions: non, niente, nessuno | 1 |
| `interrogative` | INTER | Questions: quando, dove, come | 1 |
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

### 3.6 Universal Translation-Level Attributes

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

### 3.7 Optional Tags System

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
- `metaattr018` - **Register**: `neutral` (36 uses), `formal` (4 uses), `casual` (2 uses) - see [Section 3.6](#36-universal-translation-level-attributes)

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

---

### 4.2 NOUN

**Implementation Status**: ✅ **Fully Implemented**

**Architecture Summary**:
The noun system focuses on gender, number, and article generation with support for irregular plural formations.

**Word-Level Metadata** *(see [Section 3.3](#33-noun-specific-attributes) for complete value descriptions)*:
- `metaattr011` - **Noun Gender**: `masculine` (3 words), `feminine` (2 words), `common-gender` (1 word) - inherent grammatical gender
- `metaattr012` - **Number**: `singolare` (302 forms), `plurale` (301 forms) - applied at form level for agreement
- `metaattr013` - **Number Restriction**: `plural-only` (2 words), `singular-only` (1 word) - for defective nouns
- `metaattr026` - **Plural Formation**: `plural-e` (3 words), `plural-i` (2 words) - standard formation patterns

**Translation-Level Metadata** *(see [Section 3.6](#36-universal-translation-level-attributes) for complete value descriptions)*:
- `metaattr018` - **Register**: `neutral` (most common), `formal`, `casual` - formality level for specific meanings
- `metaattr_optional_tag` - **Optional Topic Tags**: `topic-abstract`, `topic-daily-life`, `topic-place` and others - see [Section 3.7](#37-optional-tags-system)

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

### 4.3 ADJECTIVE

**Implementation Status**: ✅ **Fully Implemented**

**Architecture Summary**:
The adjective system handles agreement patterns, position preferences, and gradability.

**Word-Level Metadata** *(see [Section 3.4](#34-adjective-specific-attributes) for complete value descriptions)*:
- `metaattr009` - **Gradable**: `full-gradability` (3 words), `analytical-gradability` (1 word), `non-gradable` (1 word) - comparative/superlative capability
- `metaattr006` - **Form Pattern**: `form-4` (2 words), `form-2` (2 words) - agreement variations (rosso/rossa/rossi/rosse vs grande/grandi)
- `metaattr011` - **Noun Gender**: inherited for agreement purposes - see [Section 3.3](#33-noun-specific-attributes)

**Translation-Level Metadata** *(see [Section 3.4](#34-adjective-specific-attributes) and [Section 3.6](#36-universal-translation-level-attributes) for complete value descriptions)*:
- `metaattr008` - **Gender Usage**: `male-only` (2 translations), `female-only` (1 translation) - gender-specific meanings like "handsome" (bello)
- `metaattr016` - **Position**: `before/after` (5 uses), `after` (5 uses), `before` (1 use) - placement relative to noun
- `metaattr018` - **Register**: `neutral`, `formal`, `casual` - formality level for specific meanings

**Forms Storage**:
Minimal forms storage - agreement forms are typically calculated on frontend based on regular patterns (alto/alta/alti/alte).

**Frontend Features**:
- **Position Indicators**: Shows preferred placement relative to noun
- **Gradability Display**: Indicates if adjective can be compared (più alto, altissimo)
- **Agreement Preview**: Shows masculine/feminine forms
- **Essential vs. Detailed Tags**: Position and gradability as essential, register as detailed

---

### 4.4 ADVERB

**Implementation Status**: ✅ **Fully Implemented**

**Architecture Summary**:
The adverb system classifies by semantic type and position, with sophisticated support for adverb-preposition constructions that form systematic grammatical patterns in Italian.

**Word-Level Metadata** *(see [Section 3.5](#35-adverb-specific-attributes) for complete value descriptions)*:
- `metaattr001` - **Adverb Type**: 11 semantic categories with 11 words assigned - `manner` (2 uses), `negation`, `interrogative`, `affirmation`, `quantity`, `doubt`, `emphasis`, `evaluation`, `place`, `frequency`, `time` (1 use each)
- `metaattr055` - **Adverb Government**: NEW systematic classification for prepositional constructions:
  - `governs_a` - Spatial adverbs forming constructions with "a": davanti a, dietro a, accanto a, vicino a
  - `governs_di` - Temporal adverbs forming constructions with "di": prima di, dopo di, invece di
  - `governs_da` - Distance adverbs forming constructions with "da": lontano da, distante da
  - `invariable` - Simple adverbs that cannot form prepositional constructions: qui, là, oggi, ieri

**Translation-Level Metadata** *(see [Section 3.6](#36-universal-translation-level-attributes) for complete value descriptions)*:
- `metaattr016` - **Position**: `before/after`, `after`, `before` - sentence position preferences
- `metaattr018` - **Register**: `neutral` (most common), `formal`, `casual` - formality level for specific uses

**Systematic Adverb-Preposition Patterns**:

**Spatial Adverbs + "a"** (Physical Position/Direction):
- davanti a (in front of), dietro a (behind), accanto a (next to)
- vicino a (near to), intorno a (around), attorno a (around)
- sopra a (above), sotto a (below), dentro a (inside)

**Temporal Adverbs + "di"** (Time Relations):
- prima di (before), dopo di (after), invece di (instead of)
- prima di tutto (first of all), prima di dormire (before sleeping)

**Distance Adverbs + "da"** (Separation/Origin):
- lontano da (far from), distante da (distant from)
- via da (away from), fuori da (outside of)

**Educational Value**:
These systematic patterns help learners understand that many apparent "compound prepositions" are actually predictable adverb + preposition constructions, making Italian prepositional phrases more learnable and systematic.

**Forms Storage**:
Generally no forms stored - adverbs are typically invariable in Italian. However, the systematic government patterns are captured through metadata for educational presentation.

**Frontend Features**:
- **Type Classification**: Clear semantic category display (manner, time, place, etc.)
- **Government Pattern Display**: Shows which preposition (if any) the adverb governs
- **Construction Examples**: Displays complete prepositional constructions (davanti a casa)
- **Position Indicators**: Shows typical sentence position
- **Frequency Emphasis**: High-frequency adverbs prominently displayed
- **Pattern Education**: Helps users understand systematic construction rules

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

// NEW: Adverb government pattern integration
const adverbGovernmentMap = {
  'governs_a': 'spatial-constructions',     // davanti a, dietro a
  'governs_di': 'temporal-constructions',   // prima di, dopo di
  'governs_da': 'distance-constructions',   // lontano da
  'invariable': 'simple-adverbs'           // qui, là, oggi
};
```

---

## 5. Planned Word Types

*The following word types have initial architectural planning but are not yet implemented.*

### 5.1 PREPOSITION

**Implementation Status**: 📋 **Planned**

**Architecture Summary**:
Prepositions use a clean atomic approach: storage for true prepositions only, algorithmic calculation of contracted forms (following phonetic conditioning rules), with previous "compound prepositions" now properly recognized as adverb + preposition constructions.

#### 5.1.1 What is a Preposition

**Linguistic Definition**: Italian prepositions (preposizioni) are short words that connect elements in a sentence to provide qualifying details about their relationship. They establish connections between nouns, pronouns, adjectives, adverbs, or verbs to indicate spatial, temporal, causal, instrumental, and other semantic relationships.

**Grammatical Function**: Prepositions introduce complement phrases that answer questions like:
- **Where?** (dove?) - in casa, su tavolo
- **When?** (quando?) - di mattina, a mezzogiorno
- **How?** (come?) - con attenzione, per telefono
- **Why?** (perché?) - per amore, da paura
- **From where?** (da dove?) - da Roma, di origine

#### 5.1.2 Italian Preposition Examples

##### 5.1.2.1 Core Simple Prepositions
The fundamental Italian prepositions are: **di, a, da, in, con, su, per, tra, fra**

###### DI (of/from/about)
- **Possession**: "la casa di Marco" (Marco's house)
- **Origin**: "sono di Roma" (I am from Rome)
- **Material**: "tavolo di legno" (wooden table)
- **Topic**: "parlare di calcio" (talk about soccer)

###### A (to/at/in)
- **Direction**: "vado a scuola" (I go to school)
- **Location**: "sono a casa" (I am at home)
- **Time**: "alle otto" (at eight o'clock)
- **Manner**: "fatto a mano" (made by hand)

###### DA (from/since/by)
- **Origin**: "vengo da Milano" (I come from Milan)
- **Time**: "da ieri" (since yesterday)
- **Agent**: "fatto da me" (made by me)
- **Purpose**: "macchina da corsa" (racing car)

###### IN (in/to)
- **Location**: "in cucina" (in the kitchen)
- **Time**: "in estate" (in summer)
- **Means**: "in treno" (by train)
- **Condition**: "in pace" (in peace)

###### CON (with)
- **Accompaniment**: "con gli amici" (with friends)
- **Instrument**: "scrivo con la penna" (I write with a pen)
- **Manner**: "con attenzione" (with attention)

###### SU (on/above/upon)
- **Surface**: "sul tavolo" (on the table)
- **Topic**: "libro su Roma" (book about Rome)
- **Approximation**: "sui vent'anni" (about twenty years old)

###### PER (for/through/by)
- **Purpose**: "regalo per te" (gift for you)
- **Duration**: "per tre ore" (for three hours)
- **Means**: "per telefono" (by phone)
- **Direction**: "per Roma" (toward Rome)

###### TRA/FRA (between/among)
- **Position**: "tra Roma e Napoli" (between Rome and Naples)
- **Time**: "tra poco" (in a little while)
- **Choice**: "scegliere tra due opzioni" (choose between two options)

#### 5.1.3 Irregularities and Special Cases

##### 5.1.3.1 Articulated Prepositions (Contractions)
**Critical Pattern**: Di, a, da, in, and su **must contract** with definite articles when they appear together. This is **mandatory** in Italian, not optional.

###### 5.1.3.1.1 Phonetic Conditioning Rules
The choice between regular and special contraction forms follows **predictable phonetic rules**:

**Regular Forms** (with il/i):
- Used before words that take regular articles (il/i)
- Examples: "del tavolo" (di + il), "dei libri" (di + i)

**Special Forms** (with lo/gli):
- Used before words that take special articles (lo/gli)
- **Triggers**: z-, s+consonant, gn-, ps-, x-, y-
- **For plurals**: also before vowel-initial words
- Examples: "dello zaino" (di + lo), "degli studenti" (di + gli)

###### 5.1.3.1.2 Complete Contraction Paradigm
| Preposition | + il | + lo | + la | + i | + gli | + le |
|-------------|------|------|------|-----|-------|------|
| **di** | del | dello | della | dei | degli | delle |
| **a** | al | allo | alla | ai | agli | alle |
| **da** | dal | dallo | dalla | dai | dagli | dalle |
| **in** | nel | nello | nella | nei | negli | nelle |
| **su** | sul | sullo | sulla | sui | sugli | sulle |

**Examples Demonstrating Phonetic Rules**:
- del tavolo (regular: t-) vs dello zaino (special: z-)
- dei libri (regular: l-) vs degli studenti (special: s+consonant)
- nel parco (regular: p-) vs nello stesso (special: s+consonant)
- sui monti (regular: m-) vs sugli alberi (special: vowel, plural)

##### 5.1.3.2 Adverb-Preposition Constructions (Formerly "Compound Prepositions")

**ARCHITECTURAL REVISION**: What were previously considered "compound prepositions" are now properly understood as **adverb + preposition constructions** that follow systematic patterns:

**Spatial Adverb + "a" Constructions**:
- davanti a (in front of), dietro a (behind), vicino a (near to)
- accanto a (next to), intorno a (around)
- *Pattern*: Spatial adverbs systematically govern the preposition "a"

**Temporal Adverb + "di" Constructions**:
- prima di (before), dopo di (after), invece di (instead of)
- *Pattern*: Temporal adverbs systematically govern the preposition "di"

**Distance Adverb + "da" Constructions**:
- lontano da (far from), distante da (distant from)
- *Pattern*: Distance adverbs systematically govern the preposition "da"

**True Single-Word Prepositions**:
- durante (during), attraverso (through), grazie a (thanks to), a causa di (because of)
- *Note*: These remain as true prepositional entries, not adverb constructions

**Educational Benefit**: This systematic approach helps learners understand predictable patterns rather than memorizing apparent "compound prepositions" as arbitrary units.

#### 5.1.4 Storage Strategy

**1. Atomic Base Storage**:
Store only fundamental prepositional lemmas in the `dictionary` table with pronunciation columns:
```sql
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('di', 'preposition', 'DEE', '/di/'),
('a', 'preposition', 'AH', '/a/'),
('da', 'preposition', 'DAH', '/da/'),
('in', 'preposition', 'EEN', '/in/'),
('con', 'preposition', 'KOHN', '/kon/'),
('su', 'preposition', 'SOO', '/su/'),
('per', 'preposition', 'PEHR', '/per/'),
('tra', 'preposition', 'TRAH', '/tra/'),
('fra', 'preposition', 'FRAH', '/fra/');
```

**2. Form Type Column (Database Column)**:
All preposition contraction forms must have their `form_type` column filled in the `word_forms` table. This is a DATABASE COLUMN, not metadata:
```sql
-- Example: contracted forms get "prep contraction" as form_type
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(di_word_id, 'del', 'prep contraction'),
(di_word_id, 'dello', 'prep contraction'),
(di_word_id, 'della', 'prep contraction');
```

**3. Pronunciation Columns**:
**BOTH** `dictionary` table (base words) AND `word_forms` table (forms) must have pronunciation columns filled:

**Dictionary Table (Base Words)**:
- `phonetic_pronunciation` - Simplified pronunciation guide (e.g., "DEE", "AH", "DAH")
- `ipa_pronunciation` - International Phonetic Alphabet notation (e.g., "/di/", "/a/", "/da/")

**Word_Forms Table (Contracted Forms)**:
- `phonetic_pronunciation` - Simplified pronunciation guide (e.g., "DEL", "DEL-lo")
- `ipa_pronunciation` - International Phonetic Alphabet notation (e.g., "/del/", "/ˈdello/")

**4. Gender/Number Scope**:
All contracted forms must receive gender/number tags using the metadata system (`metaattr011` for gender, `metaattr012` for number).

**5. Store All Contracted Forms Approach**:
**Recommended Implementation**: Store every contracted form as separate database entries in the `word_forms` table.

```sql
-- Store all contracted forms as individual database entries
INSERT INTO word_forms (word_id, form, form_type, gender, number) VALUES
-- DI contractions
(di_id, 'del', 'contracted', 'masculine', 'singular'),
(di_id, 'dello', 'contracted', 'masculine', 'singular'),
(di_id, 'della', 'contracted', 'feminine', 'singular'),
(di_id, 'dei', 'contracted', 'masculine', 'plural'),
(di_id, 'degli', 'contracted', 'masculine', 'plural'),
(di_id, 'delle', 'contracted', 'feminine', 'plural'),
-- A contractions
(a_id, 'al', 'contracted', 'masculine', 'singular'),
(a_id, 'allo', 'contracted', 'masculine', 'singular'),
(a_id, 'alla', 'contracted', 'feminine', 'singular'),
-- ... all other contracted forms
```

**Rationale for Store-All-Forms Approach**:
- ✅ **Search optimization**: Each contracted form searchable independently
- ✅ **Pronunciation support**: Individual IPA and phonetic data per form
- ✅ **Complete coverage**: Guarantees all contracted forms are available
- ✅ **Database consistency**: Uniform storage pattern across all word types

**6. No Adverb Construction Storage**:
**REMOVED**: Do not store adverb + preposition constructions as preposition forms. These patterns are handled through the adverb government system:

```sql
-- REMOVED: No longer store as preposition forms
-- davanti a, prima di, lontano da are adverb constructions
-- handled via metaattr055 (Adverb Government) system

-- Store only true single-word prepositions
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('durante', 'preposition', 'du-RAN-te', '/duˈran.te/'),    -- single word, not a construction
('attraverso', 'preposition', 'at-tra-VER-so', '/attraˈver.so/'), -- single word, not a construction
('presso', 'preposition', 'PRES-so', '/ˈpres.so/');     -- single word, not a construction
```

#### 5.1.5 Word-Level Metadata

**Simplified metadata for prepositions based on their functional nature**:

- **No metadata attributes required**: Prepositions only have contracted forms, which use existing gender/number metadata when needed
- **Form type in database only**: Form type (contracted) is stored in the database `form_type` column, not as metadata

#### 5.1.6 Translation Metadata and Strategy

**Educational Translation Framework**: Prepositions require rich, contextual descriptions that illuminate the semantic relationships they express. The focus is on comprehensive usage_notes that provide deep educational value through detailed explanations of when and why each translation applies in specific contexts.

##### 5.1.6.1 Translation Implementation Strategy

Handle semantic roles through the **existing translation system**:

1. **Multiple Translations**: Each semantic role gets its own translation entry
2. **Usage Notes**: Detailed context in the `usage_notes` field
3. **Frequency Estimates**: Prioritize most common semantic roles
4. **Display Priority**: Primary translation for most frequent use

**Core Principle**: Each preposition translation entry should include:
- **Primary English translation** with frequency ranking
- **Comprehensive usage_notes** explaining semantic function and contextual triggers
- **Multiple contextualized examples** showing exact translation application
- **Contrastive explanations** distinguishing when to use this translation vs. others
- **Common learner confusion points** with clarification

##### 5.1.6.2 Core Preposition Translation Patterns

###### DI - The Master Connector (6+ Major Translation Meanings)

<details>
<summary><strong>Detailed Translation Guide for DI (Click to expand)</strong></summary>

**Translation Priority Order** (based on frequency and learner importance):

##### 1. **"of"** - Possession, Composition, and Relationship (Primary: 40% usage)

**When to Use "of"**:
- **Possession and Belonging**: When DI indicates ownership or belonging relationship
  - "la casa **di** Marco" → "Marco's house" (literally "the house **of** Marco")
  - "il libro **di** mio fratello" → "my brother's book" (literally "the book **of** my brother")
  - "le chiavi **della** macchina" → "the car keys" (literally "the keys **of the** car")

- **Material Composition**: When DI specifies what something is made from
  - "tavolo **di** legno" → "wooden table" (literally "table **of** wood")
  - "anello **d'**oro" → "gold ring" (literally "ring **of** gold")
  - "casa **di** mattoni" → "brick house" (literally "house **of** bricks")

- **Characteristic Attribution**: When DI attributes qualities or characteristics
  - "uomo **di** coraggio" → "man **of** courage"
  - "persona **di** talento" → "person **of** talent"
  - "questione **di** principio" → "matter **of** principle"

**Usage Notes**: Use "of" when DI establishes possession, composition, or intrinsic relationship between nouns. This is the most fundamental meaning of DI in Italian.

##### 2. **"from"** - Origin, Source, and Provenance (Secondary: 25% usage)

**When to Use "from"**:
- **Geographic Origin**: When DI indicates place of origin or source
  - "sono **di** Roma" → "I am **from** Rome"
  - "vino **d'**Italia" → "wine **from** Italy"
  - "viene **dal** nord" → "he comes **from** the north"

- **Source and Derivation**: When DI indicates the source or origin of something
  - "il profumo **dei** fiori" → "the scent **from** the flowers"
  - "estratto **dalla** pianta" → "extracted **from** the plant"
  - "notizie **dal** giornale" → "news **from** the newspaper"

- **Temporal Origin**: When DI marks a starting point in time (with certain expressions)
  - "**di** recente" → "recently" (literally "**from** recent")
  - "**di** solito" → "usually" (literally "**from** usual")

**Usage Notes**: Use "from" when DI indicates origin, source, or derivation. This meaning often competes with DA, but DI typically indicates inherent origin while DA indicates movement from a place.

##### 3. **"about"** - Topic, Subject Matter, and Content (Third: 20% usage)

**When to Use "about"**:
- **Discussion Topics**: When DI introduces the subject of conversation or content
  - "parlare **di** calcio" → "talk **about** soccer"
  - "discutere **di** politica" → "discuss **about** politics"
  - "film **di** guerra" → "war movie" (literally "movie **about** war")

- **Content and Subject**: When DI specifies what something is about or contains
  - "libro **di** storia" → "history book" (literally "book **about** history")
  - "corso **di** italiano" → "Italian course" (literally "course **about** Italian")
  - "professore **di** matematica" → "mathematics professor" (literally "professor **of/about** mathematics")

- **Informational Focus**: When DI indicates the informational content
  - "notizie **di** cronaca" → "current news" (literally "news **about** current events")
  - "documentario **di** natura" → "nature documentary" (literally "documentary **about** nature")

**Usage Notes**: Use "about" when DI introduces topics, subjects, or informational content. This usage is very common with verbs of communication and nouns indicating content types.

##### 4. **"in"/"during"** - Temporal Expressions (Fourth: 10% usage)

**When to Use "in" or "during"**:
- **Parts of Day**: When DI indicates time periods within a day
  - "**di** mattina" → "**in** the morning"
  - "**di** sera" → "**in** the evening"
  - "**di** notte" → "**at** night" / "**during** the night"

- **Seasonal Expressions**: When DI indicates seasons
  - "**d'**estate" → "**in** summer"
  - "**d'**inverno" → "**in** winter"
  - "**di** primavera" → "**in** spring"

- **Habitual Time**: When DI indicates regular time patterns
  - "**di** domenica" → "**on** Sundays" / "**during** Sundays"
  - "**di** solito" → "usually" (literally "**of** usual")

**Usage Notes**: Use "in" or "during" when DI appears in fixed temporal expressions. These are largely idiomatic and must be memorized as set phrases.

##### 5. **"some"/"any"** - Partitive Function (Fifth: 3% usage)

**When to Use "some" or "any"**:
- **Indefinite Quantities**: When DI contracts with articles to express partitive meaning
  - "**del** pane" (di + il) → "**some** bread"
  - "**dell'**acqua" (di + l') → "**some** water"
  - "**dei** libri" (di + i) → "**some** books"
  - "**delle** mele" (di + le) → "**some** apples"

- **Negative/Interrogative Partitive**: In questions and negations
  - "Hai **del** tempo?" → "Do you have **any** time?"
  - "Non ho **del** denaro" → "I don't have **any** money"

**Usage Notes**: Use "some" or "any" when contracted DI+article forms express indefinite quantities. This is actually a grammatical function rather than lexical meaning of DI.

##### 6. **Temporal Specifications** - Context-Dependent (Sixth: 2% usage)

**Special Temporal Uses**:
- **Age References**: When DI indicates age or life stage
  - "**da** bambino" vs "**di** carattere infantile" → "as a child" vs "**of** childish character"
  - "problemi **di** adolescenza" → "adolescence problems" (literally "problems **of** adolescence")

**Translation Learning Strategy**:
For learners, the key insight is that DI's meaning depends heavily on the semantic relationship it's establishing:
- **Possession/Ownership** → "of"
- **Origin/Source** → "from"
- **Topic/Content** → "about"
- **Time Expressions** → "in/during" (mostly fixed phrases)
- **Quantity** → "some/any" (with articles)

</details>

###### A - Direction, Location, and Method (5+ Major Translation Meanings)

<details>
<summary><strong>Detailed Translation Guide for A (Click to expand)</strong></summary>

**Translation Priority Order**:

##### 1. **"to"** - Direction and Destination (Primary: 35% usage)

**When to Use "to"**:
- **Physical Movement**: When A indicates direction toward a destination
  - "vado **a** scuola" → "I go **to** school"
  - "andare **a** Roma" → "go **to** Rome"
  - "tornare **a** casa" → "return **to** home"

- **Goal-Oriented Direction**: When A indicates purpose-driven movement
  - "vado **al** mercato" → "I go **to** the market"
  - "andare **all'**università" → "go **to** university"
  - "correre **alla** stazione" → "run **to** the station"

**Usage Notes**: Use "to" when A indicates movement toward a destination or goal. This is the most fundamental directional meaning of A.

##### 2. **"at"** - Location and Time Points (Secondary: 30% usage)

**When to Use "at"**:
- **Static Location**: When A indicates being present at a location (especially activities/buildings)
  - "sono **a** casa" → "I am **at** home"
  - "**a** tavola" → "**at** the table"
  - "**al** cinema" → "**at** the cinema"
  - "**all'**università" → "**at** the university"

- **Precise Time Points**: When A indicates specific moments in time
  - "**alle** otto" → "**at** eight o'clock"
  - "**a** mezzogiorno" → "**at** noon"
  - "**all'**una" → "**at** one o'clock"
  - "**a** mezzanotte" → "**at** midnight"

**Usage Notes**: Use "at" when A indicates static location (especially with activities) or precise time points. The location meaning competes with IN, but A typically suggests participation in activities.

##### 3. **"by"/"in"** - Manner and Method (Third: 20% usage)

**When to Use "by" or "in"**:
- **Method of Execution**: When A indicates how something is done
  - "fatto **a** mano" → "made **by** hand"
  - "**a** piedi" → "**on** foot" / "**by** walking"
  - "vendere **all'**asta" → "sell **by** auction"

- **Cultural/Style Manner**: When A indicates a particular style or way
  - "**all'**italiana" → "**in** the Italian way"
  - "cucinare **alla** griglia" → "cook **on** the grill"
  - "vestirsi **alla** moda" → "dress **in** fashion"

**Usage Notes**: Use "by" or "in" when A describes method, manner, or style of doing something. The choice between "by" and "in" depends on English conventions.

##### 4. **"for"** - Purpose and Function (Fourth: 10% usage)

**When to Use "for"**:
- **Functional Purpose**: When A indicates what something is designed for
  - "macchina **a** benzina" → "car **for** gasoline" / "gas car"
  - "cucina **a** gas" → "**gas** stove" (literally "stove **for** gas")
  - "barca **a** vela" → "sailboat" (literally "boat **for** sail")

- **Intended Use**: When A indicates intended function or purpose
  - "macchina **a** noleggio" → "rental car" (literally "car **for** rent")
  - "camera **a** pagamento" → "paid room" (literally "room **for** payment")

**Usage Notes**: Use "for" when A indicates purpose, function, or intended use. This often creates compound noun concepts in English.

##### 5. **"in"** - State and Condition (Fifth: 5% usage)

**When to Use "in"**:
- **Conditional States**: When A indicates being in a particular condition
  - "**a** riposo" → "**at** rest" / "**in** rest"
  - "**a** disagio" → "**in** discomfort"
  - "**a** proprio agio" → "**at** ease" / "**in** one's element"

**Translation Learning Strategy**:
A's meaning depends on whether it indicates:
- **Movement** → "to"
- **Static location/time** → "at"
- **Method/manner** → "by/in"
- **Purpose/function** → "for"
- **State** → "in/at"

</details>

###### DA - Origin, Agency, and Separation (5+ Major Translation Meanings)

<details>
<summary><strong>Detailed Translation Guide for DA (Click to expand)</strong></summary>

**Translation Priority Order**:

##### 1. **"from"** - Physical and Conceptual Origin (Primary: 40% usage)

**When to Use "from"**:
- **Physical Movement Origin**: When DA indicates starting point of movement
  - "vengo **da** Milano" → "I come **from** Milan"
  - "uscire **da** casa" → "exit **from** home"
  - "partire **dal** nord" → "depart **from** the north"

- **Distance and Separation**: When DA indicates separation or distance
  - "lontano **da** casa" → "far **from** home"
  - "diverso **da** me" → "different **from** me"
  - "separato **dalla** famiglia" → "separated **from** the family"

**Usage Notes**: Use "from" when DA indicates physical or conceptual starting points, origins, or separation. This is DA's most fundamental meaning.

##### 2. **"since"/"from"** - Temporal Starting Points (Secondary: 25% usage)

**When to Use "since" or "from"**:
- **Time Duration**: When DA indicates beginning of a time period
  - "**da** ieri" → "**since** yesterday"
  - "**dalle** otto" → "**since/from** eight o'clock"
  - "**da** bambino" → "**since** childhood" / "**from** when I was a child"

- **Ongoing Duration**: When DA indicates continuous time periods
  - "lavoro qui **da** anni" → "I've worked here **for** years" (literally "**since** years")
  - "non lo vedo **da** tempo" → "I haven't seen him **for** a while" (literally "**since** time")

**Usage Notes**: Use "since" when DA indicates a specific starting point, "from" for time ranges, and sometimes "for" in duration contexts (though this is a translation accommodation).

##### 3. **"by"** - Agent in Passive Constructions (Third: 20% usage)

**When to Use "by"**:
- **Passive Voice Agent**: When DA indicates who performs an action in passive constructions
  - "fatto **da** me" → "made **by** me"
  - "scritto **da** Dante" → "written **by** Dante"
  - "dipinto **dal** maestro" → "painted **by** the master"

- **Causative Agent**: When DA indicates who or what causes something
  - "distrutto **dal** fuoco" → "destroyed **by** fire"
  - "causato **dalla** pioggia" → "caused **by** the rain"

**Usage Notes**: Use "by" when DA introduces the agent or cause in passive constructions. This is a crucial grammatical function of DA.

##### 4. **"for"** - Characteristic Purpose and Function (Fourth: 10% usage)

**When to Use "for"**:
- **Characteristic Purpose**: When DA indicates what something is characteristically used for
  - "macchina **da** corsa" → "racing car" (literally "car **for** racing")
  - "vestito **da** sera" → "evening dress" (literally "dress **for** evening")
  - "occhiali **da** sole" → "sunglasses" (literally "glasses **for** sun")

- **Functional Design**: When DA indicates inherent function or design purpose
  - "scarpe **da** ginnastica" → "sneakers" (literally "shoes **for** gymnastics")
  - "abito **da** sposa" → "wedding dress" (literally "dress **for** bride")

**Usage Notes**: Use "for" when DA indicates characteristic or inherent purpose. This often creates compound nouns in English. Distinguish from A + purpose (immediate use) vs DA + purpose (characteristic function).

##### 5. **"as"** - Role and Capacity (Fifth: 5% usage)

**When to Use "as"**:
- **Role or Capacity**: When DA indicates acting in a particular role
  - "lavorare **da** professore" → "work **as** a professor"
  - "comportarsi **da** adulto" → "behave **as** an adult"
  - "parlare **da** esperto" → "speak **as** an expert"

**Usage Notes**: Use "as" when DA indicates the role, capacity, or manner in which someone acts.

**Translation Learning Strategy**:
DA's meaning depends on the type of relationship:
- **Physical/conceptual origin** → "from"
- **Time starting points** → "since/from"
- **Passive voice** → "by"
- **Characteristic purpose** → "for"
- **Role/capacity** → "as"

</details>

###### IN - Containment, State, and Method (4+ Major Translation Meanings)

<details>
<summary><strong>Detailed Translation Guide for IN (Click to expand)</strong></summary>

**Translation Priority Order**:

##### 1. **"in"** - Physical and Abstract Location (Primary: 50% usage)

**When to Use "in"**:
- **Physical Containment**: When IN indicates being inside or within a space
  - "**in** cucina" → "**in** the kitchen"
  - "**nel** parco" → "**in** the park"
  - "**in** Italia" → "**in** Italy"
  - "**nella** scatola" → "**in** the box"

- **Abstract States and Conditions**: When IN indicates being in a particular state
  - "**in** pace" → "**in** peace"
  - "**in** guerra" → "**at** war" / "**in** war"
  - "**in** difficoltà" → "**in** difficulty"
  - "**in** salute" → "**in** good health"

- **Language and Medium**: When IN indicates the medium of expression
  - "**in** italiano" → "**in** Italian"
  - "**in** inglese" → "**in** English"
  - "**in** digitale" → "**in** digital format"

**Usage Notes**: Use "in" for physical containment, abstract states, and medium of expression. This is IN's most fundamental meaning - containment or being within something.

##### 2. **"during"/"in"** - Temporal Periods (Secondary: 30% usage)

**When to Use "during" or "in"**:
- **Seasons and Long Periods**: When IN indicates extended time periods
  - "**in** estate" → "**in** summer"
  - "**in** inverno" → "**in** winter"
  - "**nel** 2024" → "**in** 2024"
  - "**negli** anni '80" → "**in** the 80s"

- **Duration Within Time**: When IN indicates something happening within a time frame
  - "**in** settimana" → "**during** the week"
  - "**nel** pomeriggio" → "**in** the afternoon"
  - "**in** questi giorni" → "**in** these days" / "**during** these days"

**Usage Notes**: Use "in" for years, seasons, and long periods; use "during" when emphasizing the time frame within which something occurs.

##### 3. **"by"** - Means of Transport and Method (Third: 15% usage)

**When to Use "by"**:
- **Enclosed Transportation**: When IN indicates method of transport in enclosed vehicles
  - "**in** treno" → "**by** train"
  - "**in** macchina" → "**by** car"
  - "**in** aereo" → "**by** plane"
  - "**in** autobus" → "**by** bus"

- **Method and Means**: When IN indicates the method or means of doing something
  - "pagare **in** contanti" → "pay **in** cash" / "pay **by** cash"
  - "scrivere **in** penna" → "write **in** pen" / "write **with** pen"

**Usage Notes**: Use "by" for enclosed transportation methods. Contrast with A (open/exposed transport: "a piedi" = "on foot") and CON (instrumental: "con l'autobus" = "with the bus").

##### 4. **"into"** - Direction and Transformation (Fourth: 5% usage)

**When to Use "into"**:
- **Movement Into Containment**: When IN indicates direction toward containment
  - "entrare **in** casa" → "enter **into** the house"
  - "mettere **nel** cassetto" → "put **into** the drawer"
  - "cadere **nell'**acqua" → "fall **into** the water"

- **Transformation States**: When IN indicates change into a condition
  - "andare **in** pensione" → "go **into** retirement"
  - "cadere **in** depressione" → "fall **into** depression"

**Usage Notes**: Use "into" when IN indicates movement toward containment or transformation into a state.

**Translation Learning Strategy**:
IN's meaning depends on the context:
- **Physical/abstract containment** → "in"
- **Time periods** → "in/during"
- **Enclosed transport/method** → "by"
- **Direction toward containment** → "into"

</details>

##### 5.1.6.3 Extended Preposition Coverage

###### CON - Accompaniment and Instrumentality (3+ Major Translations)

##### 1. **"with"** - Accompaniment and Instrumentality (Primary: 80% usage)
- **Accompaniment**: "vado **con** gli amici" → "I go **with** friends"
- **Instrument**: "scrivo **con** la penna" → "I write **with** the pen"
- **Manner**: "**con** attenzione" → "**with** attention" / "carefully"

##### 2. **"by"** - Method and Means (Secondary: 15% usage)
- **Method**: "viaggiare **con** il treno" → "travel **by** train"
- **Means**: "comunicare **con** email" → "communicate **by** email"

##### 3. **"in"** - State and Manner (Third: 5% usage)
- **Manner**: "**con** calma" → "**in** a calm manner" / "calmly"
- **State**: "**con** fretta" → "**in** a hurry"

###### SU - Surface and Topic (3+ Major Translations)

##### 1. **"on"/"upon"** - Surface and Position (Primary: 60% usage)
- **Physical Surface**: "**sul** tavolo" → "**on** the table"
- **Support**: "**sulla** sedia" → "**on** the chair"
- **Position**: "**su** e giù" → "up and down"

##### 2. **"about"** - Topic and Subject (Secondary: 30% usage)
- **Topic**: "libro **su** Roma" → "book **about** Rome"
- **Subject**: "discutere **su** politica" → "discuss **about** politics"

##### 3. **"around"/"approximately"** - Approximation (Third: 10% usage)
- **Approximation**: "**sui** vent'anni" → "**around** twenty years old"
- **Estimation**: "costa **sui** cento euro" → "costs **around** a hundred euros"

###### PER - Purpose and Duration (4+ Major Translations)

##### 1. **"for"** - Purpose and Intended Recipient (Primary: 50% usage)
- **Purpose**: "regalo **per** te" → "gift **for** you"
- **Benefit**: "fatto **per** aiutare" → "done **for** helping"
- **Destination**: "partire **per** Roma" → "leave **for** Rome"

##### 2. **"through"/"by"** - Method and Passage (Secondary: 25% usage)
- **Method**: "**per** telefono" → "**by** phone"
- **Passage**: "passare **per** il parco" → "pass **through** the park"
- **Means**: "inviare **per** email" → "send **by** email"

##### 3. **"for"** - Duration (Third: 20% usage)
- **Time Duration**: "**per** tre ore" → "**for** three hours"
- **Period**: "**per** tutta la vita" → "**for** the whole life"

##### 4. **"because of"/"due to"** - Cause (Fourth: 5% usage)
- **Cause**: "**per** la pioggia" → "**because of** the rain"
- **Reason**: "**per** motivi di salute" → "**for** health reasons"

###### TRA/FRA - Position and Time (2+ Major Translations)

##### 1. **"between"/"among"** - Position and Choice (Primary: 70% usage)
- **Physical Position**: "**tra** Roma e Napoli" → "**between** Rome and Naples"
- **Choice**: "scegliere **tra** due opzioni" → "choose **between** two options"
- **Among Multiple**: "**tra** gli amici" → "**among** friends"

##### 2. **"in"/"within"** - Future Time (Secondary: 30% usage)
- **Future Time**: "**tra** poco" → "**in** a little while"
- **Time Period**: "**tra** due ore" → "**in** two hours"
- **Duration**: "finire **tra** un'ora" → "finish **in** an hour"

##### 5.1.6.4 Comprehensive Implementation Strategy

**Database Translation Structure**:
```sql
-- Comprehensive DI translations with educational usage notes
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(di_id, 'of', 1, 'POSSESSION & COMPOSITION: "la casa di Marco" (Marco''s house), "tavolo di legno" (wooden table). Use when DI establishes ownership, material composition, or intrinsic relationships between nouns. This is the fundamental meaning of DI.', 0.40),
(di_id, 'from', 2, 'ORIGIN & SOURCE: "sono di Roma" (I am from Rome), "vino d''Italia" (wine from Italy). Use when DI indicates geographic origin, source, or provenance. Often competes with DA, but DI indicates inherent origin rather than movement.', 0.25),
(di_id, 'about', 3, 'TOPIC & SUBJECT: "parlare di calcio" (talk about soccer), "libro di storia" (history book). Use when DI introduces topics, subjects, or informational content. Very common with communication verbs and content nouns.', 0.20),
(di_id, 'in', 4, 'TEMPORAL EXPRESSIONS: "di mattina" (in the morning), "d''estate" (in summer). Use in fixed temporal phrases for parts of day and seasons. These are largely idiomatic and must be memorized.', 0.10),
(di_id, 'some', 5, 'PARTITIVE FUNCTION: "del pane" (some bread), "degli studenti" (some students). Use when contracted DI+article expresses indefinite quantities. This is grammatical function, not lexical meaning.', 0.03),
(di_id, '(various)', 6, 'SPECIALIZED CONTEXTS: Age references, characteristic attribution, temporal specifications. Meaning depends heavily on semantic relationship being established.', 0.02);

-- Comprehensive A translations with educational usage notes
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(a_id, 'to', 1, 'DIRECTION & DESTINATION: "vado a scuola" (I go to school), "andare a Roma" (go to Rome). Use when A indicates physical movement or goal-oriented direction toward a destination. This is the fundamental directional meaning.', 0.35),
(a_id, 'at', 2, 'LOCATION & TIME POINTS: "sono a casa" (I am at home), "alle otto" (at eight o''clock). Use for static location (especially activities/buildings) and precise time points. Competes with IN but A suggests participation in activities.', 0.30),
(a_id, 'by', 3, 'METHOD & MANNER: "fatto a mano" (made by hand), "all''italiana" (in the Italian way). Use when A describes method, manner, or style of execution. Choice between "by" and "in" depends on English conventions.', 0.20),
(a_id, 'for', 4, 'PURPOSE & FUNCTION: "macchina a benzina" (gas car), "barca a vela" (sailboat). Use when A indicates purpose, function, or what something is designed for. Often creates compound noun concepts in English.', 0.10),
(a_id, 'in', 5, 'STATE & CONDITION: "a riposo" (at rest), "a disagio" (in discomfort). Use when A indicates being in a particular condition or state.', 0.05);

-- Comprehensive DA translations with educational usage notes
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(da_id, 'from', 1, 'ORIGIN & SEPARATION: "vengo da Milano" (I come from Milan), "lontano da casa" (far from home). Use when DA indicates physical or conceptual starting points, origins, or separation. This is DA''s most fundamental meaning.', 0.40),
(da_id, 'since', 2, 'TEMPORAL STARTING POINTS: "da ieri" (since yesterday), "da bambino" (since childhood). Use "since" for specific starting points, "from" for time ranges, sometimes "for" in duration contexts (translation accommodation).', 0.25),
(da_id, 'by', 3, 'PASSIVE VOICE AGENT: "fatto da me" (made by me), "scritto da Dante" (written by Dante). Use when DA introduces the agent or cause in passive constructions. Crucial grammatical function of DA.', 0.20),
(da_id, 'for', 4, 'CHARACTERISTIC PURPOSE: "macchina da corsa" (racing car), "occhiali da sole" (sunglasses). Use when DA indicates characteristic or inherent purpose. Creates compound nouns. Distinguish from A+purpose (immediate use) vs DA+purpose (characteristic function).', 0.10),
(da_id, 'as', 5, 'ROLE & CAPACITY: "lavorare da professore" (work as a professor), "comportarsi da adulto" (behave as an adult). Use when DA indicates the role, capacity, or manner in which someone acts.', 0.05);

-- Comprehensive IN translations with educational usage notes
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(in_id, 'in', 1, 'CONTAINMENT & STATE: "in cucina" (in the kitchen), "in pace" (in peace), "in italiano" (in Italian). Use for physical containment, abstract states, and medium of expression. Most fundamental meaning - being within something.', 0.50),
(in_id, 'during', 2, 'TEMPORAL PERIODS: "in estate" (in summer), "nel 2024" (in 2024). Use "in" for years/seasons/long periods; "during" when emphasizing time frame within which something occurs.', 0.30),
(in_id, 'by', 3, 'TRANSPORT & METHOD: "in treno" (by train), "in contanti" (in cash). Use for enclosed transportation methods and certain means. Contrast with A (open transport) and CON (instrumental).', 0.15),
(in_id, 'into', 4, 'DIRECTION & TRANSFORMATION: "entrare in casa" (enter into the house), "andare in pensione" (go into retirement). Use when IN indicates movement toward containment or transformation into a state.', 0.05);

-- Comprehensive CON translations with educational usage notes
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(con_id, 'with', 1, 'ACCOMPANIMENT & INSTRUMENT: "con gli amici" (with friends), "con la penna" (with the pen), "con attenzione" (with attention). Primary meaning covering accompaniment, instrumentality, and manner.', 0.80),
(con_id, 'by', 2, 'METHOD & MEANS: "con il treno" (by train), "con email" (by email). Use for methods and means of communication or transport when emphasis is on the tool/method used.', 0.15),
(con_id, 'in', 3, 'MANNER & STATE: "con calma" (in a calm manner), "con fretta" (in a hurry). Use when CON describes manner or state, often translating to adverbial expressions in English.', 0.05);

-- Comprehensive SU translations with educational usage notes
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(su_id, 'on', 1, 'SURFACE & POSITION: "sul tavolo" (on the table), "sulla sedia" (on the chair). Use for physical surface contact, support, and positional relationships.', 0.60),
(su_id, 'about', 2, 'TOPIC & SUBJECT: "libro su Roma" (book about Rome), "discutere su politica" (discuss about politics). Use when SU introduces topics or subjects of discussion/content.', 0.30),
(su_id, 'around', 3, 'APPROXIMATION: "sui vent''anni" (around twenty years old), "costa sui cento euro" (costs around a hundred euros). Use for approximate quantities, ages, or estimates.', 0.10);

-- Comprehensive PER translations with educational usage notes
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(per_id, 'for', 1, 'PURPOSE & RECIPIENT: "regalo per te" (gift for you), "fatto per aiutare" (done for helping). Use for purpose, benefit, intended recipient, and destination.', 0.50),
(per_id, 'through', 2, 'METHOD & PASSAGE: "per telefono" (by phone), "passare per il parco" (pass through the park). Use for methods, means of communication, and physical passage.', 0.25),
(per_id, 'for', 3, 'DURATION: "per tre ore" (for three hours), "per tutta la vita" (for the whole life). Use for time duration and periods. Same English translation as purpose but different semantic function.', 0.20),
(per_id, 'because of', 4, 'CAUSE & REASON: "per la pioggia" (because of the rain), "per motivi di salute" (for health reasons). Use when PER indicates cause or reason.', 0.05);

-- Comprehensive TRA/FRA translations with educational usage notes
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(tra_id, 'between', 1, 'POSITION & CHOICE: "tra Roma e Napoli" (between Rome and Naples), "scegliere tra due opzioni" (choose between two options). Use for physical position, choice situations, and relationships among multiple items.', 0.70),
(tra_id, 'in', 2, 'FUTURE TIME: "tra poco" (in a little while), "tra due ore" (in two hours). Use for future time expressions indicating when something will happen. Common temporal usage of TRA.', 0.30);
```

**Educational Display Features**:
- **Semantic Function Headers**: Clear categorization of each translation meaning
- **Contextual Triggers**: Explanation of when to use each translation
- **Contrastive Notes**: Comparison with competing prepositions (DI vs DA, A vs IN, etc.)
- **Frequency Indicators**: Priority order based on actual usage frequency
- **Common Confusion Points**: Explicit clarification of learner difficulties
- **Fixed Expression Alerts**: Identification of idiomatic temporal expressions
- **Translation Strategy Guides**: Meta-cognitive strategies for choosing correct translation

#### 5.1.7 Form Metadata and Strategy

**Contracted preposition metadata approach**:

- **For contracted forms only**: Gender/number agreement using existing `metaattr011` (gender) + `metaattr012` (number)
- **Form type stored in database column**: Form type (contracted) is stored in the database `form_type` column, not in metadata
- **No form type metadata needed**: Since only contracted forms exist for prepositions, no metadata attribute is required

**Example Translation Strategy for "di"**:
```sql
INSERT INTO word_translations (word_id, translation, display_priority, usage_notes, frequency_estimate) VALUES
(di_id, 'of', 1, 'possession, partitive relations', 0.4),
(di_id, 'from', 2, 'origin, source location', 0.3),
(di_id, 'about', 3, 'topic, subject matter', 0.2),
(di_id, 'in', 4, 'temporal expressions: di sera', 0.1);
```

##### 5.1.7.1 Forms Implementation Strategy

**Recommended Implementation**:

1. **Store All Contractions**: Store every contracted form (del, dello, della, dei, degli, delle, etc.) as individual database entries
2. **No Adverb Construction Storage**: "davanti a", "prima di" etc. are handled via adverb government (metaattr055)
3. **Database-Driven Display**: Retrieve contracted forms directly from word_forms table
4. **Clean Separation**: Prepositions handle only true prepositional words, adverb constructions handled separately

**Database-Driven Form Retrieval**:
```javascript
// Retrieve contracted forms directly from database
async function getPrepositionForm(preposition, gender, number) {
  const contractedForm = await database.query(`
    SELECT form FROM word_forms
    WHERE word_id = ? AND gender = ? AND number = ? AND form_type = 'contracted'
  `, [preposition.id, gender, number]);

  return contractedForm || preposition.base_form;
}
```

**Frontend Features**:
- **Dynamic Contraction Display**: Show appropriate contracted form based on following noun
- **Clean Preposition Display**: Display only true prepositions without adverb constructions
- **Semantic Role Indicators**: Visual indicators for possession, direction, temporal functions
- **Usage Context Examples**: Show different semantic contexts for each translation
- **Phonetic Rule Education**: Help users understand contraction patterns
- **Construction Reference**: Link to adverb government patterns for "davanti a" type constructions

#### 5.1.8 Systematic Adverb-Preposition Construction Patterns

**ARCHITECTURAL INSIGHT**: What Italian learners often struggle with as "compound prepositions" are actually systematic adverb + preposition constructions that follow predictable patterns. This understanding transforms rote memorization into pattern recognition.

##### 5.1.8.1 Pattern 1: Spatial Adverbs + "a"

**Semantic Pattern**: Physical position and directional relationships

**Core Examples**:
- davanti a (in front of) - davanti (adverb) + a (preposition)
- dietro a (behind) - dietro (adverb) + a (preposition)
- accanto a (next to) - accanto (adverb) + a (preposition)
- vicino a (near to) - vicino (adverb) + a (preposition)
- intorno a (around) - intorno (adverb) + a (preposition)
- sopra a (above) - sopra (adverb) + a (preposition)
- sotto a (below) - sotto (adverb) + a (preposition)

**Pattern Recognition**: Spatial concepts requiring a reference point naturally use "a" to indicate direction or relationship *to* something.

**Usage**: "La macchina è davanti **a** casa" (The car is in front **of** the house)

##### 5.1.8.2 Pattern 2: Temporal Adverbs + "di"

**Semantic Pattern**: Time relationships and sequence

**Core Examples**:
- prima di (before) - prima (adverb) + di (preposition)
- dopo di (after) - dopo (adverb) + di (preposition)
- invece di (instead of) - invece (adverb) + di (preposition)

**Pattern Recognition**: Temporal relationships often use "di" to indicate relationship *of* or *from* a time reference point.

**Usage**: "Studia prima **di** dormire" (Study before **_** sleeping)

##### 5.1.8.3 Pattern 3: Distance Adverbs + "da"

**Semantic Pattern**: Separation, distance, and origin

**Core Examples**:
- lontano da (far from) - lontano (adverb) + da (preposition)
- distante da (distant from) - distante (adverb) + da (preposition)
- via da (away from) - via (adverb) + da (preposition)

**Pattern Recognition**: Distance and separation concepts use "da" to indicate movement or measurement *from* a reference point.

**Usage**: "Roma è lontano **da** Milano" (Rome is far **from** Milan)

##### 5.1.8.4 Educational Benefits of Pattern Recognition

**1. Reduced Memorization Load**:
Instead of memorizing 20+ "compound prepositions," learners recognize 3 systematic patterns.

**2. Productive Competence**:
Understanding patterns allows learners to produce new constructions: "dentro a" (inside of), "fuori da" (outside from).

**3. Cross-Linguistic Understanding**:
Patterns reveal the logical structure of Italian spatial and temporal expressions.

**4. Error Reduction**:
Systematic understanding prevents common errors like *"davanti di"* or *"prima a"*.

##### 5.1.8.5 Implementation in Misti Dictionary

**Adverb Entries**: Each spatial/temporal adverb includes `metaattr055` (Adverb Government) indicating which preposition it governs.

**Preposition Entries**: Clean preposition entries focus on core prepositional meanings without "compound" confusion.

**Educational Display**: Frontend shows both the individual adverb meaning and its systematic prepositional construction pattern.

**Advanced Learning**: Users can filter by government pattern to study systematic constructions.

---

### 5.2 DETERMINER

#### 5.2.1 What is a Determiner

Determiners are a fundamental class of words that introduce and modify nouns, providing essential information about specificity, quantity, possession, and reference. In Italian, determiners form a complex system that agrees with nouns in gender and number, making them crucial for proper sentence construction and comprehension.

**Core Function**: Determiners specify which noun is being referenced and provide context about its definiteness, quantity, or relationship to the speaker. Unlike adjectives, which describe qualities, determiners establish the referential framework for nouns.

**Six Major Categories**:
1. **Definite Articles** - Specify known, specific entities
2. **Indefinite Articles** - Introduce new or non-specific entities
3. **Demonstratives** - Indicate spatial or temporal reference
4. **Possessives** - Express ownership or relationship
5. **Quantifiers** - Specify amount, quantity, or degree
6. **Interrogatives** - Form questions about identity or quantity

#### 5.2.2 Italian Determiner Categories

**Definite Articles**:
- **Masculine Singular**: il (general), lo (before s+consonant, z, gn, ps, x, y), l' (before vowels)
- **Feminine Singular**: la (general), l' (before vowels)
- **Masculine Plural**: i (from il), gli (from lo and l')
- **Feminine Plural**: le (from la and l')

**Indefinite Articles**:
- **Masculine**: un (general), uno (before s+consonant, z, gn, ps, x, y)
- **Feminine**: una (general), un' (before vowels)
- **Usage**: Introduce new entities, express "a/an" meaning

**Demonstratives**:
- **questo system** (this/these): questo, questa, questi, queste
- **quello system** (that/those): quello, quella, quelli, quelle
- **codesto system** (that near you - regional): codesto, codesta, codesti, codeste

**Possessives**:
- **First Person**: mio/mia/miei/mie (my), nostro/nostra/nostri/nostre (our)
- **Second Person**: tuo/tua/tuoi/tue (your), vostro/vostra/vostri/vostre (your plural)
- **Third Person**: suo/sua/suoi/sue (his/her/its), loro (their - invariable)

**Quantifiers**:
- **Specific Amount**: alcuni/alcune (some), molti/molte (many), tutti/tutte (all)
- **Degree**: poco/poca/pochi/poche (little/few), tanto/tanta/tanti/tante (much/many)
- **Universal**: ogni (every - invariable), qualche (some - invariable)

**Interrogatives**:
- **Identity**: quale/quali (which), che (what - invariable)
- **Quantity**: quanto/quanta/quanti/quante (how much/many)

#### 5.2.3 Forms Architecture Strategy

**Universal Pattern for ALL Determiner Categories**:
The forms architecture follows a consistent pattern across all six determiner categories:
- **Different semantic content** (gender, person, function) = **separate dictionary entries**
- **Number variations (singular → plural)** = **forms of the base word**
- **Phonetic variations (elision, contractions)** = **forms of the base word**

**Articles - Dictionary Entries vs Forms**:
Articles are organized by semantic function and phonetic context:

```sql
-- Dictionary entries: Only base words (different semantic contexts)
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('il', 'determiner', 'il', '/il/'),    -- General masculine context
('la', 'determiner', 'la', '/la/'),    -- Feminine context
('lo', 'determiner', 'lo', '/lo/');    -- Special masculine context (s+cons, z, etc.)

-- Forms: Number variations of base words (i, le, gli are ONLY forms)
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(il_id, 'i', 'plural'),         -- plural form of 'il'
(la_id, 'le', 'plural'),        -- plural form of 'la'
(lo_id, 'gli', 'plural');       -- plural form of 'lo'
```

**Demonstratives - Gender = Entries, Number = Forms**:
Different genders require separate entries, plurals are forms:

```sql
-- Dictionary entries: Different genders (semantic content)
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('questo', 'determiner', 'KWES-to', '/ˈkwes.to/'), -- Masculine "this"
('questa', 'determiner', 'KWES-ta', '/ˈkwes.ta/'), -- Feminine "this"
('quello', 'determiner', 'KWEL-lo', '/ˈkwel.lo/'), -- Masculine "that"
('quella', 'determiner', 'KWEL-la', '/ˈkwel.la/'); -- Feminine "that"

-- Forms: Number variations only
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(questo_id, 'questi', 'plural'), -- plural form of 'questo'
(questa_id, 'queste', 'plural'), -- plural form of 'questa'
(quello_id, 'quelli', 'plural'), -- plural form of 'quello'
(quella_id, 'quelle', 'plural'); -- plural form of 'quella'
```

**Possessives - Person = Entries, Gender/Number = Forms**:
Different persons require separate entries, gender/number variations are forms:

```sql
-- Dictionary entries: Different persons (semantic content)
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('mio', 'determiner', 'MEE-o', '/ˈmi.o/'),    -- First person singular
('tuo', 'determiner', 'TOO-o', '/ˈtu.o/'),    -- Second person singular
('suo', 'determiner', 'SOO-o', '/ˈsu.o/'),    -- Third person singular
('nostro', 'determiner', 'NOS-tro', '/ˈnos.tro/'), -- First person plural
('vostro', 'determiner', 'VOS-tro', '/ˈvos.tro/'), -- Second person plural
('loro', 'determiner', 'LO-ro', '/ˈlo.ro/');   -- Third person plural

-- Forms: Gender and number variations
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(mio_id, 'mia', 'feminine'),     -- feminine form of 'mio'
(mio_id, 'miei', 'plural'),      -- masculine plural form of 'mio'
(mio_id, 'mie', 'feminine_plural'); -- feminine plural form of 'mio'
```

**Indefinite Articles - Context = Entries, Contractions = Forms**:
Different phonetic contexts require separate entries:

```sql
-- Dictionary entries: Different phonetic contexts (semantic content)
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('un', 'determiner', 'un', '/un/'),     -- General masculine
('uno', 'determiner', 'OO-no', '/ˈu.no/'),    -- Special masculine (s+cons, z, etc.)
('una', 'determiner', 'OO-na', '/ˈu.na/');    -- General feminine

-- Forms: Phonetic variations (contractions)
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(una_id, "un'", 'elision');      -- elided form of 'una' before vowels
```

**Quantifiers - Semantic Function = Entries, Gender/Number = Forms**:
Different semantic functions require separate entries:

```sql
-- Dictionary entries: Different semantic functions
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('molto', 'determiner', 'MOL-to', '/ˈmol.to/'),  -- "much/many" concept
('poco', 'determiner', 'PO-ko', '/ˈpo.ko/'),   -- "little/few" concept
('tutto', 'determiner', 'TUT-to', '/ˈtut.to/');  -- "all" concept

-- Forms: Gender and number variations
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(molto_id, 'molta', 'feminine'),   -- feminine form of 'molto'
(molto_id, 'molti', 'plural'),     -- masculine plural form of 'molto'
(molto_id, 'molte', 'feminine_plural'); -- feminine plural form of 'molto'
```

**Interrogatives - Function = Entries, Number = Forms**:
Different interrogative functions require separate entries:

```sql
-- Dictionary entries: Different interrogative functions
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('quale', 'determiner', 'KWA-le', '/ˈkwa.le/'),  -- "which" concept
('quanto', 'determiner', 'KWAN-to', '/ˈkwan.to/'), -- "how much/many" concept masculine
('quanta', 'determiner', 'KWAN-ta', '/ˈkwan.ta/'); -- "how much/many" concept feminine

-- Forms: Number variations only
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(quale_id, 'quali', 'plural'),     -- plural form of 'quale'
(quanto_id, 'quanti', 'plural'),   -- plural form of 'quanto'
(quanta_id, 'quante', 'plural');   -- plural form of 'quanta'
```

**Phonetic Contraction Handling (l', un')**:
Elided forms require multiple form entries to maintain search accuracy:

```sql
-- l' as form of three different articles
INSERT INTO word_forms (word_id, form_text, form_type, tags) VALUES
(il_id, "l'", 'elision', ['before_vowel', 'masculine', 'singular']),
(la_id, "l'", 'elision', ['before_vowel', 'feminine', 'singular']),
(lo_id, "l'", 'elision', ['before_vowel', 'masculine', 'singular']);

-- un' as form of una before vowels
INSERT INTO word_forms (word_id, form_text, form_type, tags) VALUES
(una_id, "un'", 'elision', ['before_vowel', 'feminine', 'singular']);
```

**Key Principle Applied Universally**:
**Plurals are ALWAYS forms of the base word** across ALL six determiner categories. This ensures consistency and predictable architecture throughout the determiner system.

**Searchability Priority**: Every visible word form gets a searchable entry to support learner lookup patterns and educational discovery.

#### 5.2.4 Storage Strategy

**Store ALL Determiner Forms (No Calculation)**:
Given the irregular patterns, phonetic conditioning, and high frequency of determiners, all forms are stored in the database rather than calculated on-demand.

**Form Type Column Requirements**:
- `base` - Primary citation form
- `agreement` - Gender/number agreement variants
- `elision` - Contracted forms (l', un', etc.)
- `plural` - Plural formations (use irregular metadata attribute for non-standard patterns)

**Pronunciation Columns for All Entries**:
All determiner entries include both pronunciation columns to support proper learning:

```sql
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('gli', 'determiner', 'lee', '/ʎi/'),
('l''', 'determiner', 'l', '/l/'),
('uno', 'determiner', 'OO-no', '/ˈu.no/');
```

**Multiple Form Relationships**:
Forms can belong to multiple base words (l' → il, la, lo) using junction table approach:

```sql
CREATE TABLE form_base_relationships (
    form_id UUID REFERENCES word_forms(id),
    base_word_id UUID REFERENCES dictionary(id),
    relationship_type TEXT,
    conditions TEXT[]
);
```

#### 5.2.5 Word-Level Metadata

**metaattr028 - Determiner Type** (6 values):
- `definite` - Definite articles (il, la, lo, etc.)
- `indefinite` - Indefinite articles (un, una, uno)
- `demonstrative` - Demonstratives (questo, quello, codesto)
- `possessive` - Possessives (mio, tuo, suo, etc.)
- `quantifier` - Quantifiers (alcuni, molti, tutto, etc.)
- `interrogative` - Interrogative determiners (quale, quanto, che)

**metaattr029 - Person** (possessives only, 3 values):
- `first` - First person (mio, nostro)
- `second` - Second person (tuo, vostro)
- `third` - Third person (suo, loro)

**Standard Universal Attributes**:
- `metaattr003` - **CEFR Level**: A1-C2 classification
- `metaattr007` - **Frequency Tier**: Usage frequency ranking
- `metaattr008` - **Register**: formal, informal, literary, spoken

<details>
<summary><strong>Determiner Metadata Implementation Examples</strong></summary>

```sql
-- Definite article metadata
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(il_id, 'metaattr028', 'uuid-definite'),
(il_id, 'metaattr003', 'uuid-A1'),
(il_id, 'metaattr007', 'uuid-top100');

-- Possessive metadata with person
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(mio_id, 'metaattr028', 'uuid-possessive'),
(mio_id, 'metaattr029', 'uuid-first'),
(mio_id, 'metaattr003', 'uuid-A1');

-- Interrogative metadata
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(quale_id, 'metaattr028', 'uuid-interrogative'),
(quale_id, 'metaattr003', 'uuid-A2');
```
</details>

#### 5.2.6 Translation Metadata and Strategy

**Context-Dependent Translation Approach**:
Determiners require sophisticated translation handling due to significant structural differences between Italian and English systems.

**Article Translation Challenges**:
- **Definite Articles**: Italian has 7 forms (il, la, lo, l', i, gli, le) → English "the"
- **Usage Contexts**: Italian uses definite articles with abstract nouns, body parts, and in many contexts where English omits articles
- **Educational Priority**: Show when Italian requires articles but English doesn't

**Possessive Disambiguation Strategy**:
Italian third-person possessives require context for English translation:
- `suo libro` → "his book" OR "her book" OR "its book"
- `sua casa` → "his house" OR "her house" OR "its house"
- Translation metadata must indicate ambiguity

**Educational Translation Examples**:

<details>
<summary><strong>Article Translation Patterns</strong></summary>

```sql
-- Definite article with multiple usage contexts
INSERT INTO word_translations (word_id, translation_text, usage_notes) VALUES
(il_id, 'the', 'Used before masculine singular nouns starting with consonants'),
(il_id, 'the', 'Required with abstract nouns: il coraggio (courage)'),
(il_id, '(omitted)', 'English often omits where Italian requires: il calcio (soccer)');

-- Possessive with disambiguation
INSERT INTO word_translations (word_id, translation_text, usage_notes) VALUES
(suo_id, 'his', 'When referring to masculine possessor'),
(suo_id, 'her', 'When referring to feminine possessor'),
(suo_id, 'its', 'When referring to non-human possessor');
```
</details>

#### 5.2.7 Form Metadata and Strategy

**Correct Form Relationships Based on Universal Pattern**:
Form relationships follow the corrected universal pattern across all determiner categories:

```sql
-- Articles: Number forms of base entries
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(il_id, 'i', 'plural'),           -- 'i' is form of base word 'il'
(la_id, 'le', 'plural'),          -- 'le' is form of base word 'la'
(lo_id, 'gli', 'plural');         -- 'gli' is form of base word 'lo'

-- Demonstratives: Number forms of gender base entries
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(questo_id, 'questi', 'plural'),  -- 'questi' is form of base word 'questo'
(questa_id, 'queste', 'plural');  -- 'queste' is form of base word 'questa'

-- Possessives: Gender/number forms of person base entries
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(mio_id, 'mia', 'feminine'),      -- 'mia' is form of base word 'mio'
(mio_id, 'miei', 'plural'),       -- 'miei' is form of base word 'mio'
(mio_id, 'mie', 'feminine_plural'); -- 'mie' is form of base word 'mio'
```

**Gender/Number System Reuse**:
Forms use the same gender/number metadata system as adjectives for consistency:

```sql
-- Reuse existing gender/number attributes for forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
(i_form_id, 'metaattr011', 'uuid-masculine'),  -- Gender
(i_form_id, 'metaattr012', 'uuid-plural'),     -- Number
(mia_form_id, 'metaattr011', 'uuid-feminine'), -- Gender
(mia_form_id, 'metaattr012', 'uuid-singular'); -- Number
```

**Multiple Contraction Handling**:
Phonetic contractions like `l'` that derive from multiple base words require multiple form entries:

```sql
-- Each contraction creates a separate form entry for each base word
INSERT INTO word_forms (word_id, form_text, form_type, tags) VALUES
(il_id, "l'", 'elision', ['before_vowel', 'masculine']),
(la_id, "l'", 'elision', ['before_vowel', 'feminine']),
(lo_id, "l'", 'elision', ['before_vowel', 'masculine_special']);
```

**Possessive Agreement Patterns**:
Possessives agree with the possessed noun, not the possessor. The base word represents the person (semantic content), while forms represent the agreement:
- `il mio libro` → base: mio (1st person), form: mio (masculine because libro is masculine)
- `la mia casa` → base: mio (1st person), form: mia (feminine because casa is feminine)

**Form Search Auto-Display**:
When users search for any determiner form, auto-display the base word and complete paradigm to reinforce the universal pattern and improve learning outcomes.

#### 5.2.8 Educational Architecture Insights

**Research-Based Design Principles**:
1. **Explicit Form Storage**: L2 learners need to see all determiner variants explicitly rather than inferring patterns
2. **Searchability Priority**: Students often search for the exact form they encounter in text
3. **Contraction Transparency**: Make phonetic contractions (l', un') transparent and searchable
4. **Agreement Visualization**: Show complete paradigms to reinforce gender/number agreement patterns

**Searchability vs Learning Balance**:
- Store high-frequency forms as separate entries (il, la, lo)
- Link agreement forms to base words for paradigm learning
- Provide cross-references between related forms
- Enable both form-specific and paradigm-based searches

**L2 Learning Challenges**:
- **Article Selection**: Complex phonetic and morphological conditioning
- **Possessive Agreement**: Agreement with possessed item, not possessor
- **Contraction Recognition**: l' can represent multiple underlying forms
- **Usage Contexts**: When to use/omit articles compared to English

**Progressive Teaching Approach**:
1. **A1**: Basic article forms (il, la, un, una)
2. **A1-A2**: Demonstratives and possessives
3. **A2-B1**: Complete article system including contractions
4. **B1+**: Quantifiers and complex agreement patterns

#### 5.2.9 Implementation Examples

<details>
<summary><strong>Complete SQL Implementation Examples</strong></summary>

```sql
-- 1. Base determiner words (following universal pattern)
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
-- Articles: Different semantic contexts = separate entries
('il', 'determiner', 'il', '/il/'),
('la', 'determiner', 'la', '/la/'),
('lo', 'determiner', 'lo', '/lo/'),

-- Demonstratives: Different genders = separate entries
('questo', 'determiner', 'KWES-to', '/ˈkwes.to/'),
('questa', 'determiner', 'KWES-ta', '/ˈkwes.ta/'),
('quello', 'determiner', 'KWEL-lo', '/ˈkwel.lo/'),
('quella', 'determiner', 'KWEL-la', '/ˈkwel.la/'),

-- Possessives: Different persons = separate entries
('mio', 'determiner', 'MEE-o', '/ˈmi.o/'),
('tuo', 'determiner', 'TOO-o', '/ˈtu.o/'),
('suo', 'determiner', 'SOO-o', '/ˈsu.o/');

-- 2. Forms: Number variations and contractions only
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
-- Article plurals (number variations)
(il_id, 'i', 'plural'),
(la_id, 'le', 'plural'),
(lo_id, 'gli', 'plural'),

-- Article contractions (phonetic variations)
(il_id, "l'", 'elision'),
(la_id, "l'", 'elision'),
(lo_id, "l'", 'elision'),

-- Demonstrative plurals (number variations)
(questo_id, 'questi', 'plural'),
(questa_id, 'queste', 'plural'),
(quello_id, 'quelli', 'plural'),
(quella_id, 'quelle', 'plural'),

-- Possessive gender/number variations (forms only)
(mio_id, 'mia', 'feminine'),
(mio_id, 'miei', 'plural'),
(mio_id, 'mie', 'feminine_plural'),
(tuo_id, 'tua', 'feminine'),
(tuo_id, 'tuoi', 'plural'),
(tuo_id, 'tue', 'feminine_plural');

-- 3. Metadata assignments (base words only)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
-- Type classifications for all base words
(il_id, 'metaattr028', 'uuid-definite'),
(la_id, 'metaattr028', 'uuid-definite'),
(lo_id, 'metaattr028', 'uuid-definite'),
(questo_id, 'metaattr028', 'uuid-demonstrative'),
(questa_id, 'metaattr028', 'uuid-demonstrative'),
(quello_id, 'metaattr028', 'uuid-demonstrative'),
(quella_id, 'metaattr028', 'uuid-demonstrative'),
(mio_id, 'metaattr028', 'uuid-possessive'),
(tuo_id, 'metaattr028', 'uuid-possessive'),
(suo_id, 'metaattr028', 'uuid-possessive'),

-- Person metadata for possessives
(mio_id, 'metaattr029', 'uuid-first'),
(tuo_id, 'metaattr029', 'uuid-second'),
(suo_id, 'metaattr029', 'uuid-third'),

-- CEFR levels
(il_id, 'metaattr003', 'uuid-A1'),
(la_id, 'metaattr003', 'uuid-A1'),
(questo_id, 'metaattr003', 'uuid-A1'),
(questa_id, 'metaattr003', 'uuid-A1'),
(mio_id, 'metaattr003', 'uuid-A1');

-- 4. Translation examples with context
INSERT INTO word_translations (word_id, translation_text, usage_notes, example_usage) VALUES
(il_id, 'the', 'Definite article for masculine singular nouns', 'il libro (the book)'),
(la_id, 'the', 'Definite article for feminine singular nouns', 'la casa (the house)'),
(questo_id, 'this', 'Near demonstrative, masculine singular', 'questo tavolo (this table)'),
(questa_id, 'this', 'Near demonstrative, feminine singular', 'questa sedia (this chair)'),
(mio_id, 'my', 'First person possessive, masculine form', 'il mio amico (my friend)');
```
</details>

<details>
<summary><strong>Search Functionality Examples</strong></summary>

```javascript
// Search handling for determiner forms
function handleDeterminerSearch(searchTerm) {
    // Direct form match
    if (searchTerm === "l'") {
        return {
            directMatches: ['il', 'la', 'lo'],
            formType: 'elision',
            explanation: "l' can be the contracted form of il, la, or lo before vowels"
        };
    }

    // Base word with forms display
    if (searchTerm === 'questa') {
        return {
            baseWord: 'questa',
            forms: ['queste'],
            wordType: 'base_entry',
            explanation: "'questa' is a base word (feminine demonstrative); 'queste' is its plural form"
        };
    }

    // Form with base word display
    if (searchTerm === 'questi') {
        return {
            baseWord: 'questo',
            formType: 'plural',
            relatedForms: true,
            explanation: "'questi' is the plural form of base word 'questo'"
        };
    }
}

// Auto-display base word and forms (corrected architecture)
function showDeterminerParadigm(baseWordId, determinerType) {
    if (determinerType === 'demonstrative') {
        // For gender-based entries like demonstratives
        return `
            <div class="paradigm-display">
                <h4>Base Words and Forms</h4>
                <div class="architecture-grid">
                    <div><strong>Base:</strong> questo → <strong>Form:</strong> questi</div>
                    <div><strong>Base:</strong> questa → <strong>Form:</strong> queste</div>
                </div>
                <p class="architecture-note">Gender = separate entries, Number = forms</p>
            </div>
        `;
    } else if (determinerType === 'possessive') {
        // For person-based entries like possessives
        return `
            <div class="paradigm-display">
                <h4>Base Word and Forms</h4>
                <div class="architecture-grid">
                    <div><strong>Base:</strong> mio (1st person)</div>
                    <div><strong>Forms:</strong> mia, miei, mie</div>
                </div>
                <p class="architecture-note">Person = separate entries, Gender/Number = forms</p>
            </div>
        `;
    }
}
```
</details>

<details>
<summary><strong>Translation Examples with Usage Notes</strong></summary>

```sql
-- Complex translation scenarios
INSERT INTO word_translations (word_id, translation_text, usage_notes, register_notes) VALUES
-- Definite articles with usage contexts
(il_id, 'the', 'General masculine singular definite article', 'neutral'),
(il_id, 'the', 'Required with abstract nouns in Italian', 'academic'),
(il_id, '(often omitted)', 'English may omit where Italian requires', 'educational'),

-- Possessive disambiguation
(suo_id, 'his', 'When possessor is masculine', 'neutral'),
(suo_id, 'her', 'When possessor is feminine', 'neutral'),
(suo_id, 'its', 'When possessor is non-human', 'neutral'),

-- Demonstrative with spatial reference
(quello_id, 'that', 'Distant demonstrative', 'neutral'),
(quello_id, 'that', 'Can indicate time distance: in quell\'epoca', 'literary'),

-- Quantifier with degree
(molto_id, 'much', 'With singular uncountable nouns', 'neutral'),
(molti_id, 'many', 'With plural countable nouns', 'neutral');
```
</details>

---

### 5.3 CONJUNCTION

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

### 5.4 PRONOUN

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

### 5.5 MODAL VERBS

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

### 5.6 PROPER NOUN

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

### 5.7 WH-WORDS

**Implementation Status**: 📋 **Planned**

**Examples**: come, quando, dove, comunque, ove, ovunque, laddove

**Planned Word-Level Metadata**:
- `metaattr047` - **WH Type**: `interrogative`, `relative`, `conditional`, `universal`
- `metaattr048` - **Semantic Category**: `manner`, `time`, `place`, `reason`, `quantity`

---

### 5.8 PARTICLE NE

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

### 5.9 INTERJECTIONS

**Implementation Status**: 📋 **Planned**

**Examples**: ciao, ah, beh, eh, oh

**Planned Word-Level Metadata**:
- `metaattr050` - **Interjection Type**: `greeting`, `exclamation`, `hesitation`, `agreement`, `surprise`
- `metaattr051` - **Emotional Tone**: `positive`, `negative`, `neutral`, `surprise`, `doubt`

---

### 5.10 ABBREVIATIONS

**Implementation Status**: 📋 **Planned**

**Examples**: ecc., etc, cfr., vs.

**Planned Word-Level Metadata**:
- `metaattr052` - **Abbreviation Type**: `latin`, `italian`, `international`
- `metaattr053` - **Expansion**: Store full form (ecc. → eccetera)

---

### 5.11 INDEFINITE PRONOUNS

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