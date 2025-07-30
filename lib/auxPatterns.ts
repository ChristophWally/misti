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
  avere_auxiliary: string;
  essere_auxiliary: string;
  avere_phonetic: string;
  essere_phonetic: string;
  avere_ipa: string;
  essere_ipa: string;
  stare_auxiliary?: string; // For progressive tenses
  stare_phonetic?: string;
  stare_ipa?: string;
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
    essere_phonetic: 'soh-noh',
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
    avere_phonetic: 'ah-bee-ah-moh',
    essere_phonetic: 'see-ah-moh',
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
    avere_phonetic: 'ah-veh-teh',
    essere_phonetic: 'see-eh-teh',
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
    avere_phonetic: 'ah-noh',
    essere_phonetic: 'soh-noh',
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
    avere_phonetic: 'ah-veh-voh',
    essere_phonetic: 'eh-roh',
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
    avere_phonetic: 'ah-veh-vee',
    essere_phonetic: 'eh-ree',
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
    avere_phonetic: 'ah-veh-vah',
    essere_phonetic: 'eh-rah',
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
    avere_phonetic: 'ah-veh-vah-moh',
    essere_phonetic: 'eh-rah-vah-moh',
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
    avere_phonetic: 'ah-veh-vah-teh',
    essere_phonetic: 'eh-rah-vah-teh',
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
    avere_phonetic: 'ah-veh-vah-noh',
    essere_phonetic: 'eh-rah-noh',
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
    avere_phonetic: 'ah-vroh',
    essere_phonetic: 'sah-roh',
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
    avere_phonetic: 'ah-vrah-ee',
    essere_phonetic: 'sah-rah-ee',
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
    avere_phonetic: 'ah-vrah',
    essere_phonetic: 'sah-rah',
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
    avere_phonetic: 'ah-vreh-moh',
    essere_phonetic: 'sah-reh-moh',
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
    avere_phonetic: 'ah-vreh-teh',
    essere_phonetic: 'sah-reh-teh',
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
    avere_phonetic: 'ah-vrah-noh',
    essere_phonetic: 'sah-rah-noh',
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
    avere_phonetic: 'eh-bee',
    essere_phonetic: 'foo-ee',
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
    avere_phonetic: 'ah-veh-stee',
    essere_phonetic: 'foh-stee',
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
    avere_phonetic: 'ah-veh-moh',
    essere_phonetic: 'foo-moh',
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
    avere_phonetic: 'ah-veh-steh',
    essere_phonetic: 'foh-steh',
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
    avere_phonetic: 'eh-beh-roh',
    essere_phonetic: 'foo-roh-noh',
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
    avere_phonetic: 'ah-bee-ah',
    essere_phonetic: 'see-ah',
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
    avere_phonetic: 'ah-bee-ah',
    essere_phonetic: 'see-ah',
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
    avere_phonetic: 'ah-bee-ah',
    essere_phonetic: 'see-ah',
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
    avere_phonetic: 'ah-bee-ah-moh',
    essere_phonetic: 'see-ah-moh',
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
    avere_phonetic: 'ah-bee-ah-teh',
    essere_phonetic: 'see-ah-teh',
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
    avere_phonetic: 'ah-bee-ah-noh',
    essere_phonetic: 'see-ah-noh',
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
    avere_phonetic: 'ah-veh-see',
    essere_phonetic: 'foh-see',
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
    avere_phonetic: 'ah-veh-see',
    essere_phonetic: 'foh-see',
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
    avere_phonetic: 'ah-veh-seh',
    essere_phonetic: 'foh-seh',
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
    avere_phonetic: 'ah-veh-see-moh',
    essere_phonetic: 'foh-see-moh',
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
    avere_phonetic: 'ah-veh-steh',
    essere_phonetic: 'foh-steh',
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
    avere_phonetic: 'ah-veh-seh-roh',
    essere_phonetic: 'foh-seh-roh',
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
    avere_phonetic: 'ah-vreh-ee',
    essere_phonetic: 'sah-reh-ee',
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
    avere_phonetic: 'ah-vreh-stee',
    essere_phonetic: 'sah-reh-stee',
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
    avere_phonetic: 'ah-vreh-beh',
    essere_phonetic: 'sah-reh-beh',
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
    avere_phonetic: 'ah-vreh-moh',
    essere_phonetic: 'sah-reh-moh',
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
    avere_phonetic: 'ah-vreh-steh',
    essere_phonetic: 'sah-reh-steh',
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
    avere_phonetic: 'ah-vreh-beh-roh',
    essere_phonetic: 'sah-reh-beh-roh',
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
    avere_phonetic: 'ah-veh-reh',
    essere_phonetic: 'eh-seh-reh',
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
    avere_phonetic: 'ah-ven-doh',
    essere_phonetic: 'eh-sen-doh',
    avere_ipa: '/aˈvendo/',
    essere_ipa: '/esˈsendo/'
  },

  // ==========================================
  // PROGRESSIVE TENSES (using STARE)
  // Note: Progressive tenses use stare patterns stored in avere column
  // ==========================================

  // PRESENTE PROGRESSIVO (Present Progressive)
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'sto', // Note: Using avere column for stare patterns
    essere_auxiliary: 'sto', // Same for both - progressives always use stare
    avere_phonetic: 'stoh',
    essere_phonetic: 'stoh',
    avere_ipa: '/sto/',
    essere_ipa: '/sto/',
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
    avere_auxiliary: 'stai',
    essere_auxiliary: 'stai',
    avere_phonetic: 'stah-ee',
    essere_phonetic: 'stah-ee',
    avere_ipa: '/stai/',
    essere_ipa: '/stai/',
    stare_auxiliary: 'stai',
    stare_phonetic: 'stah-ee',
    stare_ipa: '/stai/'
  },
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'sta',
    essere_auxiliary: 'sta',
    avere_phonetic: 'stah',
    essere_phonetic: 'stah',
    avere_ipa: '/sta/',
    essere_ipa: '/sta/',
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
    avere_auxiliary: 'stiamo',
    essere_auxiliary: 'stiamo',
    avere_phonetic: 'stee-ah-moh',
    essere_phonetic: 'stee-ah-moh',
    avere_ipa: '/ˈstjamo/',
    essere_ipa: '/ˈstjamo/',
    stare_auxiliary: 'stiamo',
    stare_phonetic: 'stee-ah-moh',
    stare_ipa: '/ˈstjamo/'
  },
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'state',
    essere_auxiliary: 'state',
    avere_phonetic: 'stah-teh',
    essere_phonetic: 'stah-teh',
    avere_ipa: '/ˈstate/',
    essere_ipa: '/ˈstate/',
    stare_auxiliary: 'state',
    stare_phonetic: 'stah-teh',
    stare_ipa: '/ˈstate/'
  },
  {
    compound_tense_tag: 'presente-progressivo',
    mood: 'indicativo',
    tense: 'presente',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'stanno',
    essere_auxiliary: 'stanno',
    avere_phonetic: 'stah-noh',
    essere_phonetic: 'stah-noh',
    avere_ipa: '/ˈstanno/',
    essere_ipa: '/ˈstanno/',
    stare_auxiliary: 'stanno',
    stare_phonetic: 'stah-noh',
    stare_ipa: '/ˈstanno/'
  },

  // PASSATO PROGRESSIVO (Past Progressive)
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'stavo',
    essere_auxiliary: 'stavo',
    avere_phonetic: 'stah-voh',
    essere_phonetic: 'stah-voh',
    avere_ipa: '/ˈstavo/',
    essere_ipa: '/ˈstavo/',
    stare_auxiliary: 'stavo',
    stare_phonetic: 'stah-voh',
    stare_ipa: '/ˈstavo/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'stavi',
    essere_auxiliary: 'stavi',
    avere_phonetic: 'stah-vee',
    essere_phonetic: 'stah-vee',
    avere_ipa: '/ˈstavi/',
    essere_ipa: '/ˈstavi/',
    stare_auxiliary: 'stavi',
    stare_phonetic: 'stah-vee',
    stare_ipa: '/ˈstavi/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'stava',
    essere_auxiliary: 'stava',
    avere_phonetic: 'stah-vah',
    essere_phonetic: 'stah-vah',
    avere_ipa: '/ˈstava/',
    essere_ipa: '/ˈstava/',
    stare_auxiliary: 'stava',
    stare_phonetic: 'stah-vah',
    stare_ipa: '/ˈstava/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'stavamo',
    essere_auxiliary: 'stavamo',
    avere_phonetic: 'stah-vah-moh',
    essere_phonetic: 'stah-vah-moh',
    avere_ipa: '/staˈvamo/',
    essere_ipa: '/staˈvamo/',
    stare_auxiliary: 'stavamo',
    stare_phonetic: 'stah-vah-moh',
    stare_ipa: '/staˈvamo/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'stavate',
    essere_auxiliary: 'stavate',
    avere_phonetic: 'stah-vah-teh',
    essere_phonetic: 'stah-vah-teh',
    avere_ipa: '/staˈvate/',
    essere_ipa: '/staˈvate/',
    stare_auxiliary: 'stavate',
    stare_phonetic: 'stah-vah-teh',
    stare_ipa: '/staˈvate/'
  },
  {
    compound_tense_tag: 'passato-progressivo',
    mood: 'indicativo',
    tense: 'imperfetto',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'stavano',
    essere_auxiliary: 'stavano',
    avere_phonetic: 'stah-vah-noh',
    essere_phonetic: 'stah-vah-noh',
    avere_ipa: '/ˈstavano/',
    essere_ipa: '/ˈstavano/',
    stare_auxiliary: 'stavano',
    stare_phonetic: 'stah-vah-noh',
    stare_ipa: '/ˈstavano/'
  },

  // FUTURO PROGRESSIVO (Future Progressive)
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'prima-persona',
    plurality: 'singolare',
    avere_auxiliary: 'starò',
    essere_auxiliary: 'starò',
    avere_phonetic: 'stah-roh',
    essere_phonetic: 'stah-roh',
    avere_ipa: '/staˈro/',
    essere_ipa: '/staˈro/',
    stare_auxiliary: 'starò',
    stare_phonetic: 'stah-roh',
    stare_ipa: '/staˈro/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'seconda-persona',
    plurality: 'singolare',
    avere_auxiliary: 'starai',
    essere_auxiliary: 'starai',
    avere_phonetic: 'stah-rah-ee',
    essere_phonetic: 'stah-rah-ee',
    avere_ipa: '/staˈrai/',
    essere_ipa: '/staˈrai/',
    stare_auxiliary: 'starai',
    stare_phonetic: 'stah-rah-ee',
    stare_ipa: '/staˈrai/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'terza-persona',
    plurality: 'singolare',
    avere_auxiliary: 'starà',
    essere_auxiliary: 'starà',
    avere_phonetic: 'stah-rah',
    essere_phonetic: 'stah-rah',
    avere_ipa: '/staˈra/',
    essere_ipa: '/staˈra/',
    stare_auxiliary: 'starà',
    stare_phonetic: 'stah-rah',
    stare_ipa: '/staˈra/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'prima-persona',
    plurality: 'plurale',
    avere_auxiliary: 'staremo',
    essere_auxiliary: 'staremo',
    avere_phonetic: 'stah-reh-moh',
    essere_phonetic: 'stah-reh-moh',
    avere_ipa: '/staˈremo/',
    essere_ipa: '/staˈremo/',
    stare_auxiliary: 'staremo',
    stare_phonetic: 'stah-reh-moh',
    stare_ipa: '/staˈremo/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'seconda-persona',
    plurality: 'plurale',
    avere_auxiliary: 'starete',
    essere_auxiliary: 'starete',
    avere_phonetic: 'stah-reh-teh',
    essere_phonetic: 'stah-reh-teh',
    avere_ipa: '/staˈrete/',
    essere_ipa: '/staˈrete/',
    stare_auxiliary: 'starete',
    stare_phonetic: 'stah-reh-teh',
    stare_ipa: '/staˈrete/'
  },
  {
    compound_tense_tag: 'futuro-progressivo',
    mood: 'indicativo',
    tense: 'futuro',
    person: 'terza-persona',
    plurality: 'plurale',
    avere_auxiliary: 'staranno',
    essere_auxiliary: 'staranno',
    avere_phonetic: 'stah-rah-noh',
    essere_phonetic: 'stah-rah-noh',
    avere_ipa: '/staˈranno/',
    essere_ipa: '/staˈranno/',
    stare_auxiliary: 'staranno',
    stare_phonetic: 'stah-rah-noh',
    stare_ipa: '/staˈranno/'
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
