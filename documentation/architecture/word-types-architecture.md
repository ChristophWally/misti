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
     - 5.2.1 [What is a Determiner](#521-what-is-a-determiner)
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

For more detail on preopisitions. Please see the detailed document: documentation/architecture/word-types-architecture-5-prepositions.md.

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

For more details on the Determiner layout, please see the document: documentation/architecture/word-types-architecture-6-determiner.md

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
