# User Story: Conjugation Modal Tag System & Color Redesign

**Epic**: UX Polish & Performance Optimization (Reflexive Verbs Epic - Story 11)  
**Story Points**: 5  
**Priority**: Medium  
**Component**: ConjugationModal, UI Design

-----

## **User Story**

**As a** language learner using the conjugation modal  
**I want** a clean, space-efficient tag system that shows key verb information with consistent conjugation-based colors  
**So that** I can quickly identify verb patterns, irregularities, and grammatical properties without visual clutter, especially on mobile devices

-----

## **Background & Problem Statement**

The current conjugation modal header:

- Uses space-inefficient emoji (`📝 Conjugations:`)
- Shows scattered verb information in word tags within the header
- Lacks systematic color coding for different conjugation types
- Doesn’t prioritize the most important grammatical information
- Is not optimized for mobile screens

**Key insight**: Italian verbs follow predictable patterns based on conjugation type (-are, -ere, -ire, -isc), and users need this information prominently displayed with supporting grammatical details.

-----

## **Design Decisions Made**

### **1. Conjugation-Based Color System**

**Final Color Scheme:**

- **-are verbs**: `#14b8a6` (standard teal)
- **-ere verbs**: `#06b6d4` (cyan-teal)
- **-ire verbs**: `#2dd4bf` (light teal)
- **-isc verbs**: `#2dd4bf` (same as -ire, since -isc is a variant of -ire conjugation)

**Rationale**: Linguistically accurate grouping where -ire and -isc share colors since they’re the same conjugation group, with 3 distinct colors total.

### **2. Information Hierarchy**

**Priority Order (Most → Least Important):**

1. **Conjugation Type** (-are, -ere, -ire, -isc) - Filled background, conjugation color
1. **Irregularity** (⚠️ IRREG) - Filled red background `#ef4444`
1. **Auxiliary** (avere, essere, both) - Gray outlined
1. **Reflexive** (reflexive) - Gray outlined
1. **Transitivity** (transitive, intransitive, both) - Gray outlined

### **3. Responsive Design**

**Desktop/Tablet:**

```
Conjugations: lavarsi
[-ire] [⚠️ IRREG] [essere] [reflexive] [transitive]
```

**Mobile:**

```
Conjugations: lavarsi  
[-ire] [⚠️] [ess] [refl] [trans]
```

-----

## **Technical Implementation**

### **Color Utility Function**

```javascript
const getConjugationColors = (wordTags) => {
  if (wordTags?.includes('are-conjugation')) {
    return { primary: '#14b8a6', name: '-are' }
  }
  if (wordTags?.includes('ere-conjugation')) {
    return { primary: '#06b6d4', name: '-ere' }
  }
  if (wordTags?.includes('ire-conjugation') || wordTags?.includes('ire-isc-conjugation')) {
    const name = wordTags?.includes('ire-isc-conjugation') ? '-isc' : '-ire'
    return { primary: '#2dd4bf', name }
  }
  return { primary: '#14b8a6', name: '-verb' } // fallback
}
```

### **Tag Rendering Logic**

- **Filled tags**: Conjugation type, irregularity
- **Outlined tags**: Auxiliary, reflexive, transitivity
- **Mobile abbreviations**: `reflexive → refl`, `essere → ess`, `transitive → trans`

-----

## **Acceptance Criteria**

### **Header & Layout**

- [ ] Emoji removed from conjugation modal header (`Conjugations: {word}`)
- [ ] Clean tag section added below header, above existing controls
- [ ] Tags display in single horizontal row with appropriate spacing
- [ ] Mobile breakpoint applies abbreviations for phone screens only

### **Tag System**

- [ ] Conjugation type tag shows with appropriate color:
  - [ ] `-are` verbs show teal filled tag `#14b8a6`
  - [ ] `-ere` verbs show cyan-teal filled tag `#06b6d4`
  - [ ] `-ire` verbs show light teal filled tag `#2dd4bf`
  - [ ] `-isc` verbs show light teal filled tag `#2dd4bf` (same as -ire)
- [ ] Irregularity tag `⚠️ IRREG` shows red filled background when `irregular-pattern` tag present
- [ ] Auxiliary tags show gray outlined style (`avere`, `essere`, `both`)
- [ ] Reflexive tag shows gray outlined when `reflexive-verb` tag present
- [ ] Transitivity tags show gray outlined (`transitive`, `intransitive`, `both`)

### **Responsive Behavior**

- [ ] **Desktop/Tablet**: Full tag text displayed
- [ ] **Mobile**: Abbreviated tags (`reflexive → refl`, `essere → ess`, etc.)
- [ ] Tags wrap appropriately on very small screens
- [ ] Consistent spacing and alignment across screen sizes

### **Color Consistency**

- [ ] Conjugation colors match the defined hex values exactly
- [ ] White text maintains readability on all colored backgrounds
- [ ] Gray outlined tags use consistent border and text colors
- [ ] Red irregularity tag uses `#ef4444` background

### **Integration**

- [ ] Existing modal functionality unchanged (mood/tense selection, gender toggles, etc.)
- [ ] Performance impact minimal (no additional database queries)
- [ ] Works correctly for all verb types in existing database
- [ ] Fallback handling for verbs without clear conjugation type

-----

## **Example Tag Combinations**

**parlare (-are, regular, transitive, avere):**

```
[-are] [avere] [transitive]
```

**essere (-ere, irregular, intransitive, essere):**

```
[-ere] [⚠️ IRREG] [essere] [intransitive]
```

**lavarsi (-ire, irregular, reflexive, essere, transitive):**

```
[-ire] [⚠️ IRREG] [essere] [reflexive] [transitive]
```

**finire (-isc, regular, transitive, avere):**

```
[-isc] [avere] [transitive]
```

-----

## **Out of Scope (Future Stories)**

- **Dictionary word card colors**: Applying conjugation colors to verb cards in main dictionary
- **Audio button colors**: Extending color system to audio buttons throughout app
- **Modal header gradients**: Adapting header background to conjugation colors
- **Broader color system**: Applying to dropdowns, forms, and other UI elements

-----

## **Design Assets Needed**

- [ ] CSS classes for conjugation color variants
- [ ] Mobile breakpoint definitions for tag abbreviations
- [ ] Responsive spacing system for tag layout

-----

## **Definition of Done**

- [ ] All acceptance criteria verified on desktop, tablet, and mobile
- [ ] Tag system displays correctly for all existing verbs in database
- [ ] Code review completed and approved
- [ ] No performance regression in modal load times
- [ ] Cross-browser compatibility verified (Chrome, Safari, Firefox)
- [ ] Accessibility maintained (proper contrast ratios, keyboard navigation)

**Success Metrics:**

- Modal header uses 40% less vertical space
- Tag information is immediately scannable within 2 seconds
- Mobile users can view all essential verb information without scrolling
- Color coding enables instant conjugation type recognition

-----

**Ready for implementation and can be broken down into smaller technical tasks as needed.** 🎯​​​​​​​​​​​​​​​​