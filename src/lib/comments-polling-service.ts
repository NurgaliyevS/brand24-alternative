import Sentiment from 'sentiment';
import { monitorRedditComments } from './monitor';
import Mention from '@/models/Mention';
import connectDB from './mongodb';

// Initialize sentiment analyzer
const sentiment = new Sentiment();

/**
 * Perform sentiment analysis on text
 */
export function analyzeCommentSentiment(text: string): { score: number; label: 'positive' | 'negative' | 'neutral' } {
  const result = sentiment.analyze(text);
  
  // Determine sentiment label based on score
  let label: 'positive' | 'negative' | 'neutral';
  if (result.score > 0) {
    label = 'positive';
  } else if (result.score < 0) {
    label = 'negative';
  } else {
    label = 'neutral';
  }
  
  return {
    score: result.score,
    label
  };
}

/**
 * Update sentiment for existing comment mentions
 */
export async function updateCommentMentionSentiments() {
  try {
    await connectDB();
    
    // Find comment mentions without sentiment analysis
    const unprocessedMentions = await Mention.find({ 
      isProcessed: false,
      redditType: 'comment'
    }).limit(50);
    
    console.log(`📊 Updating sentiment for ${unprocessedMentions.length} comment mentions`);
    
    for (const mention of unprocessedMentions) {
      const content = mention.content || '';
      const sentimentResult = analyzeCommentSentiment(content);
      
      // Update mention with sentiment analysis
      await Mention.findByIdAndUpdate(mention._id, {
        sentiment: sentimentResult,
        isProcessed: true
      });
      
      console.log(`✅ Updated sentiment for comment mention ${mention._id}: ${sentimentResult.label} (${sentimentResult.score})`);
    }
    
    console.log('✅ Comment sentiment analysis completed');
    
  } catch (error) {
    console.error('❌ Error updating comment sentiment:', error);
    throw error;
  }
}

/**
 * Comments polling service that runs periodically
 * Focuses specifically on monitoring comments for brand mentions
 */
export async function runCommentsPollingService() {
  try {
    console.log('🔄 Starting comments polling service...');
    console.log('⏰ Service started at:', new Date().toISOString());
    
    // Step 1: Monitor Reddit comments and find mentions
    console.log('📋 Step 1: Starting Reddit comments monitoring...');
    const mentionsFound = await monitorRedditComments();
    console.log(`📝 Step 1 completed: Found ${mentionsFound || 0} new comment mentions`);
    
    // Step 2: Perform sentiment analysis on new comment mentions
    console.log('📋 Step 2: Starting sentiment analysis...');
    await updateCommentMentionSentiments();
    console.log('📝 Step 2 completed: Sentiment analysis finished');
    
    console.log('✅ Comments polling service completed successfully');
    console.log('⏰ Service completed at:', new Date().toISOString());
    
  } catch (error) {
    console.error('❌ Error in comments polling service:', error);
    console.error('❌ Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    console.error('⏰ Error occurred at:', new Date().toISOString());
    throw error;
  }
}