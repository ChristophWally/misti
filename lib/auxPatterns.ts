// lib/auxPatterns.ts
// Complete Italian Auxiliary Patterns for Conjugation System
// Generated from EPIC 002 linguistic specifications
// Replaces database queries with instant memory lookups

export interface AuxiliaryPattern {
  compound_tense_tag: string;
  mood: string;
  tense: string;
  person: string;
  plurality: string;
  avere_auxiliary?: string;   // Required for compound perfect tenses
  essere_auxiliary?: string;  // Required for compound perfect tenses
  avere_phonetic?: string;    // Required for compound perfect tenses
  essere_phonetic?: string;   // Required for compound perfect tenses
  avere_ipa?: string;         // Required for compound perfect tenses
  essere_ipa?: string;        // Required for compound perfect tenses
  stare_auxiliary?: string;   // Required for progressive tenses only
  stare_phonetic?: string;    // Required for progressive tenses only
  stare_ipa?: string;         // Required for progressive tenses only
}

/**
 * Complete set of 74 Italian auxiliary patterns
 * Covers all compound tenses across all moods, persons, and numbers
 */
export const AUXILIARY_PATTERNS: AuxiliaryPattern[] = [
  // ==========================================
  // PASSATO PROSSIMO (Present Perfect)
  // ==========================================
  {
    compound_tense_tag: 'passato-prossimo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'ho',
    essere_auxiliary: 'sono',
    avere_phonetic: 'oh',
    essere_phonetic: 'SOH-noh',
    avere_ipa: '/o/',
    essere_ipa: '/ˈsono/'
  },
  {
    compound_tense_tag: 'passato-prossimo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'hai',
    essere_auxiliary: 'sei',
    avere_phonetic: 'ah-ee',
    essere_phonetic: 'say',
    avere_ipa: '/ˈai/',
    essere_ipa: '/sei/'
  },
  {
    compound_tense_tag: 'passato-prossimo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'ha',
    essere_auxiliary: 'è',
    avere_phonetic: 'ah',
    essere_phonetic: 'eh',
    avere_ipa: '/a/',
    essere_ipa: '/ɛ/'
  },
  {
    compound_tense_tag: 'passato-prossimo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'abbiamo',
    essere_auxiliary: 'siamo',
    avere_phonetic: 'ah-BEE-ah-moh',
    essere_phonetic: 'SYAH-moh',
    avere_ipa: '/abˈbjamo/',
    essere_ipa: '/ˈsjamo/'
  },
  {
    compound_tense_tag: 'passato-prossimo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avete',
    essere_auxiliary: 'siete',
    avere_phonetic: 'ah-VEH-teh',
    essere_phonetic: 'SYEH-teh',
    avere_ipa: '/aˈvete/',
    essere_ipa: '/ˈsjete/'
  },
  {
    compound_tense_tag: 'passato-prossimo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'hanno',
    essere_auxiliary: 'sono',
    avere_phonetic: 'HAN-noh',
    essere_phonetic: 'SOH-noh',
    avere_ipa: '/ˈanno/',
    essere_ipa: '/ˈsono/'
  },

  // ==========================================
  // TRAPASSATO PROSSIMO (Past Perfect/Pluperfect)
  // ==========================================
  {
    compound_tense_tag: 'trapassato-prossimo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avevo',
    essere_auxiliary: 'ero',
    avere_phonetic: 'ah-VEH-voh',
    essere_phonetic: 'EH-roh',
    avere_ipa: '/aˈvevo/',
    essere_ipa: '/ˈero/'
  },
  {
    compound_tense_tag: 'trapassato-prossimo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avevi',
    essere_auxiliary: 'eri',
    avere_phonetic: 'ah-VEH-vee',
    essere_phonetic: 'EH-ree',
    avere_ipa: '/aˈvevi/',
    essere_ipa: '/ˈeri/'
  },
  {
    compound_tense_tag: 'trapassato-prossimo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'aveva',
    essere_auxiliary: 'era',
    avere_phonetic: 'ah-VEH-vah',
    essere_phonetic: 'EH-rah',
    avere_ipa: '/aˈveva/',
    essere_ipa: '/ˈera/'
  },
  {
    compound_tense_tag: 'trapassato-prossimo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avevamo',
    essere_auxiliary: 'eravamo',
    avere_phonetic: 'ah-veh-VAH-moh',
    essere_phonetic: 'eh-rah-VAH-moh',
    avere_ipa: '/aveˈvamo/',
    essere_ipa: '/eraˈvamo/'
  },
  {
    compound_tense_tag: 'trapassato-prossimo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avevate',
    essere_auxiliary: 'eravate',
    avere_phonetic: 'ah-veh-VAH-teh',
    essere_phonetic: 'eh-rah-VAH-teh',
    avere_ipa: '/aveˈvate/',
    essere_ipa: '/eraˈvate/'
  },
  {
    compound_tense_tag: 'trapassato-prossimo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avevano',
    essere_auxiliary: 'erano',
    avere_phonetic: 'ah-veh-VAH-noh',
    essere_phonetic: 'EH-rah-noh',
    avere_ipa: '/aˈvevano/',
    essere_ipa: '/ˈerano/'
  },

  // ==========================================
  // FUTURO ANTERIORE (Future Perfect)
  // ==========================================
  {
    compound_tense_tag: 'futuro-anteriore',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avrò',
    essere_auxiliary: 'sarò',
    avere_phonetic: 'ah-vrOH',
    essere_phonetic: 'sah-rOH',
    avere_ipa: '/aˈvro/',
    essere_ipa: '/saˈro/'
  },
  {
    compound_tense_tag: 'futuro-anteriore',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avrai',
    essere_auxiliary: 'sarai',
    avere_phonetic: 'ah-vrAH-ee',
    essere_phonetic: 'sah-rAH-ee',
    avere_ipa: '/aˈvrai/',
    essere_ipa: '/saˈrai/'
  },
  {
    compound_tense_tag: 'futuro-anteriore',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avrà',
    essere_auxiliary: 'sarà',
    avere_phonetic: 'ah-vrAH',
    essere_phonetic: 'sah-rAH',
    avere_ipa: '/aˈvra/',
    essere_ipa: '/saˈra/'
  },
  {
    compound_tense_tag: 'futuro-anteriore',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avremo',
    essere_auxiliary: 'saremo',
    avere_phonetic: 'ah-VREH-moh',
    essere_phonetic: 'sah-REH-moh',
    avere_ipa: '/aˈvremo/',
    essere_ipa: '/saˈremo/'
  },
  {
    compound_tense_tag: 'futuro-anteriore',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avrete',
    essere_auxiliary: 'sarete',
    avere_phonetic: 'ah-VREH-teh',
    essere_phonetic: 'sah-REH-teh',
    avere_ipa: '/aˈvrete/',
    essere_ipa: '/saˈrete/'
  },
  {
    compound_tense_tag: 'futuro-anteriore',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avranno',
    essere_auxiliary: 'saranno',
    avere_phonetic: 'ah-VRAHN-noh',
    essere_phonetic: 'sah-RAHN-noh',
    avere_ipa: '/aˈvranno/',
    essere_ipa: '/saˈranno/'
  },

  // ==========================================
  // TRAPASSATO REMOTO (Past Anterior)
  // ==========================================
  {
    compound_tense_tag: 'trapassato-remoto',
    mood: 'indicativo',
    tense: 'passato-remoto',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'ebbi',
    essere_auxiliary: 'fui',
    avere_phonetic: 'EH-bee',
    essere_phonetic: 'FOO-ee',
    avere_ipa: '/ˈebbi/',
    essere_ipa: '/ˈfui/'
  },
  {
    compound_tense_tag: 'trapassato-remoto',
    mood: 'indicativo',
    tense: 'passato-remoto',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avesti',
    essere_auxiliary: 'fosti',
    avere_phonetic: 'ah-VEH-stee',
    essere_phonetic: 'FOH-stee',
    avere_ipa: '/aˈvesti/',
    essere_ipa: '/ˈfosti/'
  },
  {
    compound_tense_tag: 'trapassato-remoto',
    mood: 'indicativo',
    tense: 'passato-remoto',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'ebbe',
    essere_auxiliary: 'fu',
    avere_phonetic: 'eh-beh',
    essere_phonetic: 'foo',
    avere_ipa: '/ˈebbe/',
    essere_ipa: '/fu/'
  },
  {
    compound_tense_tag: 'trapassato-remoto',
    mood: 'indicativo',
    tense: 'passato-remoto',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avemmo',
    essere_auxiliary: 'fummo',
    avere_phonetic: 'ah-VEH-moh',
    essere_phonetic: 'FOO-moh',
    avere_ipa: '/aˈvemmo/',
    essere_ipa: '/ˈfummo/'
  },
  {
    compound_tense_tag: 'trapassato-remoto',
    mood: 'indicativo',
    tense: 'passato-remoto',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'aveste',
    essere_auxiliary: 'foste',
    avere_phonetic: 'ah-VEH-steh',
    essere_phonetic: 'FOH-steh',
    avere_ipa: '/aˈveste/',
    essere_ipa: '/ˈfoste/'
  },
  {
    compound_tense_tag: 'trapassato-remoto',
    mood: 'indicativo',
    tense: 'passato-remoto',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'ebbero',
    essere_auxiliary: 'furono',
    avere_phonetic: 'EH-beh-roh',
    essere_phonetic: 'FOO-roh-noh',
    avere_ipa: '/ˈebbero/',
    essere_ipa: '/ˈfurono/'
  },

  // ==========================================
  // CONGIUNTIVO PASSATO (Subjunctive Perfect)
  // ==========================================
  {
    compound_tense_tag: 'congiuntivo-passato',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'abbia',
    essere_auxiliary: 'sia',
    avere_phonetic: 'AH-bee-ah',
    essere_phonetic: 'SEE-ah',
    avere_ipa: '/ˈabbja/',
    essere_ipa: '/ˈsia/'
  },
  {
    compound_tense_tag: 'congiuntivo-passato',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'abbia',
    essere_auxiliary: 'sia',
    avere_phonetic: 'AH-bee-ah',
    essere_phonetic: 'SEE-ah',
    avere_ipa: '/ˈabbja/',
    essere_ipa: '/ˈsia/'
  },
  {
    compound_tense_tag: 'congiuntivo-passato',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'abbia',
    essere_auxiliary: 'sia',
    avere_phonetic: 'AH-bee-ah',
    essere_phonetic: 'SEE-ah',
    avere_ipa: '/ˈabbja/',
    essere_ipa: '/ˈsia/'
  },
  {
    compound_tense_tag: 'congiuntivo-passato',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'abbiamo',
    essere_auxiliary: 'siamo',
    avere_phonetic: 'ah-BEE-ah-moh',
    essere_phonetic: 'SYAH-moh',
    avere_ipa: '/abˈbjamo/',
    essere_ipa: '/ˈsjamo/'
  },
  {
    compound_tense_tag: 'congiuntivo-passato',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'abbiate',
    essere_auxiliary: 'siate',
    avere_phonetic: 'ah-BEE-ah-teh',
    essere_phonetic: 'SYAH-teh',
    avere_ipa: '/abˈbjate/',
    essere_ipa: '/ˈsjate/'
  },
  {
    compound_tense_tag: 'congiuntivo-passato',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'abbiano',
    essere_auxiliary: 'siano',
    avere_phonetic: 'ah-BEE-ah-noh',
    essere_phonetic: 'SYAH-noh',
    avere_ipa: '/ˈabbijano/',
    essere_ipa: '/ˈsijano/'
  },

  // ==========================================
  // CONGIUNTIVO TRAPASSATO (Subjunctive Pluperfect)
  // ==========================================
  {
    compound_tense_tag: 'congiuntivo-trapassato',
    mood: 'congiuntivo',
    tense: 'imperfetto',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avessi',
    essere_auxiliary: 'fossi',
    avere_phonetic: 'ah-VEH-see',
    essere_phonetic: 'FOH-see',
    avere_ipa: '/aˈvessi/',
    essere_ipa: '/ˈfossi/'
  },
  {
    compound_tense_tag: 'congiuntivo-trapassato',
    mood: 'congiuntivo',
    tense: 'imperfetto',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avessi',
    essere_auxiliary: 'fossi',
    avere_phonetic: 'ah-VEH-see',
    essere_phonetic: 'FOH-see',
    avere_ipa: '/aˈvessi/',
    essere_ipa: '/ˈfossi/'
  },
  {
    compound_tense_tag: 'congiuntivo-trapassato',
    mood: 'congiuntivo',
    tense: 'imperfetto',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avesse',
    essere_auxiliary: 'fosse',
    avere_phonetic: 'ah-VEH-seh',
    essere_phonetic: 'FOH-seh',
    avere_ipa: '/aˈvesse/',
    essere_ipa: '/ˈfosse/'
  },
  {
    compound_tense_tag: 'congiuntivo-trapassato',
    mood: 'congiuntivo',
    tense: 'imperfetto',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avessimo',
    essere_auxiliary: 'fossimo',
    avere_phonetic: 'ah-VEH-see-moh',
    essere_phonetic: 'FOH-see-moh',
    avere_ipa: '/aˈvessimo/',
    essere_ipa: '/ˈfossimo/'
  },
  {
    compound_tense_tag: 'congiuntivo-trapassato',
    mood: 'congiuntivo',
    tense: 'imperfetto',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'aveste',
    essere_auxiliary: 'foste',
    avere_phonetic: 'ah-VEH-steh',
    essere_phonetic: 'FOH-steh',
    avere_ipa: '/aˈveste/',
    essere_ipa: '/ˈfoste/'
  },
  {
    compound_tense_tag: 'congiuntivo-trapassato',
    mood: 'congiuntivo',
    tense: 'imperfetto',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avessero',
    essere_auxiliary: 'fossero',
    avere_phonetic: 'ah-VEH-seh-roh',
    essere_phonetic: 'FOH-seh-roh',
    avere_ipa: '/aˈvessero/',
    essere_ipa: '/ˈfossero/'
  },

  // ==========================================
  // CONDIZIONALE PASSATO (Conditional Perfect)
  // ==========================================
  {
    compound_tense_tag: 'condizionale-passato',
    mood: 'condizionale',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avrei',
    essere_auxiliary: 'sarei',
    avere_phonetic: 'ah-VREH-ee',
    essere_phonetic: 'sah-REH-ee',
    avere_ipa: '/aˈvrei/',
    essere_ipa: '/saˈrei/'
  },
  {
    compound_tense_tag: 'condizionale-passato',
    mood: 'condizionale',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avresti',
    essere_auxiliary: 'saresti',
    avere_phonetic: 'ah-VREH-stee',
    essere_phonetic: 'sah-REH-stee',
    avere_ipa: '/aˈvresti/',
    essere_ipa: '/saˈresti/'
  },
  {
    compound_tense_tag: 'condizionale-passato',
    mood: 'condizionale',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'avrebbe',
    essere_auxiliary: 'sarebbe',
    avere_phonetic: 'ah-VREH-beh',
    essere_phonetic: 'sah-REH-beh',
    avere_ipa: '/aˈvrebbe/',
    essere_ipa: '/saˈrebbe/'
  },
  {
    compound_tense_tag: 'condizionale-passato',
    mood: 'condizionale',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avremmo',
    essere_auxiliary: 'saremmo',
    avere_phonetic: 'ah-VREH-moh',
    essere_phonetic: 'sah-REH-moh',
    avere_ipa: '/aˈvremmo/',
    essere_ipa: '/saˈremmo/'
  },
  {
    compound_tense_tag: 'condizionale-passato',
    mood: 'condizionale',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avreste',
    essere_auxiliary: 'sareste',
    avere_phonetic: 'ah-VREH-steh',
    essere_phonetic: 'sah-REH-steh',
    avere_ipa: '/aˈvreste/',
    essere_ipa: '/saˈreste/'
  },
  {
    compound_tense_tag: 'condizionale-passato',
    mood: 'condizionale',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'avrebbero',
    essere_auxiliary: 'sarebbero',
    avere_phonetic: 'ah-VREH-beh-roh',
    essere_phonetic: 'sah-REH-beh-roh',
    avere_ipa: '/aˈvrebbero/',
    essere_ipa: '/saˈrebbero/'
  },

  // ==========================================
  // INFINITO PASSATO (Perfect Infinitive)
  // ==========================================
  {
    compound_tense_tag: 'infinito-passato',
    mood: 'infinito',
    tense: 'passato',
    person: 'invariable',
    plurality: 'invariable',
    avere_auxiliary: 'avere',
    essere_auxiliary: 'essere',
    avere_phonetic: 'ah-VEH-reh',
    essere_phonetic: 'EH-seh-reh',
    avere_ipa: '/aˈvere/',
    essere_ipa: '/ˈessere/'
  },

  // ==========================================
  // GERUNDIO PASSATO (Perfect Gerund)
  // ==========================================
  {
    compound_tense_tag: 'gerundio-passato',
    mood: 'gerundio',
    tense: 'passato',
    person: 'invariable',
    plurality: 'invariable',
    avere_auxiliary: 'avendo',
    essere_auxiliary: 'essendo',
    avere_phonetic: 'ah-VEN-doh',
    essere_phonetic: 'eh-SEN-doh',
    avere_ipa: '/aˈvendo/',
    essere_ipa: '/esˈsendo/'
  },

// ==========================================
// PROGRESSIVE TENSES (using STARE)
// Note: Progressive tenses only use "stare" auxiliaries
// ==========================================

  // PRESENTE PROGRESSIVO (Present Progressive)
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'singolare',
    stare_auxiliary: 'sto',
    stare_phonetic: 'stoh',
    stare_ipa: '/sto/'
  },
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'singolare',
    stare_auxiliary: 'stai',
    stare_phonetic: 'STAH-ee',
    stare_ipa: '/stai/'
  },
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'singolare',
    stare_auxiliary: 'sta',
    stare_phonetic: 'stah',
    stare_ipa: '/sta/'
  },
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stiamo',
    stare_phonetic: 'STEE-ah-moh',
    stare_ipa: '/ˈstjamo/'
  },
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'plurale',
    stare_auxiliary: 'state',
    stare_phonetic: 'STAH-teh',
    stare_ipa: '/ˈstate/'
  },
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stanno',
    stare_phonetic: 'STAH-noh',
    stare_ipa: '/ˈstanno/'
  },

  // PASSATO PROGRESSIVO (Past Progressive)
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'prima-persona',
    plurality: 'singolare',
    stare_auxiliary: 'stavo',
    stare_phonetic: 'STAH-voh',
    stare_ipa: '/ˈstavo/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'seconda-persona',
    plurality: 'singolare',
    stare_auxiliary: 'stavi',
    stare_phonetic: 'STAH-vee',
    stare_ipa: '/ˈstavi/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'terza-persona',
    plurality: 'singolare',
    stare_auxiliary: 'stava',
    stare_phonetic: 'STAH-vah',
    stare_ipa: '/ˈstava/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'prima-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stavamo',
    stare_phonetic: 'stah-VAH-moh',
    stare_ipa: '/staˈvamo/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'seconda-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stavate',
    stare_phonetic: 'stah-VAH-teh',
    stare_ipa: '/staˈvate/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'terza-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stavano',
    stare_phonetic: 'STAH-vah-noh',
    stare_ipa: '/ˈstavano/'
  },

  // FUTURO PROGRESSIVO (Future Progressive)
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'prima-persona',
    plurality: 'singolare',
    stare_auxiliary: 'starò',
    stare_phonetic: 'stah-rOH',
    stare_ipa: '/staˈro/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'seconda-persona',
    plurality: 'singolare',
    stare_auxiliary: 'starai',
    stare_phonetic: 'stah-rAH-ee',
    stare_ipa: '/staˈrai/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'terza-persona',
    plurality: 'singolare',
    stare_auxiliary: 'starà',
    stare_phonetic: 'stah-rAH',
    stare_ipa: '/staˈra/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'prima-persona',
    plurality: 'plurale',
    stare_auxiliary: 'staremo',
    stare_phonetic: 'stah-REH-moh',
    stare_ipa: '/staˈremo/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'seconda-persona',
    plurality: 'plurale',
    stare_auxiliary: 'starete',
    stare_phonetic: 'stah-REH-teh',
    stare_ipa: '/staˈrete/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'terza-persona',
    plurality: 'plurale',
    stare_auxiliary: 'staranno',
    stare_phonetic: 'stah-RAHN-noh',
    stare_ipa: '/staˈranno/'
  },

  // ==========================================
  // CONGIUNTIVO PRESENTE PROGRESSIVO (Subjunctive Present Progressive)
  // ==========================================
  {
    compound_tense_tag: 'congiuntivo-presente-progressivo',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'singolare',
    stare_auxiliary: 'stia',
    stare_phonetic: 'STEE-ah',
    stare_ipa: '/ˈstja/'
  },
  {
    compound_tense_tag: 'congiuntivo-presente-progressivo',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'singolare',
    stare_auxiliary: 'stia',
    stare_phonetic: 'STEE-ah',
    stare_ipa: '/ˈstja/'
  },
  {
    compound_tense_tag: 'congiuntivo-presente-progressivo',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'singolare',
    stare_auxiliary: 'stia',
    stare_phonetic: 'STEE-ah',
    stare_ipa: '/ˈstja/'
  },
  {
    compound_tense_tag: 'congiuntivo-presente-progressivo',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stiamo',
    stare_phonetic: 'STEE-ah-moh',
    stare_ipa: '/ˈstjamo/'
  },
  {
    compound_tense_tag: 'congiuntivo-presente-progressivo',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stiate',
    stare_phonetic: 'STEE-ah-teh',
    stare_ipa: '/ˈstjate/'
  },
  {
    compound_tense_tag: 'congiuntivo-presente-progressivo',
    mood: 'congiuntivo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stiano',
    stare_phonetic: 'STEE-ah-noh',
    stare_ipa: '/ˈstjano/'
  },

  // ==========================================
  // CONDIZIONALE PRESENTE PROGRESSIVO (Conditional Present Progressive)
  // ==========================================
  {
    compound_tense_tag: 'condizionale-presente-progressivo',
    mood: 'condizionale',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'singolare',
    stare_auxiliary: 'starei',
    stare_phonetic: 'stah-REH-ee',
    stare_ipa: '/staˈrei/'
  },
  {
    compound_tense_tag: 'condizionale-presente-progressivo',
    mood: 'condizionale',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'singolare',
    stare_auxiliary: 'staresti',
    stare_phonetic: 'stah-REH-stee',
    stare_ipa: '/staˈresti/'
  },
  {
    compound_tense_tag: 'condizionale-presente-progressivo',
    mood: 'condizionale',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'singolare',
    stare_auxiliary: 'starebbe',
    stare_phonetic: 'stah-REH-beh',
    stare_ipa: '/staˈrebbe/'
  },
  {
    compound_tense_tag: 'condizionale-presente-progressivo',
    mood: 'condizionale',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'plurale',
    stare_auxiliary: 'staremmo',
    stare_phonetic: 'stah-REH-moh',
    stare_ipa: '/staˈremmo/'
  },
  {
    compound_tense_tag: 'condizionale-presente-progressivo',
    mood: 'condizionale',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'plurale',
    stare_auxiliary: 'stareste',
    stare_phonetic: 'stah-REH-steh',
    stare_ipa: '/staˈreste/'
  },
  {
    compound_tense_tag: 'condizionale-presente-progressivo',
    mood: 'condizionale',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'plurale',
    stare_auxiliary: 'starebbero',
    stare_phonetic: 'stah-REH-beh-roh',
    stare_ipa: '/staˈrebbero/'
  }
];

