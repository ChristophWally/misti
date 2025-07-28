// lib/auxiliary-pattern-service.js
// Simple service for dynamic compound form generation
// Combines auxiliary patterns + building blocks = compound forms

export class AuxiliaryPatternService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.cache = new Map();
  }

  /**
   * Generate compound form - THE ONLY FUNCTION WE NEED
   * @param {string} auxiliaryType - 'avere' or 'essere' 
   * @param {string} tenseTag - 'passato-prossimo', 'presente-progressivo', etc.
   * @param {string} person - 'prima-persona', 'seconda-persona', 'terza-persona'
   * @param {string} plurality - 'singolare', 'plurale'
   * @param {string} buildingBlock - 'finito', 'finendo', etc.
   * @param {string} translation - For the generated form
   * @returns {Object} Complete compound form ready for display
   */
  async generateCompoundForm(auxiliaryType, tenseTag, person, plurality, buildingBlock, translation) {
    // Get auxiliary pattern from our pre-computed table
    const cacheKey = `${tenseTag}-${person}-${plurality}`;
    
    let pattern = this.cache.get(cacheKey);
    if (!pattern) {
      const { data, error } = await this.supabase
        .from('auxiliary_patterns')
        .select('*')
        .eq('compound_tense_tag', tenseTag)
        .eq('person', person)
        .eq('plurality', plurality)
        .single();

      if (error) {
        console.error('Error fetching auxiliary pattern:', error);
        return null;
      }
      
      pattern = data;
      this.cache.set(cacheKey, pattern);
    }

    // Get the right auxiliary based on translation requirement
    const auxiliaryColumn = auxiliaryType === 'avere' ? 'avere_auxiliary' : 'essere_auxiliary';
    const phoneticColumn = auxiliaryType === 'avere' ? 'avere_phonetic' : 'essere_phonetic';
    const ipaColumn = auxiliaryType === 'avere' ? 'avere_ipa' : 'essere_ipa';

    // Combine auxiliary + building block = compound form
    return {
      id: `generated-${tenseTag}-${person}-${plurality}-${auxiliaryType}`,
      form_text: `${pattern[auxiliaryColumn]} ${buildingBlock}`,
      translation: translation,
      phonetic_form: pattern[phoneticColumn] ? `${pattern[phoneticColumn]} ${buildingBlock}` : null,
      ipa: pattern[ipaColumn] ? `${pattern[ipaColumn]} ${buildingBlock}` : null,
      form_type: 'conjugation',
      tags: [tenseTag, person, plurality, 'compound', 'generated'],
      auxiliary_used: pattern[auxiliaryColumn],
      building_block: buildingBlock,
      is_generated: true
    };
  }

  /**
   * Clear cache when needed
   */
  clearCache() {
    this.cache.clear();
  }
}

