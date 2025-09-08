// lib/meta-constants.js
// UUID constants for meta attributes and values from the normalized RPC system
// These correspond to the entity_meta_values system in Supabase

// ATTRIBUTE UUIDs
export const ATTRIBUTES = {
  // Core word attributes
  ADVERB_TYPE: "21e95d9a-9523-400f-91ab-5f877df71d84", // metaattr001
  AUXILIARY_VERB: "65289998-b2c4-4dfd-8212-1f7cb9635dc4", // metaattr002
  CEFR_LEVEL: "554a6624-fd30-4d1c-b664-5f8433dfe576", // metaattr003
  CONJUGATION_TYPE: "74df568f-0ed3-4f74-9979-f6d64fc7a54b", // metaattr004
  IRREGULAR_FORMS: "4dc48097-de1d-4dc8-9371-ab8a5d320203", // metaattr005
  FORM_PATTERN: "36e6b866-c2cf-48b5-ba67-2fa70a1522b5", // metaattr006
  FREQUENCY_TIER: "3c909352-4588-4951-8076-6f23081d99be", // metaattr007
  GENDER_USAGE: "7b1a301d-4f4c-405f-b6d7-01af1efb8574", // metaattr008
  GRADABLE: "f40a8c4c-09cf-4385-a612-dbf90d3bd478", // metaattr009
  WORD_GENDER: "08a37467-3de5-42b2-a22a-29127c58c942", // metaattr011
  NUMBER: "b83d846f-ec8e-4f01-842b-e1afe1cda090", // number
  NUMBER_RESTRICTION: "6aa64a52-2009-4d0c-ad77-a6c57b69ebce", // metaattr013
  // PLURAL_ONLY: deprecated - consolidated into NUMBER_RESTRICTION (metaattr015)
  REFLEXIVE: "ac7dbcf5-28bb-4432-9210-f6a0a90098e4", // metaattr017
  REGISTER: "f3e4381a-e48b-4317-b581-56634fa63879", // metaattr018
}

// VALUE UUIDs for key restrictions and tags
export const VALUES = {
  // Auxiliary Verb values
  AUXILIARY_AVERE: "0e365292-82f3-4daf-98b1-8f792e74bc7d", // metaattr002val014
  AUXILIARY_ESSERE: "af8ac912-2adb-487a-b800-71e1b306d3cb", // metaattr002val015

  // CEFR Level values
  CEFR_A1: "adafe588-8a37-4160-bd6a-0a0dfd88ccb3", // metaattr003val033
  CEFR_A2: "059fbd92-7da7-445a-bd02-714e08a3462f", // metaattr003val032
  CEFR_B1: "14aed41b-06ad-4583-8443-f36be0db4659", // metaattr003val031
  CEFR_B2: "d7435a74-7cc4-4634-bfc7-cabdea1ac910", // metaattr003val030
  CEFR_C1: "da15bb3b-885e-4d89-928c-8ad77202c63a", // metaattr003val029
  CEFR_C2: "0b3a3988-2a7b-4c18-9ae2-4d1a981e3afb", // metaattr003val028
  CEFR_ACADEMIC: "be9dc5a8-61ca-4928-b1fd-c5f752cc1a61", // metaattr003val026
  CEFR_LITERARY: "a20bbe11-909f-425a-a136-3a5b7c1e8b7d", // metaattr003val025
  CEFR_NATIVE: "0e51f9c3-1201-426f-b467-86f633f6d9d5", // metaattr003val027
  CEFR_SPECIALIZED: "b246889c-f583-4508-b83c-22a2ccba6fa9", // metaattr003val024

  // Frequency Tier values  
  FREQ_TOP100: "27c6b66e-9354-47db-a04c-b1aad4802d0f", // metaattr007val039
  FREQ_TOP500: "08a86dc8-6c50-4756-8efa-10b92e820fd6", // metaattr007val038
  FREQ_TOP1000: "638a0f85-0b8c-45c8-991f-1753b428d99c", // metaattr007val037
  FREQ_TOP2500: "ada4f33e-f6e9-4bbf-9acf-32461b7c8ecd", // metaattr007val040
  FREQ_TOP5000: "93172a5d-9632-49b6-985f-6d2448899dda", // metaattr007val036
  FREQ_TOP10000: "13537137-5aac-4127-b11d-0314485411ef", // metaattr007val041

  // Gender Usage values (for restrictions)
  GENDER_MALE_ONLY: "609ef2d8-bc82-4373-b874-c5ea0dc7c290", // metaattr008val038
  GENDER_FEMALE_ONLY: "a4660a80-8dd5-4e23-ad1e-ce99d660d399", // metaattr008val039

  // Gradable values
  GRADABLE_ANALYTICAL: "3cb54488-f1c1-4e08-91d9-36eea90cf97f", // metaattr009val042
  GRADABLE_FULL: "007255c1-dc39-4001-8e67-337ac260cb00", // metaattr009val041
  GRADABLE_NON: "39cc5dbd-c413-4e7d-b3fe-3dcd87be2569", // metaattr009val044

  // Number values
  NUMBER_SINGOLARE: "8e65cc9f-5465-4b19-bbb2-99d46defa92a", // singolare
  NUMBER_PLURALE: "201fbe66-92a2-4319-b41a-d9a6ca73ea9a", // plurale

  // Number Restriction values
  NUMBER_RESTRICTION_SOLO_SINGOLARE: "2792e966-b266-4d2d-9385-485ad967e056", // metaattr013val055
  NUMBER_RESTRICTION_SOLO_PLURALE: "0a9d7ba7-3726-4b3d-a482-9e99bf5c055b", // metaattr013val056

  // Noun Gender values
  NOUN_GENDER_MASCULINE: "7ab4b4eb-0436-4034-987f-8ee500368e54", // noun_gender masculine
  NOUN_GENDER_FEMININE: "d392439c-b55d-45b5-834e-1e46affefec4", // noun_gender feminine
  NOUN_GENDER_COMMON: "916d9f96-915a-471a-b9d7-3ece13cea4d0", // noun_gender common-gender

  // Register values
  REGISTER_NEUTRAL: "7dad1523-ce5b-4be5-a9ee-2bd0e011e917", // metaattr018val070
  REGISTER_FORMAL: "11277d26-24fc-4c63-ac26-ed8634651c88", // metaattr018val069
  REGISTER_CASUAL: "8fa94dbe-0b14-499e-8f99-52519844cc58", // metaattr018val072
}