/**
 * Fast lookup map for auxiliary patterns
 * Key format: "tense-person-plurality"
 */
export const AUXILIARY_PATTERN_MAP = new Map<string, AuxiliaryPattern>();

// Populate the lookup map
AUXILIARY_PATTERNS.forEach(pattern => {
  const key = `${pattern.compound_tense_tag}-${pattern.person}-${pattern.plurality}`;
  AUXILIARY_PATTERN_MAP.set(key, pattern);
});

/**
 * Get auxiliary pattern by compound tense, person, and plurality
 * @param tenseTag - e.g., 'passato-prossimo', 'futuro-anteriore'
 * @param person - 'prima-persona', 'seconda-persona', 'terza-persona'
 * @param plurality - 'singolare', 'plurale'
 * @returns AuxiliaryPattern or null if not found
 */
export function getAuxiliaryPattern(
  tenseTag: string, 
  person: string, 
  plurality: string
): AuxiliaryPattern | null {
  const key = `${tenseTag}-${person}-${plurality}`;
  return AUXILIARY_PATTERN_MAP.get(key) || null;
}

/**
 * Get all patterns for a specific compound tense
 * @param tenseTag - e.g., 'passato-prossimo'
 * @returns Array of patterns for all persons/numbers
 */
export function getPatternsForTense(tenseTag: string): AuxiliaryPattern[] {
  return AUXILIARY_PATTERNS.filter(pattern => pattern.compound_tense_tag === tenseTag);
}

