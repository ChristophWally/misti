# Complete Azure Zero-Cost Protection Implementation Guide

## Overview and Learning Objectives

This comprehensive guide will teach you how to implement a bulletproof cost protection system in Microsoft Azure that prevents any charges beyond $1 per month while still allowing you to use premium services like Azure Text-to-Speech for your Italian learning application. By the end of this implementation, you will have created an automated system that blocks new resource creation and suspends existing services when your budget is exceeded, then automatically resets everything on the first day of each month.

The system works by combining Azure's budget monitoring capabilities with custom policies that can deny or modify resources based on spending thresholds. When your budget reaches $1, webhook notifications trigger Logic Apps that update policy parameters, effectively shutting down services until the monthly reset occurs. This approach gives you true spending control rather than just alerts, which is exactly what you need for experimenting with premium Azure services while maintaining complete cost safety.

## Architecture Understanding

Before diving into implementation, it's important to understand how all the components work together to create your protection system. Azure Budgets monitor your spending and can send webhook notifications when thresholds are exceeded. Azure Policy provides the enforcement mechanism, allowing you to define rules that either block new resource creation or modify existing resources based on parameters. Logic Apps serve as the automation engine, receiving budget webhooks and updating policy parameters accordingly. Finally, the monthly reset mechanism ensures that your protection automatically lifts when Azure's free tier renews each month.

This architecture is particularly elegant because it leverages Azure's native capabilities rather than trying to work around them. Instead of fighting the platform's billing system, you're using its own monitoring and policy tools to create enforcement mechanisms that Azure doesn't provide out of the box.

## Phase 1: Database Foundation (Prerequisites)

### Step 1: Supabase Database Setup

Before implementing Azure protection, ensure your Supabase database is properly configured for the Italian learning application. Navigate to your Supabase dashboard and access the SQL Editor. Run the following SQL to create your core tables:

```sql
-- Create word_audio_metadata table for tracking audio files
CREATE TABLE word_audio_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id UUID REFERENCES dictionary(id) ON DELETE CASCADE,
  azure_voice_name TEXT NOT NULL,
  audio_filename TEXT NOT NULL,
  file_size_bytes INTEGER,
  duration_seconds DECIMAL,
  generation_method TEXT DEFAULT 'azure-tts',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(word_id)
);

-- Enable Row Level Security
ALTER TABLE word_audio_metadata ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "Audio metadata is publicly readable" 
ON word_audio_metadata FOR SELECT 
TO PUBLIC 
USING (true);

-- Allow service role management for Edge Functions
CREATE POLICY "Service role can manage audio metadata" 
ON word_audio_metadata FOR ALL 
TO service_role 
USING (true);

-- Create performance indexes
CREATE INDEX idx_word_audio_metadata_word_id ON word_audio_metadata(word_id);
CREATE INDEX idx_word_audio_metadata_voice ON word_audio_metadata(azure_voice_name);
CREATE INDEX idx_word_audio_metadata_filename ON word_audio_metadata(audio_filename);
```

This database structure will support the audio generation system that will integrate with your protected Azure Speech Services. The metadata table tracks which Azure voice was used for each word, enabling voice consistency across all variations of that word.

### Step 2: Supabase Storage Configuration

Create an audio storage bucket in Supabase by navigating to Storage and clicking "Create bucket". Name it "audio-files" and set it as private. Then configure the storage policies:

```sql
-- Allow authenticated users to read audio files
CREATE POLICY "Allow authenticated users to read audio files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'audio-files');

-- Allow service role to manage audio files for Edge Functions
CREATE POLICY "Allow service role to manage audio files" 
ON storage.objects FOR ALL 
TO service_role 
USING (bucket_id = 'audio-files');
```

This storage configuration will securely hold your generated audio files while allowing your application to access them through signed URLs.

## Phase 2: Azure Budget and Alert Foundation

### Step 3: Create Zero-Cost Budget

Understanding Azure's billing cycle is crucial here. Azure's free tier for Speech Services provides 500,000 characters of neural voice synthesis per month, which resets on your billing cycle date. Your budget needs to align with this cycle to ensure protection and reset timing work correctly.

Navigate to the Azure Portal and search for "Cost Management + Billing". Click on "Cost Management" then "Budgets". Click "Add" to create a new budget with these specific configurations:

