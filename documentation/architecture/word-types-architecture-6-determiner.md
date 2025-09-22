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
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(il_id, 'i', 'plural', 'i', '/i/'),         -- plural form of 'il'
(la_id, 'le', 'plural', 'le', '/le/'),        -- plural form of 'la'
(lo_id, 'gli', 'plural', 'gli', '/ʎi/');       -- plural form of 'lo'
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
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(questo_id, 'questi', 'plural', 'KWES-ti', '/ˈkwes.ti/'), -- plural form of 'questo'
(questa_id, 'queste', 'plural', 'KWES-te', '/ˈkwes.te/'), -- plural form of 'questa'
(quello_id, 'quelli', 'plural', 'KWEL-li', '/ˈkwel.li/'), -- plural form of 'quello'
(quella_id, 'quelle', 'plural', 'KWEL-le', '/ˈkwel.le/'); -- plural form of 'quella'
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
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(mio_id, 'mia', 'feminine', 'MEE-a', '/ˈmi.a/'),     -- feminine form of 'mio'
(mio_id, 'miei', 'plural', 'MEE-ei', '/ˈmi.ei/'),      -- masculine plural form of 'mio'
(mio_id, 'mie', 'plural', 'MEE-e', '/ˈmi.e/'); -- plural form of 'mio' (use gender metadata for feminine)
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
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(una_id, "un'", 'elision', 'un', '/un/');      -- elided form of 'una' before vowels
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
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(molto_id, 'molta', 'feminine', 'MOL-ta', '/ˈmol.ta/'),   -- feminine form of 'molto'
(molto_id, 'molti', 'plural', 'MOL-ti', '/ˈmol.ti/'),     -- masculine plural form of 'molto'
(molto_id, 'molte', 'plural', 'MOL-te', '/ˈmol.te/'); -- plural form of 'molto' (use gender metadata for feminine)
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
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
(quale_id, 'quali', 'plural', 'KWA-li', '/ˈkwa.li/'),     -- plural form of 'quale'
(quanto_id, 'quanti', 'plural', 'KWAN-ti', '/ˈkwan.ti/'),   -- plural form of 'quanto'
(quanta_id, 'quante', 'plural', 'KWAN-te', '/ˈkwan.te/');   -- plural form of 'quanta'
```

**Phonetic Contraction Handling (l', un')**:
Elided forms require multiple form entries to maintain search accuracy:

```sql
-- l' as form of three different articles
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation, tags) VALUES
(il_id, "l'", 'elision', 'l', '/l/', ['before_vowel', 'masculine', 'singular']),
(la_id, "l'", 'elision', 'l', '/l/', ['before_vowel', 'feminine', 'singular']),
(lo_id, "l'", 'elision', 'l', '/l/', ['before_vowel', 'masculine', 'singular']);

