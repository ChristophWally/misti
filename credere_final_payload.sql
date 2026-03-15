-- Complete comprehensive lexical entry for 'credere' with simplified translations
select public.load_lexical_entry($$
{
  "italian": "credere",
  "word_type": "verb",
  "ipa": "/kreˈdere/",
  "phonetic": "kreh-DEH-reh",
  "word_tags": [
    {"attribute_stable_id": "metaattr004", "value": "ere"},
    {"attribute_stable_id": "metaattr003", "value": "A2"},
    {"attribute_stable_id": "metaattr007", "value": "top1000"}
  ],
  "translations": [
    {
      "key": "believe",
      "translation": "to believe",
      "display_priority": 1,
      "usage_notes": "Believing in a statement or proposition",
      "tags": [
        {"attribute_stable_id": "metaattr002", "value": "avere"},
        {"attribute_stable_id": "metaattr020", "value": "transitive"}
      ]
    },
    {
      "key": "trust",
      "translation": "to trust",
      "display_priority": 2,
      "usage_notes": "Trusting a person or their judgment",
      "tags": [
        {"attribute_stable_id": "metaattr002", "value": "avere"},
        {"attribute_stable_id": "metaattr020", "value": "transitive"}
      ]
    },
    {
      "key": "think",
      "translation": "to think",
      "display_priority": 3,
      "usage_notes": "Expressing a personal opinion or supposition",
      "tags": [
        {"attribute_stable_id": "metaattr002", "value": "avere"},
        {"attribute_stable_id": "metaattr020", "value": "transitive"}
      ]
    }
  ],
  "forms": [
    -- INFINITO
    {"form_text": "credere", "ipa": "/kreˈdere/", "phonetic": "kreh-DEH-reh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "infinito"},
      {"attribute_stable_id": "metaattr019", "value": "infinito-presente"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "aver creduto", "ipa": "/aˈver kreˈduto/", "phonetic": "a-VEH-r kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "infinito"},
      {"attribute_stable_id": "metaattr019", "value": "infinito-passato"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},

    -- PARTICIPIO
    {"form_text": "credente", "ipa": "/kreˈdente/", "phonetic": "kreh-DEH-n-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "participio"},
      {"attribute_stable_id": "metaattr019", "value": "participio-presente"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "creduto", "ipa": "/kreˈduto/", "phonetic": "kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "participio"},
      {"attribute_stable_id": "metaattr019", "value": "participio-passato"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},

    -- GERUNDIO
    {"form_text": "credendo", "ipa": "/kreˈdendo/", "phonetic": "kreh-DEH-n-do", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "gerundio"},
      {"attribute_stable_id": "metaattr019", "value": "gerundio-presente"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "avendo creduto", "ipa": "/aˈvendo kreˈduto/", "phonetic": "a-VEH-n-do kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "gerundio"},
      {"attribute_stable_id": "metaattr019", "value": "gerundio-passato"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},

    -- INDICATIVO PRESENTE
    {"form_text": "credo", "ipa": "/ˈkredo/", "phonetic": "KREH-do", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "presente"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credi", "ipa": "/ˈkredi/", "phonetic": "KREH-dee", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "presente"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crede", "ipa": "/ˈkrede/", "phonetic": "KREH-deh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "presente"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crediamo", "ipa": "/kreˈdjamo/", "phonetic": "kreh-DEE-ah-mo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "presente"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credete", "ipa": "/kreˈdete/", "phonetic": "kreh-DEH-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "presente"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credono", "ipa": "/ˈkredono/", "phonetic": "KREH-do-no", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "presente"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},

    -- INDICATIVO IMPERFETTO
    {"form_text": "credevo", "ipa": "/kreˈdevo/", "phonetic": "kreh-DEH-vo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credevi", "ipa": "/kreˈdevi/", "phonetic": "kreh-DEH-vee", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credeva", "ipa": "/kreˈdeva/", "phonetic": "kreh-DEH-va", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credevamo", "ipa": "/kredeˈvamo/", "phonetic": "kreh-deh-VAH-mo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credevate", "ipa": "/kredeˈvate/", "phonetic": "kreh-deh-VAH-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credevano", "ipa": "/kreˈdevano/", "phonetic": "kreh-DEH-va-no", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},

    -- INDICATIVO PASSATO REMOTO
    {"form_text": "credetti", "ipa": "/kreˈdetti/", "phonetic": "kreh-DEH-t-tee", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-remoto"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credesti", "ipa": "/kreˈdesti/", "phonetic": "kreh-DEH-s-tee", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-remoto"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credette", "ipa": "/kreˈdette/", "phonetic": "kreh-DEH-t-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-remoto"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credemmo", "ipa": "/kreˈdemmo/", "phonetic": "kreh-DEH-m-mo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-remoto"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credeste", "ipa": "/kreˈdeste/", "phonetic": "kreh-DEH-s-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-remoto"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credettero", "ipa": "/kreˈdettero/", "phonetic": "kreh-DEH-t-teh-ro", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-remoto"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},

    -- INDICATIVO FUTURO SEMPLICE
    {"form_text": "crederò", "ipa": "/kredeˈro/", "phonetic": "kreh-deh-RO", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-semplice"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederai", "ipa": "/kredeˈrai/", "phonetic": "kreh-deh-RAI", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-semplice"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederà", "ipa": "/kredeˈra/", "phonetic": "kreh-deh-RA", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-semplice"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederemo", "ipa": "/kredeˈremo/", "phonetic": "kreh-deh-REH-mo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-semplice"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederete", "ipa": "/kredeˈrete/", "phonetic": "kreh-deh-REH-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-semplice"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederanno", "ipa": "/kredeˈranno/", "phonetic": "kreh-deh-RAN-no", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-semplice"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},

    -- INDICATIVO PASSATO PROSSIMO
    {"form_text": "ho creduto", "ipa": "/o kreˈduto/", "phonetic": "o kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "hai creduto", "ipa": "/ai kreˈduto/", "phonetic": "ai kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "ha creduto", "ipa": "/a kreˈduto/", "phonetic": "a kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "abbiamo creduto", "ipa": "/abˈbjamo kreˈduto/", "phonetic": "ab-BEE-ah-mo kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avete creduto", "ipa": "/aˈvete kreˈduto/", "phonetic": "a-VEH-teh kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "hanno creduto", "ipa": "/ˈanno kreˈduto/", "phonetic": "AN-no kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "passato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},

    -- INDICATIVO TRAPASSATO PROSSIMO
    {"form_text": "avevo creduto", "ipa": "/aˈvevo kreˈduto/", "phonetic": "a-VEH-vo kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "trapassato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avevi creduto", "ipa": "/aˈvevi kreˈduto/", "phonetic": "a-VEH-vee kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "trapassato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "aveva creduto", "ipa": "/aˈveva kreˈduto/", "phonetic": "a-VEH-va kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "trapassato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avevamo creduto", "ipa": "/aveˈvamo kreˈduto/", "phonetic": "a-veh-VAH-mo kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "trapassato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avevate creduto", "ipa": "/aveˈvate kreˈduto/", "phonetic": "a-veh-VAH-teh kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "trapassato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avevano creduto", "ipa": "/aˈvevano kreˈduto/", "phonetic": "a-VEH-va-no kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "trapassato-prossimo"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},

    -- INDICATIVO FUTURO ANTERIORE
    {"form_text": "avrò creduto", "ipa": "/aˈvro kreˈduto/", "phonetic": "a-VRO kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-anteriore"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avrai creduto", "ipa": "/aˈvrai kreˈduto/", "phonetic": "a-VRAI kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-anteriore"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avrà creduto", "ipa": "/aˈvra kreˈduto/", "phonetic": "a-VRA kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-anteriore"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avremo creduto", "ipa": "/aˈvremo kreˈduto/", "phonetic": "a-VREH-mo kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-anteriore"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avrete creduto", "ipa": "/aˈvrete kreˈduto/", "phonetic": "a-VREH-teh kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-anteriore"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avranno creduto", "ipa": "/aˈvranno kreˈduto/", "phonetic": "a-VRAN-no kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "indicativo"},
      {"attribute_stable_id": "metaattr019", "value": "futuro-anteriore"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},

    -- CONGIUNTIVO PRESENTE
    {"form_text": "creda", "ipa": "/ˈkreda/", "phonetic": "KREH-da", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "creda", "ipa": "/ˈkreda/", "phonetic": "KREH-da", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "creda", "ipa": "/ˈkreda/", "phonetic": "KREH-da", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crediamo", "ipa": "/kreˈdjamo/", "phonetic": "kreh-DEE-ah-mo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crediate", "ipa": "/kreˈdjate/", "phonetic": "kreh-DEE-ah-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credano", "ipa": "/ˈkredano/", "phonetic": "KREH-da-no", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},

    -- CONGIUNTIVO IMPERFETTO
    {"form_text": "credessi", "ipa": "/kreˈdessi/", "phonetic": "kreh-DEH-s-see", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credessi", "ipa": "/kreˈdessi/", "phonetic": "kreh-DEH-s-see", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credesse", "ipa": "/kreˈdesse/", "phonetic": "kreh-DEH-s-seh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credessimo", "ipa": "/kreˈdessimo/", "phonetic": "kreh-DEH-s-see-mo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credeste", "ipa": "/kreˈdeste/", "phonetic": "kreh-DEH-s-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credessero", "ipa": "/kreˈdessero/", "phonetic": "kreh-DEH-s-seh-ro", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-imperfetto"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},

    -- CONGIUNTIVO PASSATO
    {"form_text": "abbia creduto", "ipa": "/ˈabbja kreˈduto/", "phonetic": "AB-bee-ah kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-passato"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "abbia creduto", "ipa": "/ˈabbja kreˈduto/", "phonetic": "AB-bee-ah kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-passato"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "abbia creduto", "ipa": "/ˈabbja kreˈduto/", "phonetic": "AB-bee-ah kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-passato"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "abbiamo creduto", "ipa": "/abˈbjamo kreˈduto/", "phonetic": "ab-BEE-ah-mo kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-passato"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "abbiate creduto", "ipa": "/abˈbjate kreˈduto/", "phonetic": "ab-BEE-ah-teh kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-passato"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "abbiano creduto", "ipa": "/ˈabbiano kreˈduto/", "phonetic": "AB-bee-ah-no kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-passato"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},

    -- CONGIUNTIVO TRAPASSATO
    {"form_text": "avessi creduto", "ipa": "/aˈvessi kreˈduto/", "phonetic": "a-VEH-s-see kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-trapassato"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avessi creduto", "ipa": "/aˈvessi kreˈduto/", "phonetic": "a-VEH-s-see kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-trapassato"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avesse creduto", "ipa": "/aˈvesse kreˈduto/", "phonetic": "a-VEH-s-seh kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-trapassato"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avessimo creduto", "ipa": "/aˈvessimo kreˈduto/", "phonetic": "a-VEH-s-see-mo kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-trapassato"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "aveste creduto", "ipa": "/aˈveste kreˈduto/", "phonetic": "a-VEH-s-teh kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-trapassato"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avessero creduto", "ipa": "/aˈvessero kreˈduto/", "phonetic": "a-VEH-s-seh-ro kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "congiuntivo"},
      {"attribute_stable_id": "metaattr019", "value": "congiuntivo-trapassato"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},

    -- CONDIZIONALE PRESENTE
    {"form_text": "crederei", "ipa": "/kredeˈrei/", "phonetic": "kreh-deh-REI", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-presente"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederesti", "ipa": "/kredeˈresti/", "phonetic": "kreh-deh-REH-s-tee", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-presente"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederebbe", "ipa": "/kredeˈrebbe/", "phonetic": "kreh-deh-REH-b-beh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-presente"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederemmo", "ipa": "/kredeˈremmo/", "phonetic": "kreh-deh-REH-m-mo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-presente"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credereste", "ipa": "/kredeˈreste/", "phonetic": "kreh-deh-REH-s-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-presente"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crederebbero", "ipa": "/kredeˈrebbero/", "phonetic": "kreh-deh-REH-b-beh-ro", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-presente"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},

    -- CONDIZIONALE PASSATO
    {"form_text": "avrei creduto", "ipa": "/aˈvrei kreˈduto/", "phonetic": "a-VREI kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-passato"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avresti creduto", "ipa": "/aˈvresti kreˈduto/", "phonetic": "a-VREH-s-tee kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-passato"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avrebbe creduto", "ipa": "/aˈvrebbe kreˈduto/", "phonetic": "a-VREH-b-beh kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-passato"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avremmo creduto", "ipa": "/aˈvremmo kreˈduto/", "phonetic": "a-VREH-m-mo kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-passato"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avreste creduto", "ipa": "/aˈvreste kreˈduto/", "phonetic": "a-VREH-s-teh kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-passato"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},
    {"form_text": "avrebbero creduto", "ipa": "/aˈvrebbero kreˈduto/", "phonetic": "a-VREH-b-beh-ro kreh-DU-to", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "condizionale"},
      {"attribute_stable_id": "metaattr019", "value": "condizionale-passato"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "compound"},
      {"attribute_stable_id": "metaattr002", "value": "avere"}
    ]},

    -- IMPERATIVO PRESENTE
    {"form_text": "credi", "ipa": "/ˈkredi/", "phonetic": "KREH-dee", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "imperativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperativo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "creda", "ipa": "/ˈkreda/", "phonetic": "KREH-da", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "imperativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperativo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "singolare"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "crediamo", "ipa": "/kreˈdjamo/", "phonetic": "kreh-DEE-ah-mo", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "imperativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperativo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "prima-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credete", "ipa": "/kreˈdete/", "phonetic": "kreh-DEH-teh", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "imperativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperativo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "seconda-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]},
    {"form_text": "credano", "ipa": "/ˈkredano/", "phonetic": "KREH-da-no", "tags": [
      {"attribute_stable_id": "metaattr010", "value": "imperativo"},
      {"attribute_stable_id": "metaattr019", "value": "imperativo-presente"},
      {"attribute_stable_id": "metaattr014", "value": "terza-persona"},
      {"attribute_stable_id": "metaattr012", "value": "plurale"},
      {"attribute_stable_id": "metaattr022", "value": "simple"}
    ]}
  ],
  "form_translations": [
    -- INFINITO FORMS
    {"form_text": "credere", "translation_text": "to believe", "confidence": 0.95},
    {"form_text": "credere", "translation_text": "to trust", "confidence": 0.90},
    {"form_text": "credere", "translation_text": "to think", "confidence": 0.85},
    {"form_text": "aver creduto", "translation_text": "to have believed", "confidence": 0.95},
    {"form_text": "aver creduto", "translation_text": "to have trusted", "confidence": 0.90},
    {"form_text": "aver creduto", "translation_text": "to have thought", "confidence": 0.85},

    -- PARTICIPIO FORMS
    {"form_text": "credente", "translation_text": "believing", "confidence": 0.80},
    {"form_text": "credente", "translation_text": "trusting", "confidence": 0.75},
    {"form_text": "creduto", "translation_text": "believed", "confidence": 0.95},
    {"form_text": "creduto", "translation_text": "trusted", "confidence": 0.90},
    {"form_text": "creduto", "translation_text": "thought", "confidence": 0.85},

    -- GERUNDIO FORMS
    {"form_text": "credendo", "translation_text": "believing", "confidence": 0.90},
    {"form_text": "credendo", "translation_text": "trusting", "confidence": 0.85},
    {"form_text": "credendo", "translation_text": "thinking", "confidence": 0.80},
    {"form_text": "avendo creduto", "translation_text": "having believed", "confidence": 0.95},
    {"form_text": "avendo creduto", "translation_text": "having trusted", "confidence": 0.90},
    {"form_text": "avendo creduto", "translation_text": "having thought", "confidence": 0.85},

    -- INDICATIVO PRESENTE
    {"form_text": "credo", "translation_text": "I believe", "confidence": 0.95},
    {"form_text": "credo", "translation_text": "I trust", "confidence": 0.90},
    {"form_text": "credo", "translation_text": "I think", "confidence": 0.95},
    {"form_text": "credi", "translation_text": "you believe", "confidence": 0.95},
    {"form_text": "credi", "translation_text": "you trust", "confidence": 0.90},
    {"form_text": "credi", "translation_text": "you think", "confidence": 0.95},
    {"form_text": "crede", "translation_text": "he/she believes", "confidence": 0.95},
    {"form_text": "crede", "translation_text": "he/she trusts", "confidence": 0.90},
    {"form_text": "crede", "translation_text": "he/she thinks", "confidence": 0.95},
    {"form_text": "crediamo", "translation_text": "we believe", "confidence": 0.95},
    {"form_text": "crediamo", "translation_text": "we trust", "confidence": 0.90},
    {"form_text": "crediamo", "translation_text": "we think", "confidence": 0.95},
    {"form_text": "credete", "translation_text": "you (plural) believe", "confidence": 0.95},
    {"form_text": "credete", "translation_text": "you (plural) trust", "confidence": 0.90},
    {"form_text": "credete", "translation_text": "you (plural) think", "confidence": 0.95},
    {"form_text": "credono", "translation_text": "they believe", "confidence": 0.95},
    {"form_text": "credono", "translation_text": "they trust", "confidence": 0.90},
    {"form_text": "credono", "translation_text": "they think", "confidence": 0.95},

    -- INDICATIVO IMPERFETTO
    {"form_text": "credevo", "translation_text": "I was believing", "confidence": 0.95},
    {"form_text": "credevo", "translation_text": "I was trusting", "confidence": 0.90},
    {"form_text": "credevo", "translation_text": "I was thinking", "confidence": 0.95},
    {"form_text": "credevi", "translation_text": "you were believing", "confidence": 0.95},
    {"form_text": "credevi", "translation_text": "you were trusting", "confidence": 0.90},
    {"form_text": "credevi", "translation_text": "you were thinking", "confidence": 0.95},
    {"form_text": "credeva", "translation_text": "he/she was believing", "confidence": 0.95},
    {"form_text": "credeva", "translation_text": "he/she was trusting", "confidence": 0.90},
    {"form_text": "credeva", "translation_text": "he/she was thinking", "confidence": 0.95},
    {"form_text": "credevamo", "translation_text": "we were believing", "confidence": 0.95},
    {"form_text": "credevamo", "translation_text": "we were trusting", "confidence": 0.90},
    {"form_text": "credevamo", "translation_text": "we were thinking", "confidence": 0.95},
    {"form_text": "credevate", "translation_text": "you (plural) were believing", "confidence": 0.95},
    {"form_text": "credevate", "translation_text": "you (plural) were trusting", "confidence": 0.90},
    {"form_text": "credevate", "translation_text": "you (plural) were thinking", "confidence": 0.95},
    {"form_text": "credevano", "translation_text": "they were believing", "confidence": 0.95},
    {"form_text": "credevano", "translation_text": "they were trusting", "confidence": 0.90},
    {"form_text": "credevano", "translation_text": "they were thinking", "confidence": 0.95},

    -- INDICATIVO PASSATO REMOTO
    {"form_text": "credetti", "translation_text": "I believed", "confidence": 0.95},
    {"form_text": "credetti", "translation_text": "I trusted", "confidence": 0.90},
    {"form_text": "credetti", "translation_text": "I thought", "confidence": 0.95},
    {"form_text": "credesti", "translation_text": "you believed", "confidence": 0.95},
    {"form_text": "credesti", "translation_text": "you trusted", "confidence": 0.90},
    {"form_text": "credesti", "translation_text": "you thought", "confidence": 0.95},
    {"form_text": "credette", "translation_text": "he/she believed", "confidence": 0.95},
    {"form_text": "credette", "translation_text": "he/she trusted", "confidence": 0.90},
    {"form_text": "credette", "translation_text": "he/she thought", "confidence": 0.95},
    {"form_text": "credemmo", "translation_text": "we believed", "confidence": 0.95},
    {"form_text": "credemmo", "translation_text": "we trusted", "confidence": 0.90},
    {"form_text": "credemmo", "translation_text": "we thought", "confidence": 0.95},
    {"form_text": "credeste", "translation_text": "you (plural) believed", "confidence": 0.95},
    {"form_text": "credeste", "translation_text": "you (plural) trusted", "confidence": 0.90},
    {"form_text": "credeste", "translation_text": "you (plural) thought", "confidence": 0.95},
    {"form_text": "credettero", "translation_text": "they believed", "confidence": 0.95},
    {"form_text": "credettero", "translation_text": "they trusted", "confidence": 0.90},
    {"form_text": "credettero", "translation_text": "they thought", "confidence": 0.95},

    -- INDICATIVO FUTURO SEMPLICE
    {"form_text": "crederò", "translation_text": "I will believe", "confidence": 0.95},
    {"form_text": "crederò", "translation_text": "I will trust", "confidence": 0.90},
    {"form_text": "crederò", "translation_text": "I will think", "confidence": 0.95},
    {"form_text": "crederai", "translation_text": "you will believe", "confidence": 0.95},
    {"form_text": "crederai", "translation_text": "you will trust", "confidence": 0.90},
    {"form_text": "crederai", "translation_text": "you will think", "confidence": 0.95},
    {"form_text": "crederà", "translation_text": "he/she will believe", "confidence": 0.95},
    {"form_text": "crederà", "translation_text": "he/she will trust", "confidence": 0.90},
    {"form_text": "crederà", "translation_text": "he/she will think", "confidence": 0.95},
    {"form_text": "crederemo", "translation_text": "we will believe", "confidence": 0.95},
    {"form_text": "crederemo", "translation_text": "we will trust", "confidence": 0.90},
    {"form_text": "crederemo", "translation_text": "we will think", "confidence": 0.95},
    {"form_text": "crederete", "translation_text": "you (plural) will believe", "confidence": 0.95},
    {"form_text": "crederete", "translation_text": "you (plural) will trust", "confidence": 0.90},
    {"form_text": "crederete", "translation_text": "you (plural) will think", "confidence": 0.95},
    {"form_text": "crederanno", "translation_text": "they will believe", "confidence": 0.95},
    {"form_text": "crederanno", "translation_text": "they will trust", "confidence": 0.90},
    {"form_text": "crederanno", "translation_text": "they will think", "confidence": 0.95},

    -- INDICATIVO PASSATO PROSSIMO
    {"form_text": "ho creduto", "translation_text": "I have believed", "confidence": 0.95},
    {"form_text": "ho creduto", "translation_text": "I have trusted", "confidence": 0.90},
    {"form_text": "ho creduto", "translation_text": "I have thought", "confidence": 0.95},
    {"form_text": "hai creduto", "translation_text": "you have believed", "confidence": 0.95},
    {"form_text": "hai creduto", "translation_text": "you have trusted", "confidence": 0.90},
    {"form_text": "hai creduto", "translation_text": "you have thought", "confidence": 0.95},
    {"form_text": "ha creduto", "translation_text": "he/she has believed", "confidence": 0.95},
    {"form_text": "ha creduto", "translation_text": "he/she has trusted", "confidence": 0.90},
    {"form_text": "ha creduto", "translation_text": "he/she has thought", "confidence": 0.95},
    {"form_text": "abbiamo creduto", "translation_text": "we have believed", "confidence": 0.95},
    {"form_text": "abbiamo creduto", "translation_text": "we have trusted", "confidence": 0.90},
    {"form_text": "abbiamo creduto", "translation_text": "we have thought", "confidence": 0.95},
    {"form_text": "avete creduto", "translation_text": "you (plural) have believed", "confidence": 0.95},
    {"form_text": "avete creduto", "translation_text": "you (plural) have trusted", "confidence": 0.90},
    {"form_text": "avete creduto", "translation_text": "you (plural) have thought", "confidence": 0.95},
    {"form_text": "hanno creduto", "translation_text": "they have believed", "confidence": 0.95},
    {"form_text": "hanno creduto", "translation_text": "they have trusted", "confidence": 0.90},
    {"form_text": "hanno creduto", "translation_text": "they have thought", "confidence": 0.95},

    -- INDICATIVO TRAPASSATO PROSSIMO
    {"form_text": "avevo creduto", "translation_text": "I had believed", "confidence": 0.95},
    {"form_text": "avevo creduto", "translation_text": "I had trusted", "confidence": 0.90},
    {"form_text": "avevo creduto", "translation_text": "I had thought", "confidence": 0.95},
    {"form_text": "avevi creduto", "translation_text": "you had believed", "confidence": 0.95},
    {"form_text": "avevi creduto", "translation_text": "you had trusted", "confidence": 0.90},
    {"form_text": "avevi creduto", "translation_text": "you had thought", "confidence": 0.95},
    {"form_text": "aveva creduto", "translation_text": "he/she had believed", "confidence": 0.95},
    {"form_text": "aveva creduto", "translation_text": "he/she had trusted", "confidence": 0.90},
    {"form_text": "aveva creduto", "translation_text": "he/she had thought", "confidence": 0.95},
    {"form_text": "avevamo creduto", "translation_text": "we had believed", "confidence": 0.95},
    {"form_text": "avevamo creduto", "translation_text": "we had trusted", "confidence": 0.90},
    {"form_text": "avevamo creduto", "translation_text": "we had thought", "confidence": 0.95},
    {"form_text": "avevate creduto", "translation_text": "you (plural) had believed", "confidence": 0.95},
    {"form_text": "avevate creduto", "translation_text": "you (plural) had trusted", "confidence": 0.90},
    {"form_text": "avevate creduto", "translation_text": "you (plural) had thought", "confidence": 0.95},
    {"form_text": "avevano creduto", "translation_text": "they had believed", "confidence": 0.95},
    {"form_text": "avevano creduto", "translation_text": "they had trusted", "confidence": 0.90},
    {"form_text": "avevano creduto", "translation_text": "they had thought", "confidence": 0.95},

    -- INDICATIVO FUTURO ANTERIORE
    {"form_text": "avrò creduto", "translation_text": "I will have believed", "confidence": 0.95},
    {"form_text": "avrò creduto", "translation_text": "I will have trusted", "confidence": 0.90},
    {"form_text": "avrò creduto", "translation_text": "I will have thought", "confidence": 0.95},
    {"form_text": "avrai creduto", "translation_text": "you will have believed", "confidence": 0.95},
    {"form_text": "avrai creduto", "translation_text": "you will have trusted", "confidence": 0.90},
    {"form_text": "avrai creduto", "translation_text": "you will have thought", "confidence": 0.95},
    {"form_text": "avrà creduto", "translation_text": "he/she will have believed", "confidence": 0.95},
    {"form_text": "avrà creduto", "translation_text": "he/she will have trusted", "confidence": 0.90},
    {"form_text": "avrà creduto", "translation_text": "he/she will have thought", "confidence": 0.95},
    {"form_text": "avremo creduto", "translation_text": "we will have believed", "confidence": 0.95},
    {"form_text": "avremo creduto", "translation_text": "we will have trusted", "confidence": 0.90},
    {"form_text": "avremo creduto", "translation_text": "we will have thought", "confidence": 0.95},
    {"form_text": "avrete creduto", "translation_text": "you (plural) will have believed", "confidence": 0.95},
    {"form_text": "avrete creduto", "translation_text": "you (plural) will have trusted", "confidence": 0.90},
    {"form_text": "avrete creduto", "translation_text": "you (plural) will have thought", "confidence": 0.95},
    {"form_text": "avranno creduto", "translation_text": "they will have believed", "confidence": 0.95},
    {"form_text": "avranno creduto", "translation_text": "they will have trusted", "confidence": 0.90},
    {"form_text": "avranno creduto", "translation_text": "they will have thought", "confidence": 0.95},

    -- CONGIUNTIVO PRESENTE
    {"form_text": "creda", "translation_text": "(that) I/you/he/she believe", "confidence": 0.95},
    {"form_text": "creda", "translation_text": "(that) I/you/he/she trust", "confidence": 0.90},
    {"form_text": "creda", "translation_text": "(that) I/you/he/she think", "confidence": 0.95},
    {"form_text": "crediate", "translation_text": "(that) you (plural) believe", "confidence": 0.95},
    {"form_text": "crediate", "translation_text": "(that) you (plural) trust", "confidence": 0.90},
    {"form_text": "crediate", "translation_text": "(that) you (plural) think", "confidence": 0.95},
    {"form_text": "credano", "translation_text": "(that) they believe", "confidence": 0.95},
    {"form_text": "credano", "translation_text": "(that) they trust", "confidence": 0.90},
    {"form_text": "credano", "translation_text": "(that) they think", "confidence": 0.95},

    -- CONGIUNTIVO IMPERFETTO
    {"form_text": "credessi", "translation_text": "(that) I/you believed", "confidence": 0.95},
    {"form_text": "credessi", "translation_text": "(that) I/you trusted", "confidence": 0.90},
    {"form_text": "credessi", "translation_text": "(that) I/you thought", "confidence": 0.95},
    {"form_text": "credesse", "translation_text": "(that) he/she believed", "confidence": 0.95},
    {"form_text": "credesse", "translation_text": "(that) he/she trusted", "confidence": 0.90},
    {"form_text": "credesse", "translation_text": "(that) he/she thought", "confidence": 0.95},
    {"form_text": "credessimo", "translation_text": "(that) we believed", "confidence": 0.95},
    {"form_text": "credessimo", "translation_text": "(that) we trusted", "confidence": 0.90},
    {"form_text": "credessimo", "translation_text": "(that) we thought", "confidence": 0.95},
    {"form_text": "credeste", "translation_text": "(that) you (plural) believed", "confidence": 0.95},
    {"form_text": "credeste", "translation_text": "(that) you (plural) trusted", "confidence": 0.90},
    {"form_text": "credeste", "translation_text": "(that) you (plural) thought", "confidence": 0.95},
    {"form_text": "credessero", "translation_text": "(that) they believed", "confidence": 0.95},
    {"form_text": "credessero", "translation_text": "(that) they trusted", "confidence": 0.90},
    {"form_text": "credessero", "translation_text": "(that) they thought", "confidence": 0.95},

    -- CONGIUNTIVO PASSATO
    {"form_text": "abbia creduto", "translation_text": "(that) I/you/he/she have believed", "confidence": 0.95},
    {"form_text": "abbia creduto", "translation_text": "(that) I/you/he/she have trusted", "confidence": 0.90},
    {"form_text": "abbia creduto", "translation_text": "(that) I/you/he/she have thought", "confidence": 0.95},
    {"form_text": "abbiamo creduto", "translation_text": "(that) we have believed", "confidence": 0.95},
    {"form_text": "abbiamo creduto", "translation_text": "(that) we have trusted", "confidence": 0.90},
    {"form_text": "abbiamo creduto", "translation_text": "(that) we have thought", "confidence": 0.95},
    {"form_text": "abbiate creduto", "translation_text": "(that) you (plural) have believed", "confidence": 0.95},
    {"form_text": "abbiate creduto", "translation_text": "(that) you (plural) have trusted", "confidence": 0.90},
    {"form_text": "abbiate creduto", "translation_text": "(that) you (plural) have thought", "confidence": 0.95},
    {"form_text": "abbiano creduto", "translation_text": "(that) they have believed", "confidence": 0.95},
    {"form_text": "abbiano creduto", "translation_text": "(that) they have trusted", "confidence": 0.90},
    {"form_text": "abbiano creduto", "translation_text": "(that) they have thought", "confidence": 0.95},

    -- CONGIUNTIVO TRAPASSATO
    {"form_text": "avessi creduto", "translation_text": "(that) I/you had believed", "confidence": 0.95},
    {"form_text": "avessi creduto", "translation_text": "(that) I/you had trusted", "confidence": 0.90},
    {"form_text": "avessi creduto", "translation_text": "(that) I/you had thought", "confidence": 0.95},
    {"form_text": "avesse creduto", "translation_text": "(that) he/she had believed", "confidence": 0.95},
    {"form_text": "avesse creduto", "translation_text": "(that) he/she had trusted", "confidence": 0.90},
    {"form_text": "avesse creduto", "translation_text": "(that) he/she had thought", "confidence": 0.95},
    {"form_text": "avessimo creduto", "translation_text": "(that) we had believed", "confidence": 0.95},
    {"form_text": "avessimo creduto", "translation_text": "(that) we had trusted", "confidence": 0.90},
    {"form_text": "avessimo creduto", "translation_text": "(that) we had thought", "confidence": 0.95},
    {"form_text": "aveste creduto", "translation_text": "(that) you (plural) had believed", "confidence": 0.95},
    {"form_text": "aveste creduto", "translation_text": "(that) you (plural) had trusted", "confidence": 0.90},
    {"form_text": "aveste creduto", "translation_text": "(that) you (plural) had thought", "confidence": 0.95},
    {"form_text": "avessero creduto", "translation_text": "(that) they had believed", "confidence": 0.95},
    {"form_text": "avessero creduto", "translation_text": "(that) they had trusted", "confidence": 0.90},
    {"form_text": "avessero creduto", "translation_text": "(that) they had thought", "confidence": 0.95},

    -- CONDIZIONALE PRESENTE
    {"form_text": "crederei", "translation_text": "I would believe", "confidence": 0.95},
    {"form_text": "crederei", "translation_text": "I would trust", "confidence": 0.90},
    {"form_text": "crederei", "translation_text": "I would think", "confidence": 0.95},
    {"form_text": "crederesti", "translation_text": "you would believe", "confidence": 0.95},
    {"form_text": "crederesti", "translation_text": "you would trust", "confidence": 0.90},
    {"form_text": "crederesti", "translation_text": "you would think", "confidence": 0.95},
    {"form_text": "crederebbe", "translation_text": "he/she would believe", "confidence": 0.95},
    {"form_text": "crederebbe", "translation_text": "he/she would trust", "confidence": 0.90},
    {"form_text": "crederebbe", "translation_text": "he/she would think", "confidence": 0.95},
    {"form_text": "crederemmo", "translation_text": "we would believe", "confidence": 0.95},
    {"form_text": "crederemmo", "translation_text": "we would trust", "confidence": 0.90},
    {"form_text": "crederemmo", "translation_text": "we would think", "confidence": 0.95},
    {"form_text": "credereste", "translation_text": "you (plural) would believe", "confidence": 0.95},
    {"form_text": "credereste", "translation_text": "you (plural) would trust", "confidence": 0.90},
    {"form_text": "credereste", "translation_text": "you (plural) would think", "confidence": 0.95},
    {"form_text": "crederebbero", "translation_text": "they would believe", "confidence": 0.95},
    {"form_text": "crederebbero", "translation_text": "they would trust", "confidence": 0.90},
    {"form_text": "crederebbero", "translation_text": "they would think", "confidence": 0.95},

    -- CONDIZIONALE PASSATO
    {"form_text": "avrei creduto", "translation_text": "I would have believed", "confidence": 0.95},
    {"form_text": "avrei creduto", "translation_text": "I would have trusted", "confidence": 0.90},
    {"form_text": "avrei creduto", "translation_text": "I would have thought", "confidence": 0.95},
    {"form_text": "avresti creduto", "translation_text": "you would have believed", "confidence": 0.95},
    {"form_text": "avresti creduto", "translation_text": "you would have trusted", "confidence": 0.90},
    {"form_text": "avresti creduto", "translation_text": "you would have thought", "confidence": 0.95},
    {"form_text": "avrebbe creduto", "translation_text": "he/she would have believed", "confidence": 0.95},
    {"form_text": "avrebbe creduto", "translation_text": "he/she would have trusted", "confidence": 0.90},
    {"form_text": "avrebbe creduto", "translation_text": "he/she would have thought", "confidence": 0.95},
    {"form_text": "avremmo creduto", "translation_text": "we would have believed", "confidence": 0.95},
    {"form_text": "avremmo creduto", "translation_text": "we would have trusted", "confidence": 0.90},
    {"form_text": "avremmo creduto", "translation_text": "we would have thought", "confidence": 0.95},
    {"form_text": "avreste creduto", "translation_text": "you (plural) would have believed", "confidence": 0.95},
    {"form_text": "avreste creduto", "translation_text": "you (plural) would have trusted", "confidence": 0.90},
    {"form_text": "avreste creduto", "translation_text": "you (plural) would have thought", "confidence": 0.95},
    {"form_text": "avrebbero creduto", "translation_text": "they would have believed", "confidence": 0.95},
    {"form_text": "avrebbero creduto", "translation_text": "they would have trusted", "confidence": 0.90},
    {"form_text": "avrebbero creduto", "translation_text": "they would have thought", "confidence": 0.95},

    -- IMPERATIVO PRESENTE
    {"form_text": "credi", "translation_text": "believe!", "confidence": 0.95},
    {"form_text": "credi", "translation_text": "trust!", "confidence": 0.90},
    {"form_text": "credi", "translation_text": "think!", "confidence": 0.95},
    {"form_text": "credete", "translation_text": "believe! (plural)", "confidence": 0.95},
    {"form_text": "credete", "translation_text": "trust! (plural)", "confidence": 0.90},
    {"form_text": "credete", "translation_text": "think! (plural)", "confidence": 0.95}
  ],
  "options": {
    "strict": true
  }
}
$$::jsonb);