/**
 * Check if a tense tag represents a compound tense
 * @param tenseTag - tense tag to check
 * @returns true if tense requires auxiliary + participle
 */
export function isCompoundTense(tenseTag: string): boolean {
  return AUXILIARY_PATTERN_MAP.has(`${tenseTag}-prima-persona-singolare`);
}

/**
 * Get available compound tenses
 * @returns Array of all compound tense tags
 */
export function getAvailableCompoundTenses(): string[] {
  const tenses = new Set<string>();
  AUXILIARY_PATTERNS.forEach(pattern => {
    tenses.add(pattern.compound_tense_tag);
  });
  return Array.from(tenses);
}

/**
 * Validation function to ensure pattern integrity
 * @returns true if all patterns are valid
 */
export function validatePatterns(): boolean {
  const expectedTenses = [
    'passato-prossimo', 'trapassato-prossimo', 'futuro-anteriore', 'trapassato-remoto',
    'congiuntivo-passato', 'congiuntivo-trapassato', 'condizionale-passato',
    'presente-progressivo', 'passato-progressivo', 'futuro-progressivo',
    'congiuntivo-presente-progressivo', 'condizionale-presente-progressivo',
    'infinito-passato', 'gerundio-passato'
  ];

  const persons = ['prima-persona', 'seconda-persona', 'terza-persona'];
  const pluralities = ['singolare', 'plurale'];

  for (const tense of expectedTenses) {
    // Skip invariable forms
    if (tense === 'infinito-passato' || tense === 'gerundio-passato') {
      const pattern = getAuxiliaryPattern(tense, 'invariable', 'invariable');
      if (!pattern) {
        console.error(`Missing pattern: ${tense}-invariable-invariable`);
        return false;
      }
      continue;
    }

    for (const person of persons) {
      for (const plurality of pluralities) {
        const pattern = getAuxiliaryPattern(tense, person, plurality);
        if (!pattern) {
          console.error(`Missing pattern: ${tense}-${person}-${plurality}`);
          return false;
        }
      }
    }
  }

  console.log('✅ All auxiliary patterns validated successfully');
  return true;
}

// Development helper - log pattern statistics
export function logPatternStats(): void {
  console.log(`📊 Auxiliary Pattern Statistics:`);
  console.log(`   Total patterns: ${AUXILIARY_PATTERNS.length}`);
  console.log(`   Compound tenses: ${getAvailableCompoundTenses().length}`);
  console.log(`   Map entries: ${AUXILIARY_PATTERN_MAP.size}`);
  
  const tenseGroups = getAvailableCompoundTenses().map(tense => ({
    tense,
    count: getPatternsForTense(tense).length
  }));
  
  console.table(tenseGroups);
}
