import { IncomingWebhook } from '@slack/webhook';
import Company from '@/models/Company';

/**
 * Send Slack notification for brand mention
 * Implementation from PRD Step 5.1 - Slack Alerts
 */
export async function sendSlackNotification(
  brandId: string,
  mention: {
    keywordMatched: string;
    title?: string;
    content: string;
    subreddit: string;
    author: string;
    url: string;
    sentiment: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
    };
  }
) {
  try {
    // Get brand configuration
    const brand = await Company.findById(brandId);
    if (!brand || !brand.slackConfig?.enabled || !brand.slackConfig?.webhookUrl) {
      console.log('⚠️ Slack notifications not configured for brand:', brandId);
      return;
    }

    // Initialize Slack webhook
    const webhook = new IncomingWebhook(brand.slackConfig.webhookUrl);
    
    // Create sentiment emoji and color
    const sentimentConfig = {
      positive: { emoji: '😊', color: '#36a64f', text: 'Positive' },
      negative: { emoji: '😞', color: '#ff0000', text: 'Negative' },
      neutral: { emoji: '😐', color: '#808080', text: 'Neutral' }
    };
    
    const sentiment = sentimentConfig[mention.sentiment.label];
    
    // Format the content for better readability
    const formattedContent = mention.content
      .replace(/<strong>/g, '*')
      .replace(/<\/strong>/g, '*')
      .substring(0, 300);

    const message = {
      text: `New ${mention.sentiment.label} mention of ${brand.name}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🏷️ Brand: ${brand.name}` 
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🔑 Keyword Matched: ${mention.keywordMatched}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📊 Sentiment: ${sentiment.emoji} ${sentiment.text}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📱 Subreddit: r/${mention.subreddit}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `👤 Author: u/${mention.author}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📝 Content:\n${formattedContent}${mention.content.length > 300 ? '...' : ''}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🔗 View on Reddit:\n${mention.url}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `⏰ Mention detected at ${new Date().toLocaleString()}`
            }
          ]
        },
        {
          type: 'divider'
        }
      ]
    }

    // Send message to Slack with timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Slack notification timeout after 30 seconds')), 30000);
    });
    
    await Promise.race([
      webhook.send(message),
      timeoutPromise
    ]);
    
    console.log(`✅ Slack notification sent for ${brand.name} mention`);
    
  } catch (error) {
    console.error('❌ Error sending Slack notification:', error);
    throw error;
  }
}
