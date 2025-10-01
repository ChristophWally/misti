# Metadata Reference Guide

**Version:** 1.0
**Last Updated:** 2025-10-01
**Database:** Supabase PostgreSQL

---

## Overview

This document provides a complete technical reference for all metadata attributes and values in the Italian learning database. Use this as a lookup reference when implementing word generation, filtering, or display logic.

For implementation guidance, see [word-generation-guide.md](./word-generation-guide.md).

---

## Table of Contents

1. [Metadata Architecture](#metadata-architecture)
2. [Propagation Rules](#propagation-rules)
3. [Complete Attribute Reference](#complete-attribute-reference)
4. [Attribute Details by Level](#attribute-details-by-level)
5. [All Metadata Values](#all-metadata-values)

---

## Metadata Architecture

### Core Concept

All linguistic properties are stored as **tags** in the `entity_meta_values` (EMV) table rather than as direct columns. This provides maximum flexibility for complex metadata requirements.

### Entity Types

Tags can be attached to four entity types:

| Entity Type | Description | Example |
|------------|-------------|---------|
| `word` | Base dictionary entry | "parlare" (verb) |
| `form` | Inflected form | "parlo" (I speak) |
| `word_translation` | Translation of base word | "to speak" |
| `form_translation` | Translation of specific form | "I speak" |

### Attribute Levels

Each attribute has a `source_level` that determines where it can be **assigned**:

- **word**: Tag assigned to dictionary entry
- **form**: Tag assigned to word_forms
- **translation**: Tag assigned to word_translations
- **Multi-level**: Comma-separated (e.g., `form,translation`)

### Display vs Source Level

- **source_level**: Where you assign the tag
- **display_level**: Where it appears in UI (may aggregate from multiple sources)

Example: `auxiliary` has source_level=`form,translation` but display_level=`word` (aggregates up).

---

## Propagation Rules

Propagation rules determine how metadata flows between related entities.

### Rule Types

| Rule | Behavior | Use Case |
|------|----------|----------|
| `ADMIN_ONLY` | No propagation, direct assignment only | Core structural attributes (gender, tense, mood) |
| `FIRST_WINS` | First value encountered wins | Single-value attributes (register, adverb_type) |
| `COMBINE` | All unique values are combined | Multi-value attributes (auxiliary, transitivity) |
| `ANY_MATCH` | Display if ANY form has it | Boolean-like attributes (form_irregular) |
| `null` | No defined propagation | Contextual tags (optional_tag) |

### Propagation Flow Examples

**Example 1: ADMIN_ONLY (no propagation)**
```
Word: parlare (verb) → gender: N/A (no propagation)
```

**Example 2: COMBINE (merge values)**
```
Translation 1: "to finish" → auxiliary: avere
Translation 2: "to end" → auxiliary: essere
Word Display: Shows both "avere, essere"
```

**Example 3: ANY_MATCH (boolean-like)**
```
Form 1: "vado" → form_irregular: irregular
Form 2: "vai" → form_irregular: irregular
Word Display: Shows "irregular" (at least one form is irregular)
```

**Example 4: FIRST_WINS (single value)**
```
Translation 1: register: formal
Translation 2: register: casual
Word Display: Shows "formal" (first wins)
```

---

## Complete Attribute Reference

### Summary Table

| ID | Attribute | Source Level | Display Level | Propagation | Values Count |
|----|-----------|--------------|---------------|-------------|--------------|
| 21e95d9a-9523-400f-91ab-5f877df71d84 | adverb_type | word | word | FIRST_WINS | 10 |
| 65289998-b2c4-4dfd-8212-1f7cb9635dc4 | auxiliary | form,translation | word | COMBINE | 2 |
| 554a6624-fd30-4d1c-b664-5f8433dfe576 | cefr_level | word | word | ADMIN_ONLY | 12 |
| 74df568f-0ed3-4f74-9979-f6d64fc7a54b | conjugation_type | word | word | ADMIN_ONLY | 4 |
| 4dc48097-de1d-4dc8-9371-ab8a5d320203 | form_irregular | form | word | ANY_MATCH | 1 |
| 36e6b866-c2cf-48b5-ba67-2fa70a1522b5 | form_pattern | word | word | ADMIN_ONLY | 2 |
| 3c909352-4588-4951-8076-6f23081d99be | frequency_tier | word | word | ADMIN_ONLY | 6 |
| 08a37467-3de5-42b2-a22a-29127c58c942 | gender | word | word | ADMIN_ONLY | 3 |
| 7b1a301d-4f4c-405f-b6d7-01af1efb8574 | gender_usage | translation | translation | ADMIN_ONLY | 2 |
| f40a8c4c-09cf-4385-a612-dbf90d3bd478 | gradable | word | word | ADMIN_ONLY | 3 |
| 675f063f-137a-4a5a-a28d-5045cd0f178a | interrogative_function | word | word | ANY_MATCH | 1 |
| 379ac74b-7851-4d17-a01e-fb6881062688 | mood | form | form | ADMIN_ONLY | 7 |
| b83d846f-ec8e-4f01-842b-e1afe1cda090 | number | form | word | ADMIN_ONLY | 2 |
| 3c562db9-763c-44e9-918a-845d83acbb56 | optional_tag | word | word | null | 44 |
| f284ff99-816e-4dfd-a18d-e52612458bb4 | person | form | form | ADMIN_ONLY | 3 |
| 17c23a79-4828-439b-8560-1741b165bc07 | plural_formation | word | word | ADMIN_ONLY | 2 |
| d55410e7-8b1f-4f1f-8517-02645c0c2996 | plural_only | translation | translation | ADMIN_ONLY | 1 |
| 7e9e8be7-8cf0-4560-baeb-82105be43873 | position | translation | translation | ADMIN_ONLY | 3 |
| ac7dbcf5-28bb-4432-9210-f6a0a90098e4 | reflexive | word | word | ADMIN_ONLY | 1 |
| f3e4381a-e48b-4317-b581-56634fa63879 | register | translation | translation | FIRST_WINS | 4 |
| 4478177c-a43a-49aa-926c-278bc546e035 | tense | form | form | ADMIN_ONLY | 27 |
| 1647e6f1-9387-47b7-be5d-3cd0df1dde4c | transitivity | translation | word | COMBINE | 3 |
| 5772c0c9-40c3-46b7-85ac-27442184a794 | verb_form_type | form | form | ADMIN_ONLY | 3 |
| 88358c12-5112-45f9-b0a0-a6239c41a064 | verb_type | translation | translation | ADMIN_ONLY | 9 |
| 6aa64a52-2009-4d0c-ad77-a6c57b69ebce | word_restriction | word | word | ADMIN_ONLY | 6 |

---

## Attribute Details by Level

### Word-Level Attributes (source_level = 'word')

These attributes are assigned directly to dictionary entries.

| Attribute ID | Name | Word Types | Required? | Values |
|--------------|------|------------|-----------|--------|
| 08a37467-3de5-42b2-a22a-29127c58c942 | gender | noun | **REQUIRED** | masculine, feminine, common-gender |
| 17c23a79-4828-439b-8560-1741b165bc07 | plural_formation | noun | Optional | plural-i, plural-e |
| 74df568f-0ed3-4f74-9979-f6d64fc7a54b | conjugation_type | verb | Recommended | are, ere, ire, ire-isc |
| ac7dbcf5-28bb-4432-9210-f6a0a90098e4 | reflexive | verb | If applicable | reflexive |
| 36e6b866-c2cf-48b5-ba67-2fa70a1522b5 | form_pattern | adjective | **REQUIRED** | form-4, form-2 |
| f40a8c4c-09cf-4385-a612-dbf90d3bd478 | gradable | adjective | Optional | analytical-gradability, full-gradability, non-gradable |
| 21e95d9a-9523-400f-91ab-5f877df71d84 | adverb_type | adverb | Recommended | manner, time, place, quantity, frequency, affirmation, doubt, negation, evaluation, emphasis |
| 554a6624-fd30-4d1c-b664-5f8433dfe576 | cefr_level | all | Optional | A1, A2, B1, B2, C1, C2, native, academic, literary, specialized, business, regional |
| 3c909352-4588-4951-8076-6f23081d99be | frequency_tier | all | Optional | top100, top500, top1000, top2500, top5000, top10000 |
| 675f063f-137a-4a5a-a28d-5045cd0f178a | interrogative_function | all | If applicable | interrogative |
| 6aa64a52-2009-4d0c-ad77-a6c57b69ebce | word_restriction | verb, noun | If applicable | plural-only, singular-only, third-person-only, third-singular-only, missing-first-second-person, missing-imperative |

### Form-Level Attributes (source_level = 'form')

These attributes are assigned to word_forms entries.

| Attribute ID | Name | Required For | Values |
|--------------|------|--------------|--------|
| 5772c0c9-40c3-46b7-85ac-27442184a794 | verb_form_type | All verb forms | simple, compound, progressive |
| 379ac74b-7851-4d17-a01e-fb6881062688 | mood | All verb forms | indicativo, congiuntivo, condizionale, imperativo, infinito, participio, gerundio |
| 4478177c-a43a-49aa-926c-278bc546e035 | tense | All verb forms | 27 values (see below) |
| f284ff99-816e-4dfd-a18d-e52612458bb4 | person | Verb forms (except infinitive/participle/gerund) | prima-persona, seconda-persona, terza-persona |
| b83d846f-ec8e-4f01-842b-e1afe1cda090 | number | Verb/noun/adjective forms | singolare, plurale |
| 65289998-b2c4-4dfd-8212-1f7cb9635dc4 | auxiliary | **Compound verb forms ONLY** | essere, avere |
| 4dc48097-de1d-4dc8-9371-ab8a5d320203 | form_irregular | Irregular verb forms | irregular |

### Translation-Level Attributes (source_level = 'translation')

These attributes are assigned to word_translations entries.

| Attribute ID | Name | Required For | Values |
|--------------|------|--------------|--------|
| 65289998-b2c4-4dfd-8212-1f7cb9635dc4 | auxiliary | **ALL verb translations** | essere, avere |
| 1647e6f1-9387-47b7-be5d-3cd0df1dde4c | transitivity | Verb translations | transitive, intransitive, ambitransitive |
| 88358c12-5112-45f9-b0a0-a6239c41a064 | verb_type | Verb translations (if applicable) | direct-reflexive, reciprocal, modal-verb, impersonal-verb, meteorological-verb, defective-verb |
| f3e4381a-e48b-4317-b581-56634fa63879 | register | All translations | formal, casual, neutral, mixed |
| 7b1a301d-4f4c-405f-b6d7-01af1efb8574 | gender_usage | Noun translations (if applicable) | male-only, female-only |
| 7e9e8be7-8cf0-4560-baeb-82105be43873 | position | Adjective/adverb translations | before, after, before/after |
| d55410e7-8b1f-4f1f-8517-02645c0c2996 | plural_only | Translations (if applicable) | plural only |
| 6aa64a52-2009-4d0c-ad77-a6c57b69ebce | word_restriction | Translations (if applicable) | plural-only, singular-only, third-person-only, etc. |

---

## All Metadata Values

### adverb_type (21e95d9a-9523-400f-91ab-5f877df71d84)
**Source Level:** word | **Display Level:** word | **Propagation:** FIRST_WINS

| Value ID | Value | Description |
|----------|-------|-------------|
| 46baf82e-85ea-4267-ae70-dc0c4b3e7a0a | manner | How something is done: velocemente, bene |
| bf5823f9-fee1-46c4-ac0c-5f336fe8ce44 | time | When something happens: oggi, sempre |
| 4592d6a0-a339-4102-9234-a88f5bff550b | place | Where something happens: qui, là |
| 7c68cb0b-377a-4214-b626-3043cd46e3d3 | quantity | How much: molto, poco |
| fc5f2f5f-7c34-402e-9960-416a20df2045 | frequency | How often: spesso, mai |
| 0d7ae1dd-3b83-479e-a5b0-3c80507a1f34 | affirmation | Confirmation: sì, certamente |
| f53d36b4-158c-4faa-94cb-2f5422462c62 | doubt | Uncertainty: forse, probabilmente |
| 0a5cbf72-e7ae-404c-a65b-2b52fcb92269 | negation | Negative constructions: non, niente, nessuno |
| a232932f-7f25-4b61-827e-037fe2d306e2 | evaluation | Speaker judgment/opinion: fortunatamente, purtroppo |
| 269d9e82-741f-40bf-89e5-9c57722d332a | emphasis | Amplification/certainty: assolutamente, certamente |

### auxiliary (65289998-b2c4-4dfd-8212-1f7cb9635dc4)
**Source Level:** form,translation | **Display Level:** word | **Propagation:** COMBINE

| Value ID | Value | Description |
|----------|-------|-------------|
| 0e365292-82f3-4daf-98b1-8f792e74bc7d | avere | Uses auxiliary verb avere: ho parlato |
| af8ac912-2adb-487a-b800-71e1b306d3cb | essere | Uses auxiliary verb essere: sono andato |

**CRITICAL RULES:**
- **REQUIRED** for ALL verb translations (translation-level)
- **REQUIRED** for compound verb forms ONLY (form-level)
- Progressive forms do NOT get auxiliary tag (stare is implicit)

### cefr_level (554a6624-fd30-4d1c-b664-5f8433dfe576)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| adafe588-8a37-4160-bd6a-0a0dfd88ccb3 | A1 | Beginner level - basic everyday expressions |
| 059fbd92-7da7-445a-bd02-714e08a3462f | A2 | Elementary level - basic personal information |
| 14aed41b-06ad-4583-8443-f36be0db4659 | B1 | Intermediate level - familiar topics |
| d7435a74-7cc4-4634-bfc7-cabdea1ac910 | B2 | Upper intermediate level - complex topics |
| da15bb3b-885e-4d89-928c-8ad77202c63a | C1 | Advanced level - wide range of topics |
| 0b3a3988-2a7b-4c18-9ae2-4d1a981e3afb | C2 | Proficiency level - near-native competence |
| 0e51f9c3-1201-426f-b467-86f633f6d9d5 | native | Native speaker vocabulary |
| be9dc5a8-61ca-4928-b1fd-c5f752cc1a61 | academic | Academic or specialized terminology |
| a20bbe11-909f-425a-a136-3a5b7c1e8b7d | literary | Literary or classical usage |
| b246889c-f583-4508-b83c-22a2ccba6fa9 | specialized | Technical or domain-specific terms |
| 0fa084fe-c722-44ac-80f4-baa807ad969e | business | Business and professional vocabulary |
| 5aeeb1a0-f33d-4f92-9dcd-f1432a55e284 | regional | Regional or dialectal usage |

### conjugation_type (74df568f-0ed3-4f74-9979-f6d64fc7a54b)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| b65caed7-c91d-417d-9385-c4baa1d3f051 | are | First conjugation: parlare, amare |
| 1587c852-da23-4a4c-ae23-0722a2314fe1 | ere | Second conjugation: credere, vendere |
| 0c34425d-b3bc-4586-bbfa-5356a6e1d467 | ire | Third conjugation: dormire, partire |
| e1cbfdd3-dda2-426d-8770-94643f4944cb | ire-isc | Third conjugation with -isc-: finire, capire |

### form_irregular (4dc48097-de1d-4dc8-9371-ab8a5d320203)
**Source Level:** form | **Display Level:** word | **Propagation:** ANY_MATCH

| Value ID | Value | Description |
|----------|-------|-------------|
| b2c05489-a0be-41da-affc-6b80d6346ef8 | irregular | Form deviates from conjugation pattern |

### form_pattern (36e6b866-c2cf-48b5-ba67-2fa70a1522b5)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 56bc61fb-b0c7-4291-81d9-a46b6df70003 | form-4 | Full agreement: rosso/rossa/rossi/rosse |
| 6649500e-a1b0-43af-ab27-9b01a3cfe546 | form-2 | Limited agreement: grande/grandi |

### frequency_tier (3c909352-4588-4951-8076-6f23081d99be)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 27c6b66e-9354-47db-a04c-b1aad4802d0f | top100 | Most common 100 words |
| 08a86dc8-6c50-4756-8efa-10b92e820fd6 | top500 | Most common 500 words |
| 638a0f85-0b8c-45c8-991f-1753b428d99c | top1000 | Most common 1000 words |
| ada4f33e-f6e9-4bbf-9acf-32461b7c8ecd | top2500 | Most common 2500 words |
| 93172a5d-9632-49b6-985f-6d2448899dda | top5000 | Most common 5000 words |
| 13537137-5aac-4127-b11d-0314485411ef | top10000 | Most common 10000 words |

### gender (08a37467-3de5-42b2-a22a-29127c58c942)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 7ab4b4eb-0436-4034-987f-8ee500368e54 | masculine | Masculine grammatical gender (il tavolo) |
| d392439c-b55d-45b5-834e-1e46affefec4 | feminine | Feminine grammatical gender (la tavola) |
| 916d9f96-915a-471a-b9d7-3ece13cea4d0 | common-gender | Can be either masculine or feminine |

### gender_usage (7b1a301d-4f4c-405f-b6d7-01af1efb8574)
**Source Level:** translation | **Display Level:** translation | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 609ef2d8-bc82-4373-b874-c5ea0dc7c290 | male-only | Translation only applies to males: handsome (bello) |
| a4660a80-8dd5-4e23-ad1e-ce99d660d399 | female-only | Translation only applies to females |

### gradable (f40a8c4c-09cf-4385-a612-dbf90d3bd478)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 3cb54488-f1c1-4e08-91d9-36eea90cf97f | analytical-gradability | Can form analytical comparatives with più/meno: più intelligente |
| 007255c1-dc39-4001-8e67-337ac260cb00 | full-gradability | Can form both analytical and synthetic comparatives: più bello, bellissimo |
| 39cc5dbd-c413-4e7d-b3fe-3dcd87be2569 | non-gradable | Cannot form comparatives: morto, perfetto |

### interrogative_function (675f063f-137a-4a5a-a28d-5045cd0f178a)
**Source Level:** word | **Display Level:** word | **Propagation:** ANY_MATCH

| Value ID | Value | Description |
|----------|-------|-------------|
| d1276c49-b2dc-494d-893a-ec9c3f82b000 | interrogative | Word functions as an interrogative/question word (come, chi, quale, etc.) |

### mood (379ac74b-7851-4d17-a01e-fb6881062688)
**Source Level:** form | **Display Level:** form | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 6c117167-368b-4202-a2c2-d6997abfb9c2 | indicativo | Indicative mood - statements of fact |
| d011912c-504c-4b15-b9c5-ad54b21dfb7e | congiuntivo | Subjunctive mood - doubt, emotion, opinion |
| dcd854ec-8fe5-43bb-b264-eb8a10bb9e3b | condizionale | Conditional mood - hypothetical situations |
| 60ff0e9a-de84-4b45-a47b-75b7ee24a7c7 | imperativo | Imperative mood - commands |
| e830c476-aaeb-42f3-8e89-ffe3601a45f3 | infinito | Infinitive mood - unconjugated verb form |
| dcb5c943-7248-49f8-b025-b0da724f1b97 | participio | Participle mood - verbal adjective |
| dfb84eb3-3bbf-4a54-9312-de7771b5bd6a | gerundio | Gerund mood - verbal noun |

### number (b83d846f-ec8e-4f01-842b-e1afe1cda090)
**Source Level:** form | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 8e65cc9f-5465-4b19-bbb2-99d46defa92a | singolare | Singular number |
| 201fbe66-92a2-4319-b41a-d9a6ca73ea9a | plurale | Plural number |

### person (f284ff99-816e-4dfd-a18d-e52612458bb4)
**Source Level:** form | **Display Level:** form | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 6939185c-a961-4671-9111-26c3a6571f19 | prima-persona | First person - io, noi |
| 214524e6-c849-4582-a502-ddcf9bcc2398 | seconda-persona | Second person - tu, voi |
| 317b801e-a96a-4ccb-9c84-cf68376ede76 | terza-persona | Third person - lui/lei, loro |

### plural_formation (17c23a79-4828-439b-8560-1741b165bc07)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 257866cf-6c08-4172-97dc-1305a82cd095 | plural-e | Feminine -a ending nouns → -e plural formation (casa → case) |
| a0370605-d3b5-409f-97b8-9dc2217aa0d5 | plural-i | Masculine -o ending nouns → -i plural formation (libro → libri) |

### plural_only (d55410e7-8b1f-4f1f-8517-02645c0c2996)
**Source Level:** translation | **Display Level:** translation | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 179c4fcd-7ba0-463e-b7c0-2dbbbd7ecd70 | plural only | Requires plural subjects semantically |

### position (7e9e8be7-8cf0-4560-baeb-82105be43873)
**Source Level:** translation | **Display Level:** translation | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 691b4904-3e52-4653-b851-7de671d9f495 | after | Adjective/adverb positioned after noun/verb |
| e781fa53-5a1d-4b8c-8ecd-8e056b26f1c5 | before | Adjective/adverb positioned before noun/verb |
| fd9d4d8f-fe19-4744-94bc-ac856c74d6a6 | before/after | Can be positioned either before or after |

### reflexive (ac7dbcf5-28bb-4432-9210-f6a0a90098e4)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 45660851-d2b2-4873-898c-5420fc410545 | reflexive | Requires reflexive pronouns (lavare vs lavarsi) |

### register (f3e4381a-e48b-4317-b581-56634fa63879)
**Source Level:** translation | **Display Level:** translation | **Propagation:** FIRST_WINS

| Value ID | Value | Description |
|----------|-------|-------------|
| 11277d26-24fc-4c63-ac26-ed8634651c88 | formal | Appropriate for formal/academic contexts |
| 8fa94dbe-0b14-499e-8f99-52519844cc58 | casual | Casual/colloquial usage |
| 7dad1523-ce5b-4be5-a9ee-2bd0e011e917 | neutral | Standard register, neither formal nor informal |
| aa6336f7-ee9b-46a3-b455-3af1356beb7c | mixed | Used in both formal and informal contexts |

### tense (4478177c-a43a-49aa-926c-278bc546e035)
**Source Level:** form | **Display Level:** form | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| d47b7b6f-d234-49c3-9270-d99adf695fb0 | presente | Present indicative: io parlo |
| 0b58a662-a542-4686-9760-c080c64b6a9b | imperfetto | Imperfect indicative: io parlavo |
| d5e9334e-be1f-4634-a6b5-8726379f8739 | passato-remoto | Simple past: io parlai |
| 93d2630c-e90d-4d8f-aa8b-149c7933ba5c | futuro-semplice | Simple future: io parlerò |
| 5a9c36a9-9ded-4165-b9b2-dac66867f74a | passato-prossimo | Present perfect: io ho parlato |
| 0e56abce-52e4-4eb2-b728-e5a981b0f4dc | trapassato-prossimo | Past perfect: io avevo parlato |
| 9d63e2c1-0c77-40fc-8dc2-c36cc42c1790 | futuro-anteriore | Future perfect: io avrò parlato |
| aabe019d-3f6d-4230-b7d9-7e26e5a8dfc1 | trapassato-remoto | Past anterior: io ebbi parlato |
| 7b785c94-2e45-4e71-95ad-45f4ff18eaa0 | presente-progressivo | Present progressive: io sto parlando |
| c0f862bd-54e5-4687-ae4f-6c117a22286e | imperfetto-progressivo | Past progressive: io stavo parlando |
| f5ed186f-3194-4238-ab9d-a7584f71c6cc | futuro-progressivo | Future progressive: io starò parlando |
| 9da99826-432d-4144-a3c6-954e5de24d2e | congiuntivo-presente | Present subjunctive: che io parli |
| 988bda59-a162-48ec-a4d7-5b104b389ded | congiuntivo-imperfetto | Imperfect subjunctive: che io parlassi |
| eeef6aa5-d180-42d4-ad51-b2295f947ccf | congiuntivo-passato | Present perfect subjunctive: che io abbia parlato |
| 110e9a2c-32be-48f3-8abb-b6e045a472ed | congiuntivo-trapassato | Past perfect subjunctive: che io avessi parlato |
| 8b74e1d0-9074-4984-851c-384e17e10487 | congiuntivo-presente-progressivo | Present progressive subjunctive: che io stia parlando |
| fb224d0a-2c39-46e8-b190-e1292a218650 | condizionale-presente | Present conditional: io parlerei |
| 2404c5ae-cd40-4a8a-9cb0-4922adcf1524 | condizionale-passato | Past conditional: io avrei parlato |
| 8605fbfa-5403-453f-b45e-67ae64495012 | condizionale-presente-progressivo | Present progressive conditional: io starei parlando |
| d140b976-bbf9-483b-b1fd-ab4b86f382c3 | imperativo-presente | Present imperative: parla!, parlate! |
| 632d96f6-3f9e-448e-a4bc-ca9dfa3569ae | imperativo-passato | Past imperative: abbi parlato!, abbiate parlato! |
| 6c3cd53f-fdbd-4de3-9c08-0c1967242fcf | infinito-presente | Present infinitive: parlare |
| 8e973a94-296e-4761-9e54-0239b6b1fb9c | infinito-passato | Past infinitive: avere parlato |
| f2c89e60-dfa3-4981-ad54-71c8e8581c03 | participio-presente | Present participle: parlante |
| 66916c3e-57ec-46cb-9abe-deca1d88babd | participio-passato | Past participle: parlato |
| dd4dc082-38e0-40f0-b810-6b56ed33ac7b | gerundio-presente | Present gerund: parlando |
| 08a93872-41f3-43f6-8546-81fd09212bd2 | gerundio-passato | Past gerund: avendo parlato |

### transitivity (1647e6f1-9387-47b7-be5d-3cd0df1dde4c)
**Source Level:** translation | **Display Level:** word | **Propagation:** COMBINE

| Value ID | Value | Description |
|----------|-------|-------------|
| c877d327-1be5-4119-bc87-27e5f09f36ab | transitive | Can take direct objects: vedere qualcosa |
| fe5a227a-533c-4985-99f9-d84473ebecbd | intransitive | Cannot take direct objects: andare |
| c9c859ab-adbe-4f5c-a711-850e6dfac8fe | ambitransitive | Can be used transitively or intransitively |

### verb_form_type (5772c0c9-40c3-46b7-85ac-27442184a794)
**Source Level:** form | **Display Level:** form | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 9f66ed98-41ee-4fdd-bf46-61031a2a84d8 | simple | Single-word forms: parlo, parlavo |
| 9e56f638-b692-406e-b65b-11d447f84bcf | compound | Auxiliary + participle: ho parlato |
| 4979ad40-12ef-4bf7-ae60-9e6a080f3a38 | progressive | Stare + gerund: sto parlando |

### verb_type (88358c12-5112-45f9-b0a0-a6239c41a064)
**Source Level:** translation | **Display Level:** translation | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| b2cbac84-d2a8-48a9-be7d-dc6594686528 | direct-reflexive | Action on oneself: mi lavo (I wash myself) |
| 9e26b429-7e1d-4740-ac7a-ca3947153662 | reciprocal | Mutual action: ci laviamo (we wash each other) |
| 4b9e5987-98da-4d9f-a168-df31ea701666 | intransitive | **DEPRECATED** - Use transitivity attribute instead |
| 3b1838d5-ecad-4a8c-8829-fed8a61f312a | modal-verb | Modal auxiliary verbs: dovere (must), potere (can), volere (want), sapere (know how) |
| f64b115b-7878-4013-bd50-d90f91710a3c | impersonal-verb | Impersonal verbs: importare (matter), bisognare (need), servire (be needed) |
| 8fe9dc49-1541-410b-a655-e37c359ccf4e | meteorological-verb | Weather verbs: piovere (rain), nevicare (snow), grandinare (hail) |
| 585b0696-0ef3-4124-8f81-3d8046271ee1 | defective-verb | Defective verbs: vigere (be in force), solere (be accustomed), vertere (turn) |
| e748c411-6eb5-4389-8f07-9dfce926d299 | transitive-verb | **DEPRECATED** - Use transitivity attribute instead |
| 9588bfb6-bf38-4127-afde-517457b83d11 | intransitive-verb | **DEPRECATED** - Use transitivity attribute instead |

### word_restriction (6aa64a52-2009-4d0c-ad77-a6c57b69ebce)
**Source Level:** word | **Display Level:** word | **Propagation:** ADMIN_ONLY

| Value ID | Value | Description |
|----------|-------|-------------|
| 0a9d7ba7-3726-4b3d-a482-9e99bf5c055b | plural-only | Used only in plural form |
| 2792e966-b266-4d2d-9385-485ad967e056 | singular-only | Used only in singular form |
| 9bb05d01-297a-4e46-946d-5648cb0fb617 | third-person-only | Used only in third person (impersonal verbs like importare) |
| dbafb61f-6e0d-4302-9c0a-8bcd6af57b9d | third-singular-only | Used only in third person singular (meteorological verbs like piovere) |
| 13356067-fda7-4279-8462-cb44b7f59eda | missing-first-second-person | Missing first and second person forms (defective verbs like vigere) |
| 252e65bd-46b2-4236-ae01-406828a02d9c | missing-imperative | Cannot form imperative commands (defective verbs like solere) |

---

## Required Columns in Core Tables

### dictionary table

| Column | Required? | Values | Notes |
|--------|-----------|--------|-------|
| italian | **REQUIRED** | text | Base form (masculine singular for nouns/adjectives, infinitive for verbs) |
| word_type | **REQUIRED** | noun, verb, adjective, adverb, preposition | Lowercase only |
| phonetic_pronunciation | Optional | text | Simplified pronunciation |
| ipa_pronunciation | Optional | text | IPA notation |

### word_forms table

| Column | Required? | Values | Notes |
|--------|-----------|--------|-------|
| form_text | **REQUIRED** | text | Inflected/conjugated form |
| form_type | **REQUIRED** | text | **DEPRECATED but column required** - Use metadata instead |
| phonetic_pronunciation | Optional | text | Form-specific pronunciation |
| ipa_pronunciation | Optional | text | Form-specific IPA |

**IMPORTANT:** The `form_type` column in `word_forms` is **deprecated** but still **required** by the schema. Always use the `verb_form_type` metadata attribute instead. Set `form_type` to a default value like 'simple' or 'form' to satisfy the constraint.

### word_translations table

| Column | Required? | Values | Notes |
|--------|-----------|--------|-------|
| translation | **REQUIRED** | text | English translation |
| display_priority | **REQUIRED** | integer | 1 = primary, 2+ = secondary |
| usage_notes | Optional | text | When/how to use this translation |
| frequency_estimate | Optional | numeric | 0-1 scale |

### form_translations table

| Column | Required? | Values | Notes |
|--------|-----------|--------|-------|
| translation | **REQUIRED** | text | **INFLECTED English translation** (I speak, not to speak) |
| assignment_method | Optional | text | How this was assigned (automatic, manual) |
| confidence_score | Optional | numeric | 0-1 scale |

**CRITICAL:** The `translation` column in `form_translations` must contain the **inflected English form** that matches the Italian form, NOT the base translation. Examples:
- Form: "parlo" → Translation: "I speak" (NOT "to speak")
- Form: "parlavo" → Translation: "I was speaking" (NOT "to speak")
- Form: "ho parlato" → Translation: "I have spoken" (NOT "to speak")

---

**End of Metadata Reference**

For implementation guidance and step-by-step procedures, see [word-generation-guide.md](./word-generation-guide.md).
