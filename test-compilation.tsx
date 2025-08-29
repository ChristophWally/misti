// Simple compilation test for TagDisplayComponents
import React from 'react';
import { CoreTagDisplay, ValueTagDisplay, OptionalTagDisplay, AttributeNameDisplay, BatchTagDisplay } from './app/admin/migration-tools/components/TagDisplayComponents';

// Test component that uses all the exported components
export function CompilationTest() {
  return (
    <div>
      <CoreTagDisplay attributeName="metaattr008" value="metaattr008val038" />
      <ValueTagDisplay valueStableId="metaattr008val038" />
      <OptionalTagDisplay tag="metaattr008val038" />
      <AttributeNameDisplay stableId="metaattr008" fallback="Gender" />
      <BatchTagDisplay tags={[
        { attributeName: 'metaattr008', value: 'metaattr008val038', key: '1' }
      ]} />
    </div>
  );
}