-- un' as form of una before vowels
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation, tags) VALUES
(una_id, "un'", 'elision', 'un', '/un/', ['before_vowel', 'feminine', 'singular']);
```

**Key Principle Applied Universally**:
**Plurals are ALWAYS forms of the base word** across ALL six determiner categories. This ensures consistency and predictable architecture throughout the determiner system.

**Searchability Priority**: Every visible word form gets a searchable entry to support learner lookup patterns and educational discovery.

#### 5.2.4 Storage Strategy

**Store ALL Determiner Forms (No Calculation)**:
Given the irregular patterns, phonetic conditioning, and high frequency of determiners, all forms are stored in the database rather than calculated on-demand.

**Form Type Column Requirements**:
- `plural` - Number variations (i, le, gli, questi, queste, etc.)
- `elision` - Contracted forms (l', un', etc.)
- `feminine` - Gender variations (mia, tua, sua, etc.)
- Use gender/number metadata attributes for complete form classification

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

**metaattr014 - Person** (possessives only, 3 values):
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
(mio_id, 'metaattr014', 'uuid-first'),
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
(mia_form_id, mio_id, 'my', 'Same possessor (1st person), feminine agreement'),
(miei_form_id, mio_id, 'my', 'Same possessor (1st person), masculine plural agreement'),
(mie_form_id, mio_id, 'my', 'Same possessor (1st person), feminine plural agreement');
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
(mio_id, 'mie', 'plural'); -- 'mie' is form of base word 'mio' (use gender metadata for feminine)
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
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
-- Article plurals (number variations)
(il_id, 'i', 'plural', 'i', '/i/'),
(la_id, 'le', 'plural', 'le', '/le/'),
(lo_id, 'gli', 'plural', 'gli', '/ʎi/'),

-- Article contractions (phonetic variations)
(il_id, "l'", 'elision', 'l', '/l/'),
(la_id, "l'", 'elision', 'l', '/l/'),
(lo_id, "l'", 'elision', 'l', '/l/'),

-- Demonstrative plurals (number variations)
(questo_id, 'questi', 'plural', 'KWES-ti', '/ˈkwes.ti/'),
(questa_id, 'queste', 'plural', 'KWES-te', '/ˈkwes.te/'),
(quello_id, 'quelli', 'plural', 'KWEL-li', '/ˈkwel.li/'),
(quella_id, 'quelle', 'plural', 'KWEL-le', '/ˈkwel.le/'),

-- Possessive gender/number variations (forms only)
(mio_id, 'mia', 'feminine', 'MEE-a', '/ˈmi.a/'),
(mio_id, 'miei', 'plural', 'MEE-ei', '/ˈmi.ei/'),
(mio_id, 'mie', 'plural', 'MEE-e', '/ˈmi.e/'),
(tuo_id, 'tua', 'feminine', 'TOO-a', '/ˈtu.a/'),
(tuo_id, 'tuoi', 'plural', 'TOO-oi', '/ˈtu.oi/'),
(tuo_id, 'tue', 'plural', 'TOO-e', '/ˈtu.e/');

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
(mio_id, 'metaattr014', 'uuid-first'),
(tuo_id, 'metaattr014', 'uuid-second'),
(suo_id, 'metaattr014', 'uuid-third'),

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

-- 5. Form translations: How forms connect to base word translations
INSERT INTO form_translations (form_id, base_word_id, translation_text, usage_notes, example_usage) VALUES
-- Article form translations
(i_form_id, il_id, 'the', 'Plural of masculine definite article', 'i libri (the books)'),
(le_form_id, la_id, 'the', 'Plural of feminine definite article', 'le case (the houses)'),
(gli_form_id, lo_id, 'the', 'Plural of special masculine definite article', 'gli studenti (the students)'),
(l_form_id, il_id, 'the', 'Contracted form before vowels', "l'amico (the friend)"),
(l_form_id, la_id, 'the', 'Contracted form before vowels', "l'amica (the friend)"),

-- Demonstrative form translations
(questi_form_id, questo_id, 'these', 'Plural of masculine demonstrative', 'questi tavoli (these tables)'),
(queste_form_id, questa_id, 'these', 'Plural of feminine demonstrative', 'queste sedie (these chairs)'),
(quelli_form_id, quello_id, 'those', 'Plural of masculine demonstrative', 'quelli studenti (those students)'),
(quelle_form_id, quella_id, 'those', 'Plural of feminine demonstrative', 'quelle studentesse (those students)'),

-- Possessive form translations
(mia_form_id, mio_id, 'my', 'Feminine form of first person possessive', 'la mia casa (my house)'),
(miei_form_id, mio_id, 'my', 'Masculine plural form of first person possessive', 'i miei amici (my friends)'),
(mie_form_id, mio_id, 'my', 'Feminine plural form of first person possessive', 'le mie amiche (my friends)'),
(tua_form_id, tuo_id, 'your', 'Feminine form of second person possessive', 'la tua macchina (your car)'),
(tuoi_form_id, tuo_id, 'your', 'Masculine plural form of second person possessive', 'i tuoi libri (your books)'),
(tue_form_id, tuo_id, 'your', 'Feminine plural form of second person possessive', 'le tue idee (your ideas)');
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