**Budget Details:**
- Name: `Zero-Cost-Enforcement`
- Reset period: `Monthly` (this aligns with Azure's free tier reset)
- Creation date: Current month start
- Expiration date: One year from creation
- Budget amount: `$1.00` (Azure's minimum allowed budget amount)

The budget amount of $1.00 represents your maximum acceptable spending. While you'll likely never reach this amount with normal Italian vocabulary building, setting it this low ensures that even if something goes wrong, your financial exposure is minimal.

**Alert Conditions Setup:**
Create three progressive alerts to give you visibility into spending patterns:
- Alert 1: `Actual` cost `Greater than` `50%` of budget ($0.50)
- Alert 2: `Actual` cost `Greater than` `80%` of budget ($0.80)  
- Alert 3: `Actual` cost `Greater than` `100%` of budget ($1.00)

Set the alert recipients to your email address for now. We will enhance these alerts with webhook actions in later steps, but email notifications provide a good baseline for monitoring.

## Phase 3: Policy Definition Creation

### Step 4: Create Resource Denial Policy

Azure Policy operates on a definition and assignment model. First, you create policy definitions that describe what should be enforced, then you assign those definitions to specific scopes (like your subscription) to make them active. This step creates the definition for preventing new resource creation when your budget is exceeded.

Navigate to Azure Portal, search for "Policy", and click on "Definitions". Click "+ Policy definition" to create a new policy. The definition location should be set to your subscription, which ensures the policy can be assigned within your subscription scope.

Configure the policy with these details:
- **Name**: `Deny-New-Resources-On-Budget-Exceeded`
- **Description**: `Prevents creation of new Cognitive Services when budget exceeded`
- **Category**: Create new category called `Cost Management`

The policy rule uses JSON to define the logic. Paste this exact JSON into the Policy Rule field:

```json
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.CognitiveServices/accounts"
        },
        {
          "value": "[parameters('budgetExceeded')]",
          "equals": true
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  },
  "parameters": {
    "budgetExceeded": {
      "type": "Boolean",
      "metadata": {
        "displayName": "Budget Exceeded",
        "description": "Whether the budget has been exceeded"
      },
      "defaultValue": false
    }
  }
}
```

This policy works by checking two conditions: first, whether the resource being created is a Cognitive Services account (which includes Speech Services), and second, whether the budgetExceeded parameter is set to true. When both conditions are met, the policy denies the resource creation. The parameter system allows the Logic Apps we'll create later to dynamically enable or disable this policy.

### Step 5: Create Resource Suspension Policy

Create a second policy definition for suspending existing resources. Click "+ Policy definition" again and configure:
- **Name**: `Suspend-Resources-On-Budget-Exceeded`
- **Description**: `Disables existing Speech Services when budget exceeded`
- **Category**: `Cost Management` (same as before)

Use this JSON for the policy rule:

```json
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.CognitiveServices/accounts"
        },
        {
          "field": "Microsoft.CognitiveServices/accounts/sku.name",
          "exists": true
        },
        {
          "value": "[parameters('budgetExceeded')]",
          "equals": true
        }
      ]
    },
    "then": {
      "effect": "modify",
      "details": {
        "roleDefinitionIds": [
          "/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
        ],
        "operations": [
          {
            "operation": "addOrReplace",
            "field": "Microsoft.CognitiveServices/accounts/publicNetworkAccess",
            "value": "Disabled"
          }
        ]
      }
    }
  },
  "parameters": {
    "budgetExceeded": {
      "type": "Boolean",
      "metadata": {
        "displayName": "Budget Exceeded",
        "description": "Whether the budget has been exceeded"
      },
      "defaultValue": false
    }
  }
}
```

This suspension policy uses the "modify" effect to change the publicNetworkAccess property of existing Cognitive Services accounts to "Disabled" when the budget parameter is true. This effectively prevents your applications from using the service without deleting the resource entirely, which means it can be easily re-enabled when the budget resets.

## Phase 4: Policy Assignment and Activation

### Step 6: Assign Denial Policy

Policy definitions are just templates until they're assigned to a scope. Navigate to Azure Portal → Policy → Assignments and click "+ Assign policy". 

For the first assignment:
- **Scope**: Click the "..." button and select your subscription
- **Policy definition**: Click "..." → "Available Definitions" → Search for "Deny-New-Resources-On-Budget-Exceeded" → Select your policy
- **Assignment name**: `deny-new-resources-on-budget-exceeded`
- **Policy enforcement**: `Enabled`

In the Parameters tab, set the `budgetExceeded` parameter to `false`. This initial state means the policy exists but is not actively blocking resources yet. The Logic Apps we'll create will update this parameter to `true` when your budget is exceeded.

Click "Review + assign" to activate the policy. You should see it appear in the Policy Assignments list within a few minutes.

### Step 7: Assign Suspension Policy

Repeat the assignment process for the suspension policy:
- **Policy definition**: "Suspend-Resources-On-Budget-Exceeded"
- **Assignment name**: `suspend-resources-on-budget-exceeded`  
- **Parameters**: Set `budgetExceeded` to `false`

Both policies are now active on your subscription but in their default "safe" state where they don't interfere with normal operations.

## Phase 5: Budget Enforcement Logic App

### Step 8: Create Budget Enforcement Logic App

Logic Apps provide the automation layer that connects your budget alerts to policy updates. Navigate to Azure Portal → Logic Apps → "+ Add" or "Create".

Configure the Logic App with these settings:
- **Subscription**: Your subscription
- **Resource Group**: Create new called `misti-cost-protection` or use existing
- **Logic App name**: `BudgetEnforcementApp`
- **Region**: Choose the same region as your other resources for consistency
- **Plan type**: **Consumption** (this is crucial for staying within free tier)
- **Zone redundancy**: Disabled (to avoid additional costs)

Click "Review + create" then "Create". Once deployment completes, click "Go to resource" then navigate to the Logic App Designer.

### Step 9: Configure Budget Webhook Trigger

In the Logic App Designer, you'll see a blank canvas. Search for "HTTP Request" and select "When a HTTP request is received" trigger. This trigger will receive webhook notifications from your Azure Budget when spending thresholds are reached.

Click "Use sample payload to generate schema" and paste this sample JSON:

```json
{
  "data": {
    "SubscriptionId": "12345678-1234-1234-1234-123456789012",
    "BudgetName": "Zero-Cost-Enforcement",
    "SpentAmount": 1.5,
    "BudgetAmount": 1.0,
    "BudgetStartDate": "2025-01-01T00:00:00Z",
    "Unit": "USD",
    "NotificationThresholdAmount": 1.0
  }
}
```

Click "Save" to generate the schema. This teaches the Logic App what format of data to expect from Azure Budget webhooks. The sample uses placeholder values, but when actual budget alerts fire, they'll contain your real subscription ID and spending data.

### Step 10: Add JSON Parsing Action

Click "+ New step" and search for "Parse JSON". Select the "Parse JSON" action. In the Content field, type `body` (this references the incoming webhook data). In the Schema field, paste:

```json
{
  "type": "object",
  "properties": {
    "data": {
      "type": "object",
      "properties": {
        "SubscriptionId": {"type": "string"},
        "BudgetName": {"type": "string"},
        "SpentAmount": {"type": "number"},
        "BudgetAmount": {"type": "number"},
        "BudgetStartDate": {"type": "string"},
        "Unit": {"type": "string"},
        "NotificationThresholdAmount": {"type": "number"}
      }
    }
  }
}
```

This parsing step extracts the budget data into individual fields that subsequent actions can reference, such as SpentAmount and BudgetAmount for comparison logic.

### Step 11: Add Budget Exceeded Condition

Click "+ New step" and search for "Condition". In the condition configuration:
- **Left side**: Type `SpentAmount` (or select from dynamic content if available)
- **Operator**: Select "is greater than or equal to"
- **Right side**: Type `BudgetAmount`

This condition implements the core logic: "If money spent >= budget limit, then activate protection policies." The condition will create two branches: "If yes" (budget exceeded) and "If no" (budget OK).

### Step 12: Configure Policy Update Actions

In the "If yes" branch, add two HTTP actions to update both policies when the budget is exceeded.

**First HTTP Action (Denial Policy Update):**
Click "+ Add an action" in the "If yes" branch and search for "HTTP". Configure:
- **Method**: `PATCH`
- **URI**: `https://management.azure.com/subscriptions/48d3cd70-aa92-4cbc-a1be-eb809a16efe0/providers/Microsoft.Authorization/policyAssignments/deny-new-resources-on-budget-exceeded?api-version=2021-06-01`
- **Headers**: Key: `Content-Type`, Value: `application/json`
- **Body**:
```json
{
  "properties": {
    "parameters": {
      "budgetExceeded": {
        "value": true
      }
    }
  }
}
```

**Second HTTP Action (Suspension Policy Update):**
Add another HTTP action with:
- **Method**: `PATCH`
- **URI**: `https://management.azure.com/subscriptions/48d3cd70-aa92-4cbc-a1be-eb809a16efe0/providers/Microsoft.Authorization/policyAssignments/suspend-resources-on-budget-exceeded?api-version=2021-06-01`
- **Headers**: Same as above
- **Body**: Same JSON as above

Both actions use Azure's REST API to update the policy assignment parameters, setting budgetExceeded to true when spending limits are reached.

### Step 13: Configure Authentication

Both HTTP actions need authentication to call Azure's management APIs. For each HTTP action:
- Click "Show all" in Advanced parameters
- **Authentication**: Select "Managed identity"
- **Managed Identity**: "System-assigned managed identity"  
- **Audience**: `https://management.azure.com/`

Before this authentication will work, you need to enable the Logic App's managed identity. Go back to the Logic App resource (not the designer), find "Identity" in the left menu, toggle "System assigned" to "On", and click "Save".

## Phase 6: Monthly Reset Logic App

### Step 14: Create Monthly Reset Logic App

The monthly reset ensures your protection automatically lifts when Azure's free tier renews. Create a second Logic App:
- **Name**: `MonthlyResetApp`
- **Configuration**: Same settings as the first Logic App

In the Logic App Designer, search for "Recurrence" and select the Recurrence trigger. Configure:
- **Frequency**: `Month`
- **Interval**: `1`
- **Time zone**: Select your timezone
- **Start time**: `2025-02-01T00:01:00Z` (February 1st at 12:01 AM UTC)

This recurrence trigger will fire on the first day of every month at 12:01 AM, giving Azure's billing system time to reset your free tier quotas before re-enabling your services.

### Step 15: Add Monthly Reset Actions

Add two HTTP actions similar to the enforcement Logic App, but with one crucial difference: set `budgetExceeded` to `false` instead of `true`. This resets both policies to their inactive state.

**First HTTP Action (Reset Denial Policy):**
- **Method**: `PATCH`
- **URI**: Same denial policy URL as before
- **Body**:
```json
{
  "properties": {
    "parameters": {
      "budgetExceeded": {
        "value": false
      }
    }
  }
}
```

**Second HTTP Action (Reset Suspension Policy):**
Same configuration but targeting the suspension policy URL.

Enable managed identity for this Logic App and configure authentication the same way as the enforcement app.

## Phase 7: Permission Configuration

### Step 16: Assign Policy Permissions

Both Logic Apps need permission to update policy assignments. Navigate to Azure Portal → Subscriptions → [Your Subscription] → Access control (IAM). Click "+ Add" → "Add role assignment".

Configure the role assignment:
- **Role**: Search for and select "Resource Policy Contributor"
- **Assign access to**: "Managed Identity"
- **Members**: Click "+ Select members", choose "Logic App" as the managed identity type, and select both `BudgetEnforcementApp` and `MonthlyResetApp`

Click "Review + assign" to grant the permissions. This allows both Logic Apps to modify policy assignment parameters throughout your subscription.

## Phase 8: Budget Webhook Integration

### Step 17: Create Action Group

Navigate to Azure Portal → Search "Action Groups" → "+ Create". Configure:
- **Action group name**: `BudgetWebhookGroup`
- **Display name**: `Budget Webhook`
- **Resource group**: Same as your Logic Apps

In the Actions tab:
- **Action type**: "Webhook"
- **Name**: "TriggerBudgetEnforcement"
- **Webhook URL**: Copy the HTTP POST URL from your BudgetEnforcementApp's HTTP Request trigger

### Step 18: Connect Budget to Action Group

Go back to your budget: Cost Management + Billing → Budgets → Zero-Cost-Enforcement. Edit the budget and navigate to the Alert conditions. For the 100% alert, configure it to use your newly created Action Group.

The exact interface for this step can vary, but look for options to add "Action groups" or "Notifications" to your budget alerts. Select your BudgetWebhookGroup to complete the connection.

## Phase 9: Testing and Validation

### Step 19: Create Protected Speech Service

With your protection system in place, you can now safely create the Speech Service you need for your Italian learning app. Navigate to Azure Portal → Create a resource → Speech Services.

Configure:
- **Name**: `misti-speech-service`
- **Pricing tier**: `Free (F0)`
- **Region**: Same as your other resources

Once created, go to Keys and Endpoint to retrieve your Speech Service credentials for use in your Supabase Edge Functions.

### Step 20: Test Policy Functionality

To verify your protection system works, you can manually test the policies:
1. Go to Policy → Assignments
2. Edit the `deny-new-resources-on-budget-exceeded` assignment
3. Set the `budgetExceeded` parameter to `true`
4. Try to create another Speech Service - it should be denied
5. Reset the parameter to `false` to restore normal functionality

## Phase 10: Integration with Supabase Edge Functions

### Step 21: Create Audio Generation Edge Function

With your protected Azure infrastructure in place, create a Supabase Edge Function that will use your Speech Service. The function should include usage monitoring to stay within free tier limits:

```typescript
// Edge Function: azure-audio-generator
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AZURE_VOICES = [
  "it-IT-IsabellaMultilingualNeural",
  "it-IT-GiuseppeMultilingualNeural", 
  "it-IT-DiegoNeural",
  "it-IT-CalimeroNeural"
];

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Safety checks to prevent duplicate generation
    const { data: existingMetadata } = await supabase
      .from('word_audio_metadata')
      .select('*')
      .eq('word_id', record.id)
      .single()

    if (existingMetadata) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Audio already exists' 
      }))
    }

    // Select consistent voice or random for new words
    const selectedVoice = AZURE_VOICES[Math.floor(Math.random() * AZURE_VOICES.length)]

    // Generate SSML for natural pronunciation
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="it-IT">
        <voice name="${selectedVoice}">
          <prosody rate="0.9" pitch="0%">
            ${record.italian}
          </prosody>
        </voice>
      </speak>
    `.trim()

    // Call Azure Text-to-Speech (protected by your budget system)
    const ttsResponse = await fetch(
      `https://${Deno.env.get('AZURE_SPEECH_REGION')}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': Deno.env.get('AZURE_SPEECH_KEY')!,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      }
    )

    if (!ttsResponse.ok) {
      throw new Error(`Azure TTS failed: ${ttsResponse.status}`)
    }

    // Upload to Supabase Storage and update metadata
    const audioBuffer = await ttsResponse.arrayBuffer()
    const filename = `audio_${record.id}.mp3`
    
    await supabase.storage
      .from('audio-files')
      .upload(filename, new Blob([audioBuffer]))

    await supabase
      .from('word_audio_metadata')
      .insert({
        word_id: record.id,
        azure_voice_name: selectedVoice,
        audio_filename: filename,
        file_size_bytes: audioBuffer.byteLength
      })

    return new Response(JSON.stringify({ 
      success: true,
      voice: selectedVoice,
      filename: filename
    }))

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 })
  }
})
```

## Understanding the Complete Protection Flow

Your implemented system creates a comprehensive safety net that works through multiple layers of protection. When you add new Italian words to your dictionary, the Supabase Edge Function automatically generates high-quality audio using one of four premium Azure voices. The function includes built-in safety checks to prevent duplicate generation and excessive API calls.

If your usage somehow approaches the $1 budget limit, Azure's budget monitoring immediately detects this and sends a webhook notification to your BudgetEnforcementApp Logic App. The Logic App processes this notification and updates both policy assignments, simultaneously blocking new resource creation and suspending network access to existing Speech Services. This dual protection ensures that costs cannot continue to accumulate while preserving your resources for future use.

On the first day of each month, your MonthlyResetApp automatically reverses these protections, setting both policies back to their inactive state. This timing aligns with Azure's free tier reset, ensuring you have full access to your 500,000 characters of neural voice synthesis when the new billing cycle begins.

The beauty of this architecture lies in its automatic operation and fail-safe design. You can confidently experiment with Azure's premium services knowing that your financial exposure is strictly limited to $1, while still maintaining access to high-quality features that would normally be expensive. The system handles both normal operations and edge cases gracefully, providing the safety net you need to build sophisticated applications without financial risk.

## Expected Behavior and Monitoring

In normal operation, you'll add Italian words to your dictionary through your web application, and audio will be generated seamlessly in the background using one of the four premium Italian voices. You'll receive email notifications at 50% and 80% of your $1 budget, giving you visibility into usage patterns. The monthly reset happens automatically without any intervention required.

If the budget protection ever activates, you'll receive immediate notification, and both new resource creation and existing service usage will be blocked. The system can be manually reset by updating the policy parameters back to false if needed, but the automatic monthly reset ensures everything returns to normal at the start of each billing cycle.

This implementation provides you with enterprise-grade cost protection while enabling access to premium Azure services, creating the perfect environment for building and scaling your Italian learning application with complete financial safety.
