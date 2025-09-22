# Italian Determiner Architecture - Complete Implementation Guide

## Table of Contents

1. [Overview and Definition](#1-overview-and-definition)
   - 1.1 [What is a Determiner](#11-what-is-a-determiner)
   - 1.2 [Core Function and Purpose](#12-core-function-and-purpose)
   - 1.3 [Six Major Categories](#13-six-major-categories)

2. [Italian Determiner Categories](#2-italian-determiner-categories)
   - 2.1 [Definite Articles](#21-definite-articles)
   - 2.2 [Indefinite Articles](#22-indefinite-articles)
   - 2.3 [Demonstratives](#23-demonstratives)
   - 2.4 [Possessives](#24-possessives)
   - 2.5 [Quantifiers](#25-quantifiers)
   - 2.6 [Interrogatives](#26-interrogatives)

3. [Storage Strategy and Metadata Architecture](#3-storage-strategy-and-metadata-architecture)
   - 3.1 [General Storage Strategy](#31-general-storage-strategy)
   - 3.2 [Applicable Metadata Attributes](#32-applicable-metadata-attributes)
   - 3.3 [Form Type Requirements](#33-form-type-requirements)
   - 3.4 [Pronunciation Column Requirements](#34-pronunciation-column-requirements)

4. [Word-Level Implementation Architecture](#4-word-level-implementation-architecture)
   - 4.1 [Articles - Complete Implementation](#41-articles---complete-implementation)
     - 4.1.1 [Definite Articles](#411-definite-articles)
     - 4.1.2 [Indefinite Articles](#412-indefinite-articles)
   - 4.2 [Demonstratives - Complete Implementation](#42-demonstratives---complete-implementation)
   - 4.3 [Possessives - Complete Implementation](#43-possessives---complete-implementation)
   - 4.4 [Quantifiers - Complete Implementation](#44-quantifiers---complete-implementation)
   - 4.5 [Interrogatives - Complete Implementation](#45-interrogatives---complete-implementation)
   - 4.6 [Implementation Completeness Verification](#46-implementation-completeness-verification)

5. [Translation and Form Architecture](#5-translation-and-form-architecture)
   - 5.1 [Context-Dependent Translation Approach](#51-context-dependent-translation-approach)
   - 5.2 [Article Translation Challenges](#52-article-translation-challenges)
   - 5.3 [Possessive Disambiguation Strategy](#53-possessive-disambiguation-strategy)
   - 5.4 [Form Relationships and Search](#54-form-relationships-and-search)

6. [Educational Architecture Insights](#6-educational-architecture-insights)
   - 6.1 [Research-Based Design Principles](#61-research-based-design-principles)
   - 6.2 [Searchability vs Learning Balance](#62-searchability-vs-learning-balance)
   - 6.3 [L2 Learning Challenges](#63-l2-learning-challenges)
   - 6.4 [Progressive Teaching Approach](#64-progressive-teaching-approach)

---

## 1. Overview and Definition

### 1.1 What is a Determiner

Determiners are a fundamental class of words that introduce and modify nouns, providing essential information about specificity, quantity, possession, and reference. In Italian, determiners form a complex system that agrees with nouns in gender and number, making them crucial for proper sentence construction and comprehension.

### 1.2 Core Function and Purpose

**Core Function**: Determiners specify which noun is being referenced and provide context about its definiteness, quantity, or relationship to the speaker. Unlike adjectives, which describe qualities, determiners establish the referential framework for nouns.

### 1.3 Six Major Categories

1. **Definite Articles** - Specify known, specific entities
2. **Indefinite Articles** - Introduce new or non-specific entities
3. **Demonstratives** - Indicate spatial or temporal reference
4. **Possessives** - Express ownership or relationship
5. **Quantifiers** - Specify amount, quantity, or degree
6. **Interrogatives** - Form questions about identity or quantity

---

## 2. Italian Determiner Categories

### 2.1 Definite Articles

- **Masculine Singular**: il (general), lo (before s+consonant, z, gn, ps, x, y), l' (before vowels)
- **Feminine Singular**: la (general), l' (before vowels)
- **Masculine Plural**: i (from il), gli (from lo and l')
- **Feminine Plural**: le (from la and l')

### 2.2 Indefinite Articles

- **Masculine**: un (general), uno (before s+consonant, z, gn, ps, x, y)
- **Feminine**: una (general), un' (before vowels)
- **Usage**: Introduce new entities, express "a/an" meaning

### 2.3 Demonstratives

- **questo system** (this/these): questo, questa, questi, queste
- **quello system** (that/those): quello, quella, quelli, quelle
- **codesto system** (that near you - regional): codesto, codesta, codesti, codeste

### 2.4 Possessives

- **First Person**: mio/mia/miei/mie (my), nostro/nostra/nostri/nostre (our)
- **Second Person**: tuo/tua/tuoi/tue (your), vostro/vostra/vostri/vostre (your plural)
- **Third Person**: suo/sua/suoi/sue (his/her/its), loro (their - invariable)

### 2.5 Quantifiers

- **Specific Amount**: alcuni/alcune (some), molti/molte (many), tutti/tutte (all)
- **Degree**: poco/poca/pochi/poche (little/few), tanto/tanta/tanti/tante (much/many)
- **Universal**: ogni (every - invariable), qualche (some - invariable)

### 2.6 Interrogatives

- **Identity**: quale/quali (which), che (what - invariable)
- **Quantity**: quanto/quanta/quanti/quante (how much/many)

---

## 3. Storage Strategy and Metadata Architecture

### 3.1 General Storage Strategy

**Store ALL Determiner Forms (No Calculation)**:
Given the irregular patterns, phonetic conditioning, and high frequency of determiners, all forms are stored in the database rather than calculated on-demand.

**Searchability Priority**: Every visible word form gets a searchable entry to support learner lookup patterns and educational discovery.

### 3.2 Applicable Metadata Attributes

**Core Determiner Metadata**:
- **metaattr028** - Determiner Type (5 values: article, demonstrative, possessive, quantifier, interrogative)
- **metaattr014** - Person (3 values, possessives only: prima-persona, seconda-persona, terza-persona)
- **metaattr011** - Gender (3 values, form-level: masculine, feminine, common-gender)
  * **masculine (M)** - Forms that agree with masculine nouns: il, un, questo, mio, quanto, molto, tutto
  * **feminine (F)** - Forms that agree with feminine nouns: la, una, questa, mia, quanta, molta, tutta
  * **common-gender (C)** - Forms that work with any gender or are invariable: loro, quale, che, ogni, qualche
- **metaattr012** - Number (2 values, form-level: singular, plural)
- **metaattr005** - Irregularity (if needed for irregular forms)

**Universal Attributes**:
- **metaattr003** - CEFR Level (A1-C2 classification)
- **metaattr007** - Frequency Tier (Usage frequency ranking)
- **metaattr008** - Register (formal, informal, literary, spoken)

### 3.3 Form Type Column Requirements

- `plural` - Number variations (i, le, gli, questi, queste, etc.)
- `elision` - Contracted forms (l', un', etc.)
- `feminine` - Gender variations (mia, tua, sua, etc.)
- Use gender/number metadata attributes for complete form classification

### 3.4 Pronunciation Column Requirements

All determiner entries include both pronunciation columns to support proper learning:

```sql
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('gli', 'determiner', 'LYEE', '/ʎi/'),
('l''', 'determiner', 'EL', '/l/'),
('uno', 'determiner', 'OO-no', '/ˈu.no/');
```

---

## 4. Word-Level Implementation Architecture

**Universal Pattern for ALL Determiner Categories**:
- **Different semantic content** (gender, person, function) = **separate dictionary entries**
- **Number variations (singular → plural)** = **forms of the base word**
- **Phonetic variations (elision, contractions)** = **forms of the base word**

### 4.1 Articles - Complete Implementation

**Unified Architecture Strategy**: Different phonetic contexts = separate entries, plurals and contractions = forms. Articles share unified phonetic conditioning rules but differ in semantic function (definite vs indefinite).

#### Unified Phonetic Conditioning Rules

**Phonetic Conditioning System**: Both definite and indefinite articles follow similar phonetic conditioning:
- **Before consonants**: Standard forms (il/un, la/una)
- **Before s+consonant, z, gn, ps, x, y**: Special forms (lo/uno)
- **Before vowels**: Elision forms (l'/un')
- **Plural formation**: Definite articles have plurals, indefinite articles don't

#### 4.1.1 Definite Articles

**Architecture Strategy**: Different phonetic contexts = separate entries, plurals = forms

##### Dictionary Entries and Forms
```sql
-- Dictionary entries: Only base words (different semantic contexts)
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('il', 'determiner', 'EEL', '/il/'),    -- General masculine context
('la', 'determiner', 'LAH', '/la/'),    -- Feminine context
('lo', 'determiner', 'LOH', '/lo/');    -- Special masculine context (s+cons, z, etc.)

-- Forms: Number variations and contractions
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
-- Plural forms
(il_id, 'i', 'plural', 'EE', '/i/'),         -- plural form of 'il'
(la_id, 'le', 'plural', 'LEH', '/le/'),      -- plural form of 'la'
(lo_id, 'gli', 'plural', 'LYEE', '/ʎi/'),    -- plural form of 'lo'
-- Elision forms
(il_id, "l'", 'elision', 'EL', '/l/'),       -- elided form before vowels
(la_id, "l'", 'elision', 'EL', '/l/'),       -- elided form before vowels
(lo_id, "l'", 'elision', 'EL', '/l/');       -- elided form before vowels
```

##### Complete Metadata Assignment
```sql
-- Determiner type classification
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(il_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(la_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(lo_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article'));

-- CEFR levels (A1 - fundamental)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(il_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(la_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(lo_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1'));

-- Gender metadata for base words
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(il_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(la_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(lo_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine'));

-- Number metadata for base words (singular)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(il_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(la_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(lo_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular'));

-- Form-level metadata for plural and elision forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
-- Plural forms get determiner type, gender, and number metadata
(i_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(i_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(i_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(le_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(le_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(le_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(gli_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(gli_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(gli_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
-- Elision forms maintain determiner type and singular metadata
(l_il_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(l_il_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(l_il_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(l_la_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(l_la_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(l_la_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(l_lo_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(l_lo_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(l_lo_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular'));

-- Frequency tier (top 100 - most common words)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(il_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top100')),
(la_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top100')),
(lo_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top100'));
```

#### 4.1.2 Indefinite Articles

**Architecture Strategy**: Different phonetic contexts = separate entries, contractions = forms

##### Dictionary Entries and Forms
```sql
-- Dictionary entries: Different phonetic contexts
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('un', 'determiner', 'OON', '/un/'),         -- General masculine
('uno', 'determiner', 'OO-no', '/ˈu.no/'),  -- Special masculine (s+cons, z, etc.)
('una', 'determiner', 'OO-na', '/ˈu.na/');  -- General feminine

-- Forms: Phonetic variations (contractions)
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(una_id, "un'", 'elision', 'OON', '/un/');  -- elided form before vowels
```

##### Complete Metadata Assignment
```sql
-- Determiner type classification
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(un_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(uno_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(una_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article'));

-- CEFR levels (A1 - fundamental)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(un_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(uno_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(una_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1'));

-- Gender metadata for base words
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(un_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(uno_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(una_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine'));

-- Number metadata for base words (singular - indefinite articles have no plural)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(un_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(uno_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(una_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular'));

-- Form-level metadata for elision form
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
(un_elision_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'article')),
(un_elision_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(un_elision_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular'));

-- Frequency tier (top 100)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(un_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top100')),
(uno_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top100')),
(una_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top100'));
```

### 4.2 Demonstratives - Complete Implementation

**Architecture Strategy**: Different genders = separate entries, plurals = forms

#### Dictionary Entries and Forms
```sql
-- Dictionary entries: Different genders (semantic content)
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('questo', 'determiner', 'KWES-to', '/ˈkwes.to/'), -- Masculine "this"
('questa', 'determiner', 'KWES-ta', '/ˈkwes.ta/'), -- Feminine "this"
('quello', 'determiner', 'KWEL-lo', '/ˈkwel.lo/'), -- Masculine "that"
('quella', 'determiner', 'KWEL-la', '/ˈkwel.la/'); -- Feminine "that"

-- Forms: Number variations only
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(questo_id, 'questi', 'plural', 'KWES-ti', '/ˈkwes.ti/'), -- plural form
(questa_id, 'queste', 'plural', 'KWES-te', '/ˈkwes.te/'), -- plural form
(quello_id, 'quelli', 'plural', 'KWEL-li', '/ˈkwel.li/'), -- plural form
(quella_id, 'quelle', 'plural', 'KWEL-le', '/ˈkwel.le/'); -- plural form
```

#### Complete Metadata Assignment
```sql
-- Determiner type classification
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(questo_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'demonstrative')),
(questa_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'demonstrative')),
(quello_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'demonstrative')),
(quella_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'demonstrative'));

-- Base gender metadata (inherent to word)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(questo_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(questa_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(quello_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(quella_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine'));

-- Number metadata for base words (singular)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(questo_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(questa_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(quello_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(quella_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular'));

-- Form-level metadata for plural forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
(questi_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'demonstrative')),
(questi_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(questi_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(queste_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'demonstrative')),
(queste_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(queste_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(quelli_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'demonstrative')),
(quelli_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(quelli_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(quelle_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'demonstrative')),
(quelle_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(quelle_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural'));

-- CEFR levels (A1-A2)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(questo_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(questa_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(quello_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(quella_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2'));

-- Frequency tier
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(questo_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(questa_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(quello_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(quella_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500'));
```

### 4.3 Possessives - Complete Implementation

**Architecture Strategy**: Different persons AND genders = separate entries, plurals = forms
**CRITICAL**: mia, tua, sua are BASE WORDS representing person + gender semantic content

#### Dictionary Entries and Forms
```sql
-- Dictionary entries: Different persons AND genders (semantic content)
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
-- First Person
('mio', 'determiner', 'MEE-o', '/ˈmi.o/'),      -- 1st person masculine
('mia', 'determiner', 'MEE-a', '/ˈmi.a/'),      -- 1st person feminine
('nostro', 'determiner', 'NOS-tro', '/ˈnos.tro/'), -- 1st plural masculine
('nostra', 'determiner', 'NOS-tra', '/ˈnos.tra/'), -- 1st plural feminine
-- Second Person
('tuo', 'determiner', 'TOO-o', '/ˈtu.o/'),      -- 2nd person masculine
('tua', 'determiner', 'TOO-a', '/ˈtu.a/'),      -- 2nd person feminine
('vostro', 'determiner', 'VOS-tro', '/ˈvos.tro/'), -- 2nd plural masculine
('vostra', 'determiner', 'VOS-tra', '/ˈvos.tra/'), -- 2nd plural feminine
-- Third Person
('suo', 'determiner', 'SOO-o', '/ˈsu.o/'),      -- 3rd person masculine
('sua', 'determiner', 'SOO-a', '/ˈsu.a/'),      -- 3rd person feminine
('loro', 'determiner', 'LO-ro', '/ˈlo.ro/');     -- 3rd plural (invariable)

-- Forms: Only number variations
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(mio_id, 'miei', 'plural', 'MEE-ei', '/ˈmi.ei/'),
(mia_id, 'mie', 'plural', 'MEE-e', '/ˈmi.e/'),
(tuo_id, 'tuoi', 'plural', 'TOO-oi', '/ˈtu.oi/'),
(tua_id, 'tue', 'plural', 'TOO-e', '/ˈtu.e/'),
(suo_id, 'suoi', 'plural', 'SOO-oi', '/ˈsu.oi/'),
(sua_id, 'sue', 'plural', 'SOO-e', '/ˈsu.e/'),
(nostro_id, 'nostri', 'plural', 'NOS-tri', '/ˈnos.tri/'),
(nostra_id, 'nostre', 'plural', 'NOS-tre', '/ˈnos.tre/'),
(vostro_id, 'vostri', 'plural', 'VOS-tri', '/ˈvos.tri/'),
(vostra_id, 'vostre', 'plural', 'VOS-tre', '/ˈvos.tre/');
```

#### Complete Metadata Assignment
```sql
-- Determiner type classification
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(mio_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(mia_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(tuo_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(tua_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(suo_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(sua_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(nostro_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(nostra_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(vostro_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(vostra_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(loro_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive'));

-- Person metadata (critical for possessives)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
-- First person
(mio_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'prima-persona')),
(mia_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'prima-persona')),
(nostro_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'prima-persona')),
(nostra_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'prima-persona')),
-- Second person
(tuo_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'seconda-persona')),
(tua_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'seconda-persona')),
(vostro_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'seconda-persona')),
(vostra_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'seconda-persona')),
-- Third person
(suo_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'terza-persona')),
(sua_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'terza-persona')),
(loro_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'terza-persona'));

-- Gender metadata for possessives (agreement pattern)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(mio_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(mia_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(tuo_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(tua_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(suo_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(sua_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(nostro_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(nostra_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(vostro_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(vostra_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(loro_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'common-gender'));

-- Number metadata for base words (singular)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(mio_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(mia_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(tuo_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(tua_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(suo_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(sua_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(nostro_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(nostra_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(vostro_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(vostra_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(loro_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular'));

-- Form-level metadata for plural forms (determiner type, gender and number)
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
(miei_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(miei_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(miei_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(mie_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(mie_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(mie_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(tuoi_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(tuoi_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(tuoi_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(tue_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(tue_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(tue_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(suoi_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(suoi_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(suoi_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(sue_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(sue_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(sue_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(nostri_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(nostri_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(nostri_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(nostre_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(nostre_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(nostre_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(vostri_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(vostri_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(vostri_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(vostre_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'possessive')),
(vostre_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(vostre_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural'));

-- Form-level person metadata for possessive plural forms (inherited from base words)
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
-- First person plural forms
(miei_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'prima-persona')),
(mie_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'prima-persona')),
(nostri_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'prima-persona')),
(nostre_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'prima-persona')),
-- Second person plural forms
(tuoi_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'seconda-persona')),
(tue_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'seconda-persona')),
(vostri_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'seconda-persona')),
(vostre_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'seconda-persona')),
-- Third person plural forms
(suoi_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'terza-persona')),
(sue_form_id, 'metaattr014', (SELECT id FROM meta_values WHERE value = 'terza-persona'));

-- CEFR levels (A1-A2)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(mio_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(mia_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(tuo_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(tua_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(suo_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(sua_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1')),
(nostro_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(nostra_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(vostro_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(vostra_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(loro_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2'));

-- Frequency tier (top 500 - very common)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(mio_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(mia_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(tuo_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(tua_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(suo_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(sua_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(nostro_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(nostra_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(vostro_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(vostra_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(loro_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000'));
```

### 4.4 Quantifiers - Complete Implementation

**Architecture Strategy**: Different semantic functions = separate entries, gender/number = forms

#### Dictionary Entries and Forms
```sql
-- Dictionary entries: Different semantic functions
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('molto', 'determiner', 'MOL-to', '/ˈmol.to/'),   -- "much/many" concept
('poco', 'determiner', 'PO-ko', '/ˈpo.ko/'),     -- "little/few" concept
('tutto', 'determiner', 'TUT-to', '/ˈtut.to/'),   -- "all" concept
('alcuni', 'determiner', 'al-KU-ni', '/alˈku.ni/'), -- "some" plural masculine
('alcune', 'determiner', 'al-KU-ne', '/alˈku.ne/'), -- "some" plural feminine
('ogni', 'determiner', 'O-nyee', '/ˈoɲ.ɲi/'),     -- "every" (invariable)
('qualche', 'determiner', 'kwal-KE', '/ˈkwal.ke/'); -- "some" (invariable)

-- Forms: Gender and number variations
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(molto_id, 'molta', 'feminine', 'MOL-ta', '/ˈmol.ta/'),
(molto_id, 'molti', 'plural', 'MOL-ti', '/ˈmol.ti/'),
(molto_id, 'molte', 'plural', 'MOL-te', '/ˈmol.te/'),
(poco_id, 'poca', 'feminine', 'PO-ka', '/ˈpo.ka/'),
(poco_id, 'pochi', 'plural', 'PO-ki', '/ˈpo.ki/'),
(poco_id, 'poche', 'plural', 'PO-ke', '/ˈpo.ke/'),
(tutto_id, 'tutta', 'feminine', 'TUT-ta', '/ˈtut.ta/'),
(tutto_id, 'tutti', 'plural', 'TUT-ti', '/ˈtut.ti/'),
(tutto_id, 'tutte', 'plural', 'TUT-te', '/ˈtut.te/');
```

#### Complete Metadata Assignment
```sql
-- Determiner type classification
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(molto_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(poco_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(tutto_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(alcuni_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(alcune_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(ogni_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(qualche_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier'));

-- Gender for quantifiers with inherent gender
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(molto_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(poco_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(tutto_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(alcuni_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(alcune_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(ogni_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'common-gender')),
(qualche_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'common-gender'));

-- Number metadata for base words
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(molto_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(poco_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(tutto_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(alcuni_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(alcune_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(ogni_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(qualche_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular'));

-- Form-level metadata for gender/number forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
(molta_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(molta_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(molta_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(molti_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(molti_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(molti_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(molte_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(molte_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(molte_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(poca_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(poca_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(poca_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(pochi_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(pochi_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(pochi_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(poche_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(poche_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(poche_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(tutta_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(tutta_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(tutta_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(tutti_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(tutti_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(tutti_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(tutte_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'quantifier')),
(tutte_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(tutte_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural'));

-- CEFR levels
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(molto_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(poco_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(tutto_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(alcuni_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'B1')),
(alcune_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'B1')),
(ogni_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(qualche_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'B1'));

-- Frequency tier
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(molto_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(poco_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(tutto_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(alcuni_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(alcune_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(ogni_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500')),
(qualche_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000'));
```

### 4.5 Interrogatives - Complete Implementation

**Architecture Strategy**: Different interrogative functions = separate entries, number = forms

#### Dictionary Entries and Forms
```sql
-- Dictionary entries: Different interrogative functions
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('quale', 'determiner', 'KWA-le', '/ˈkwa.le/'),   -- "which" concept
('quanto', 'determiner', 'KWAN-to', '/ˈkwan.to/'), -- "how much/many" masculine
('quanta', 'determiner', 'KWAN-ta', '/ˈkwan.ta/'), -- "how much/many" feminine
('che', 'determiner', 'KE', '/ke/');              -- "what" (invariable)

-- Forms: Number variations only
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(quale_id, 'quali', 'plural', 'KWA-li', '/ˈkwa.li/'),
(quanto_id, 'quanti', 'plural', 'KWAN-ti', '/ˈkwan.ti/'),
(quanta_id, 'quante', 'plural', 'KWAN-te', '/ˈkwan.te/');
```

#### Complete Metadata Assignment
```sql
-- Determiner type classification
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(quale_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'interrogative')),
(quanto_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'interrogative')),
(quanta_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'interrogative')),
(che_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'interrogative'));

-- Gender metadata
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(quale_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'common-gender')),
(quanto_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(quanta_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(che_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'common-gender'));

-- Number metadata for base words
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(quale_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(quanto_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(quanta_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular')),
(che_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'singular'));

-- Form-level metadata for plural forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
(quali_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'interrogative')),
(quali_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'common-gender')),
(quali_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(quanti_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'interrogative')),
(quanti_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'masculine')),
(quanti_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural')),
(quante_form_id, 'metaattr028', (SELECT id FROM meta_values WHERE value = 'interrogative')),
(quante_form_id, 'metaattr011', (SELECT id FROM meta_values WHERE value = 'feminine')),
(quante_form_id, 'metaattr012', (SELECT id FROM meta_values WHERE value = 'plural'));

-- CEFR levels
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(quale_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(quanto_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(quanta_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A2')),
(che_id, 'metaattr003', (SELECT id FROM meta_values WHERE value = 'A1'));

-- Frequency tier
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
(quale_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(quanto_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(quanta_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top1000')),
(che_id, 'metaattr007', (SELECT id FROM meta_values WHERE value = 'top500'));
```

### 4.6 Implementation Completeness Verification

**Metadata Coverage Verification**:
✅ **Complete metaattr028 (determiner_type) coverage**: All base words and forms have determiner type metadata
✅ **Complete metaattr011 (gender) coverage**: All base words and forms have gender metadata (masculine/feminine/common-gender)
✅ **Complete metaattr012 (number) coverage**: All base words and forms have number metadata (singular/plural)
✅ **Complete metaattr014 (person) coverage**: All possessive base words and forms have person metadata
✅ **Universal metaattr003 (CEFR) coverage**: All base words have CEFR level assignments (A1-B1)
✅ **Universal metaattr007 (frequency) coverage**: All base words have frequency tier assignments (top100-top1000)

**Form-Level Architecture Verification**:
✅ **Articles**: 3 base entries (il, la, lo) + 3 base entries (un, uno, una) with complete plural/elision forms
✅ **Demonstratives**: 4 base entries (questo, questa, quello, quella) with complete plural forms
✅ **Possessives**: 11 base entries covering all person/gender combinations with complete plural forms
✅ **Quantifiers**: 7 base entries covering semantic variations with complete gender/number forms
✅ **Interrogatives**: 4 base entries covering interrogative functions with complete plural forms

**Ready-to-Execute SQL Status**:
✅ All SQL examples use proper ID placeholders (il_id, mio_form_id, etc.)
✅ All metadata insertions include complete attribute coverage
✅ All form relationships properly established with word_id references
✅ Pronunciation columns included for all entries and forms

---

## 5. Translation and Form Architecture

### 5.1 Context-Dependent Translation Approach

Determiners require sophisticated translation handling due to significant structural differences between Italian and English systems.

### 5.2 Article Translation Challenges

- **Definite Articles**: Italian has 7 forms (il, la, lo, l', i, gli, le) → English "the"
- **Usage Contexts**: Italian uses definite articles with abstract nouns, body parts, and in many contexts where English omits articles
- **Educational Priority**: Show when Italian requires articles but English doesn't

### 5.3 Possessive Disambiguation Strategy

Italian third-person possessives require context for English translation:
- `suo libro` → "his book" OR "her book" OR "its book"
- `sua casa` → "his house" OR "her house" OR "its house"
- Translation metadata must indicate ambiguity

**Complete Translation Implementation**:
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

-- Form translations showing connection to base words
INSERT INTO form_translations (form_id, base_word_id, translation_text, context_notes) VALUES
-- Article forms inherit meaning from base words
(i_form_id, il_id, 'the', 'Plural form maintains same translation as base'),
(le_form_id, la_id, 'the', 'Plural form maintains same translation as base'),
(l_form_id, il_id, 'the', 'Contracted form before vowels, same meaning'),
(l_form_id, la_id, 'the', 'Contracted form before vowels, same meaning'),

-- Demonstrative forms show clear number relationship
(questi_form_id, questo_id, 'these', 'Plural form changes translation to match number'),
(queste_form_id, questa_id, 'these', 'Plural form changes translation to match number'),

-- Possessive forms maintain person but reflect agreement
(miei_form_id, mio_id, 'my', 'Same possessor (1st person), masculine plural agreement'),
(mie_form_id, mia_id, 'my', 'Same possessor (1st person), feminine plural agreement'),
(tuoi_form_id, tuo_id, 'your', 'Same possessor (2nd person), masculine plural agreement'),
(tue_form_id, tua_id, 'your', 'Same possessor (2nd person), feminine plural agreement');
```

### 5.4 Form Relationships and Search

**Form Architecture Pattern**:
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

-- Possessives: Number forms of person/gender base entries
INSERT INTO word_forms (word_id, form_text, form_type) VALUES
(mio_id, 'miei', 'plural'),       -- 'miei' is form of base word 'mio'
(mia_id, 'mie', 'plural'),        -- 'mie' is form of base word 'mia'
(tuo_id, 'tuoi', 'plural'),       -- 'tuoi' is form of base word 'tuo'
(tua_id, 'tue', 'plural');        -- 'tue' is form of base word 'tua'
```

**Complete Metadata Architecture Summary**:

**Required for ALL Determiner Base Words**:
- **metaattr028** - Determiner Type (5 values: article, demonstrative, possessive, quantifier, interrogative)
- **metaattr011** - Gender (3 values: masculine, feminine, common-gender)
- **metaattr012** - Number (2 values: singular, plural)
- **metaattr003** - CEFR Level (A1-C2 classification)
- **metaattr007** - Frequency Tier (Usage frequency ranking)

**Required for ALL Determiner Forms**:
- **metaattr028** - Determiner Type (inherited from base word)
- **metaattr011** - Gender (masculine, feminine, common-gender)
- **metaattr012** - Number (singular, plural)

**Required for Possessives Only**:
- **metaattr014** - Person (3 values: prima-persona, seconda-persona, terza-persona)
  * Base words: All possessive dictionary entries
  * Forms: All possessive plural forms inherit person from base word

**Optional Attributes**:
- **metaattr005** - Irregularity (if needed for irregular forms)
- **metaattr008** - Register (formal, informal, literary, spoken)

---


---

## 6. Educational Architecture Insights

### 6.1 Research-Based Design Principles

1. **Explicit Form Storage**: L2 learners need to see all determiner variants explicitly rather than inferring patterns
2. **Searchability Priority**: Students often search for the exact form they encounter in text
3. **Contraction Transparency**: Make phonetic contractions (l', un') transparent and searchable
4. **Agreement Visualization**: Show complete paradigms to reinforce gender/number agreement patterns

### 6.2 Searchability vs Learning Balance

- Store high-frequency forms as separate entries (il, la, lo)
- Link agreement forms to base words for paradigm learning
- Provide cross-references between related forms
- Enable both form-specific and paradigm-based searches

### 6.3 L2 Learning Challenges

- **Article Selection**: Complex phonetic and morphological conditioning
- **Possessive Agreement**: Agreement with possessed item, not possessor
- **Contraction Recognition**: l' can represent multiple underlying forms
- **Usage Contexts**: When to use/omit articles compared to English

### 6.4 Progressive Teaching Approach

1. **A1**: Basic article forms (il, la, un, una)
2. **A1-A2**: Demonstratives and possessives
3. **A2-B1**: Complete article system including contractions
4. **B1+**: Quantifiers and complex agreement patterns

---


---

**Key Principle Applied Universally**: Plurals are ALWAYS forms of the base word across ALL six determiner categories. This ensures consistency and predictable architecture throughout the determiner system, with the critical fix that mia, tua, sua are BASE WORDS representing person and gender semantic content, not forms.