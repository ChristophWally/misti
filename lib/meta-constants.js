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
  FREQUENCY_TIER: "3c909352-4588-4951-8076-6f23081d99be", // metaattr007
  GENDER_USAGE: "7b1a301d-4f4c-405f-b6d7-01af1efb8574", // metaattr008
  WORD_GENDER: "08a37467-3de5-42b2-a22a-29127c58c942", // metaattr011
  NUMBER_RESTRICTION: "6aa64a52-2009-4d0c-ad77-a6c57b69ebce", // metaattr013
  PLURAL_ONLY: "d55410e7-8b1f-4f1f-8517-02645c0c2996", // metaattr015
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
  FREQ_TOP5000: "93172a5d-9632-49b6-985f-6d2448899dda", // metaattr007val036

  // Gender Usage values (for restrictions)
  GENDER_MALE_ONLY: "609ef2d8-bc82-4373-b874-c5ea0dc7c290", // metaattr008val038
  GENDER_FEMALE_ONLY: "a4660a80-8dd5-4e23-ad1e-ce99d660d399", // metaattr008val039

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
  [VALUES.FREQ_TOP5000]: { display: '⭐ 5K', class: 'bg-yellow-500 text-white', essential: true },

  // Auxiliary verbs (detailed tags)
  [VALUES.AUXILIARY_AVERE]: { display: '🤝 avere', class: 'bg-gray-200 text-gray-700', essential: false },
  [VALUES.AUXILIARY_ESSERE]: { display: '🫱 essere', class: 'bg-gray-200 text-gray-700', essential: false },
}