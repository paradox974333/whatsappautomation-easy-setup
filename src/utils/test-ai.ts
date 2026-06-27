import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();

// Ensure key is checked
if (!process.env.CEREBRAS_API_KEY) {
  console.error('\x1b[31mError: CEREBRAS_API_KEY is not defined in the environment.\x1b[0m');
  console.log('Please set it in your .env file or export it before running this test.');
  process.exit(1);
}

// Set up absolute paths so ts-node runs smoothly
import { CerebrasProvider } from '../ai/cerebras.provider';
import { PromptManager } from '../ai/prompt.manager';

const runTest = async () => {
  console.log('\x1b[36mInitializing CerebrasProvider test...\x1b[0m');
  const provider = new CerebrasProvider();
  
  const systemPrompt = PromptManager.getSystemPrompt();
  
  // Test case: Message with clear purchase intent and lead details
  const testMessage = "Hey, my name is David. I run 'David's Fashion Hub'. I need a high-quality website and someone to manage my Instagram reels. Can we book a meeting?";
  
  console.log(`\n\x1b[35m[TEST CASE 1 - Inbound Message]\x1b[0m`);
  console.log(`Message: "${testMessage}"`);
  console.log('\x1b[33mSending request to Cerebras Llama 3.3 70B...\x1b[0m');
  
  try {
    const start = Date.now();
    const result = await provider.processChat(testMessage, [], systemPrompt);
    const duration = Date.now() - start;
    
    console.log(`\x1b[32mCompleted in ${duration}ms\x1b[0m`);
    console.log('\n\x1b[36m[AI GENERATED REPLY]\x1b[0m');
    console.log(result.response);
    
    console.log('\n\x1b[36m[EXTRACTED LEAD DATA]\x1b[0m');
    console.log(`Purchase Intent: ${result.purchaseIntent}`);
    console.log(`Lead Details:`, JSON.stringify(result.leadDetails, null, 2));

    // Validation checks
    if (result.purchaseIntent && result.leadDetails?.name === 'David' && result.leadDetails?.business === "David's Fashion Hub") {
      console.log('\n\x1b[32m✓ SUCCESS: AI reply generated and lead details correctly extracted.\x1b[0m');
    } else {
      console.log('\n\x1b[33m⚠ WARNING: Response generated, but check lead extraction accuracy.\x1b[0m');
    }

  } catch (error: any) {
    console.error('\n\x1b[31m❌ TEST FAILED with error:\x1b[0m', error.message);
  }
};

runTest();
