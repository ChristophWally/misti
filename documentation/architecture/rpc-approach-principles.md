# RPC Approach Principles for Misti

**Document Version**: 1.0  
**Last Updated**: September 12, 2025  
**Status**: Active Architecture Guidelines

---

## Executive Summary

Misti uses Remote Procedure Call (RPC) functions in Supabase PostgreSQL for data processing, following a **database-first** approach that prioritizes performance, cost efficiency, and code maintainability. This document establishes the core principles for why and how we implement RPC-based data processing throughout the application.

---

## Core Architecture Decision

### The Decision
**Use Supabase RPC functions for data processing rather than client-side JavaScript processing.**

### Why This Approach
1. **Cost Efficiency**: Direct client→Supabase calls avoid Vercel compute costs
2. **Performance**: Database-optimized queries vs JavaScript array operations  
3. **Maintainability**: Centralized data logic vs distributed client processing
4. **Scalability**: PostgreSQL optimization handles growing datasets efficiently

---

## Cost Efficiency Principles

### Primary Cost Principle: Never Proxy Through Vercel APIs

**✅ Correct Approach:**
```javascript
// Direct client → Supabase RPC call
const { data } = await supabase.rpc('app_get_dictionary_listing', params)
```

**❌ Avoid This Pattern:**
```javascript
// Client → Vercel API → Supabase (unnecessary Vercel compute costs)
const response = await fetch('/api/dictionary', { method: 'POST', body: params })
```

### Cost Impact Analysis
- **Direct Supabase RPC**: $0 additional Vercel costs, minimal Supabase database usage
- **Vercel API Proxy**: Vercel compute time + bandwidth costs + Supabase costs
- **Client Processing**: High bandwidth, poor mobile performance, complex codebase

---

## Performance Benefits

### Database Processing vs Client-Side Processing

| Aspect | RPC Approach | Client-Side Processing |
|--------|--------------|----------------------|
| **Code Complexity** | ~600 lines total | 2000+ lines |
| **Network Requests** | Single structured call | Multiple table queries |
| **Processing Location** | Optimized PostgreSQL | JavaScript loops |
| **Mobile Performance** | Minimal battery impact | Heavy processing drain |
| **Caching** | Database query cache | Manual client implementation |

### Real-World Example
Our current `processRpcTagsForDisplay` function (400 lines) would expand to 2000+ lines if we moved away from RPC, requiring:
- Manual JOIN logic for 6+ database tables
- N+1 query prevention patterns
- Complex data normalization
- Error handling for each query
- Custom caching implementation

---

## Development Guidelines

### When to Use RPC Functions

**✅ Use RPC For:**
- Complex data relationships (JOINs across multiple tables)
- Data aggregation and transformation
- Business logic that benefits from database optimization
- Filtering and sorting large datasets
- Consistent data processing across multiple components

**❌ Keep Client-Side:**
- UI presentation logic (colors, symbols, positioning)
- Component-specific display formatting
- User interaction handling (clicks, tooltips, animations)
- Responsive layout calculations
- Real-time UI state management

### RPC Function Design Principles

1. **Conditional Loading**: Use optional parameters to fetch only needed data
   ```sql
   include_forms boolean DEFAULT false
   include_translations boolean DEFAULT true
   ```

2. **Single Source of Truth**: One RPC should handle related data together
   - Better: Extend existing RPC with optional parameters
   - Avoid: Multiple separate RPCs for related data

3. **Structured Responses**: Return consistently formatted JSONB data
   ```json
   {
     "word_core_tags": [...],
     "translations": [...],
     "forms": [...] // only when requested
   }
   ```

4. **Backward Compatibility**: New parameters should be optional with sensible defaults

---

## Code Maintainability Benefits

### SQL Stability vs JavaScript Complexity

**SQL RPC Functions:**
- Database schema provides type safety
- Query planner handles optimization automatically
- Consistent execution environment
- Clear data contracts through function signatures

**Client-Side JavaScript:**
- Complex state management
- Multiple data transformation steps
- Array manipulation and filtering logic
- Cross-component consistency challenges

### Example: Tag Processing Complexity
Without RPC, client code must handle:
```javascript
// Manual data fetching
const words = await fetchWords()
const wordTags = await fetchWordTags(words.map(w => w.id))
const translations = await fetchTranslations(words.map(w => w.id))
const forms = await fetchForms(words.map(w => w.id))

// Manual JOIN logic
const enrichedWords = words.map(word => ({
  ...word,
  tags: wordTags.filter(tag => tag.word_id === word.id),
  translations: translations.filter(t => t.word_id === word.id),
  forms: forms.filter(f => f.word_id === word.id)
}))

// Complex processing logic
const processedWords = enrichedWords.map(processWordForDisplay)
```

With RPC:
```javascript
// Single optimized call
const { data } = await supabase.rpc('app_get_dictionary_listing', params)
// Data arrives pre-structured and ready for display processing
```

---

## Long-term Scalability Considerations

### Database Growth
- **RPC Approach**: PostgreSQL query planner optimizes as data grows
- **Client Processing**: Performance degrades with larger datasets

### Team Development
- **Clear Boundaries**: Database handles data, client handles presentation
- **Knowledge Distribution**: SQL expertise for data, JavaScript for UI
- **Testing Isolation**: Database logic tested independently from UI

### Mobile Performance
- **Network Efficiency**: Single requests with structured responses
- **Battery Life**: Minimal client-side processing
- **Data Usage**: Optimized payload sizes

---

## Implementation Patterns

### Extending Existing RPCs
```sql
-- Add optional parameters to existing functions
CREATE OR REPLACE FUNCTION existing_rpc(
  -- existing parameters
  existing_param text DEFAULT NULL,
  -- new optional parameters  
  include_additional_data boolean DEFAULT false
)
```

### Error Handling
```javascript
const { data, error } = await supabase.rpc('function_name', params)
if (error) {
  console.error('RPC Error:', error)
  // Handle gracefully with fallback UI
}
```

### Caching Strategy
```javascript
// Browser cache for stable RPC responses
const cacheKey = `rpc_${functionName}_${JSON.stringify(params)}`
const cached = sessionStorage.getItem(cacheKey)
if (cached) return JSON.parse(cached)
```

---

## Conclusion

The RPC approach provides Misti with a solid foundation for efficient, maintainable, and cost-effective data processing. By keeping heavy data operations in the database and presentation logic in the client, we achieve optimal performance while maintaining clean code architecture.

**Key Takeaway**: Use RPCs for what databases do best (data processing) and keep clients focused on what they do best (user experience).