// Helper functions for UUID-based lookups
export const isAttribute = (tagObject, attributeUuid) => {
  return tagObject.attribute_id === attributeUuid
}

export const isValue = (tagObject, valueUuid) => {
  return tagObject.value_id === valueUuid
}

export const hasAttributeValue = (tagObject, attributeUuid, valueUuid) => {
  return tagObject.attribute_id === attributeUuid && tagObject.value_id === valueUuid
}

// Display mappings for common tags
export const TAG_DISPLAYS = {
  // CEFR Levels
  [VALUES.CEFR_A1]: { display: '📚 A1', class: 'bg-orange-500 text-white', essential: true },
  [VALUES.CEFR_A2]: { display: '📚 A2', class: 'bg-orange-500 text-white', essential: true },
  [VALUES.CEFR_B1]: { display: '📚 B1', class: 'bg-orange-500 text-white', essential: true },
  [VALUES.CEFR_B2]: { display: '📚 B2', class: 'bg-orange-500 text-white', essential: true },
  [VALUES.CEFR_C1]: { display: '📚 C1', class: 'bg-orange-500 text-white', essential: true },
  [VALUES.CEFR_C2]: { display: '📚 C2', class: 'bg-orange-500 text-white', essential: true },
  [VALUES.CEFR_NATIVE]: { display: '🗣️ NAT', class: 'bg-green-500 text-white', essential: true },
  [VALUES.CEFR_ACADEMIC]: { display: '🎓 ACAD', class: 'bg-green-500 text-white', essential: true },
  [VALUES.CEFR_LITERARY]: { display: '📜 LIT', class: 'bg-green-500 text-white', essential: true },
  [VALUES.CEFR_SPECIALIZED]: { display: '⚙️ SPEC', class: 'bg-green-500 text-white', essential: true },

  // Frequency
  [VALUES.FREQ_TOP100]: { display: '⭐ 100', class: 'bg-yellow-500 text-white', essential: true },
  [VALUES.FREQ_TOP500]: { display: '⭐ 500', class: 'bg-yellow-500 text-white', essential: true },
  [VALUES.FREQ_TOP1000]: { display: '⭐ 1K', class: 'bg-yellow-500 text-white', essential: true },
  [VALUES.FREQ_TOP2500]: { display: '⭐ 2.5K', class: 'bg-yellow-500 text-white', essential: true },
  [VALUES.FREQ_TOP5000]: { display: '⭐ 5K', class: 'bg-yellow-500 text-white', essential: true },
  [VALUES.FREQ_TOP10000]: { display: '⭐ 10K', class: 'bg-yellow-500 text-white', essential: true },

  // Auxiliary verbs (detailed tags)
  [VALUES.AUXILIARY_AVERE]: { display: '🤝 avere', class: 'bg-gray-200 text-gray-700', essential: false },
  [VALUES.AUXILIARY_ESSERE]: { display: '🫱 essere', class: 'bg-gray-200 text-gray-700', essential: false },

  // Gradable (detailed tags)
  [VALUES.GRADABLE_ANALYTICAL]: { display: '📊 Analytical', class: 'bg-purple-200 text-purple-700', essential: false },
  [VALUES.GRADABLE_FULL]: { display: '📈 Full', class: 'bg-purple-200 text-purple-700', essential: false },
  [VALUES.GRADABLE_NON]: { display: '🚫 Non-gradable', class: 'bg-purple-200 text-purple-700', essential: false },

  // Number (essential tags)
  [VALUES.NUMBER_SINGOLARE]: { display: 'sing.', class: 'bg-gray-200 text-gray-700', essential: true },
  [VALUES.NUMBER_PLURALE]: { display: 'pl.', class: 'bg-gray-200 text-gray-700', essential: true },

  // Number Restrictions (essential tags)
  [VALUES.NUMBER_RESTRICTION_SOLO_SINGOLARE]: { 
    display: '👤 Singular Only', 
    class: 'bg-amber-500 text-white', 
    essential: true,
    description: 'Word only exists in singular form'
  },
  [VALUES.NUMBER_RESTRICTION_SOLO_PLURALE]: { 
    display: '👥 Plural Only', 
    class: 'bg-amber-600 text-white', 
    essential: true,
    description: 'Word only exists in plural form (pluralia tantum) or meaning requires plural subjects'
  },

  // Noun Gender (essential tags)
  [VALUES.NOUN_GENDER_MASCULINE]: { display: '♂', class: 'bg-blue-500 text-white', essential: true },
  [VALUES.NOUN_GENDER_FEMININE]: { display: '♀', class: 'bg-pink-500 text-white', essential: true },
  [VALUES.NOUN_GENDER_COMMON]: { display: '⚥', class: 'bg-purple-500 text-white', essential: true },
}