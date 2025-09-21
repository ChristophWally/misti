### 5 PREPOSITION

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
