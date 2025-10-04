import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local');
}

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify the webhook signature
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const body = await req.text();

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  if (!id) {
    return NextResponse.json({ error: 'No user ID provided' }, { status: 400 });
  }

  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = first_name || last_name ? `${first_name || ''} ${last_name || ''}`.trim() : 'there';

    // Create user in database
    if (email) {
      try {
        await db.user.create({
          data: {
            clerkId: id,
            email: email,
            firstName: first_name || '',
            lastName: last_name || '',
            imageUrl: image_url || '',
          },
        });
        console.log(`User created in database: ${id}`);

        // Send welcome email
        await sendWelcomeEmail(email, name);
        console.log(`Welcome email sent to ${email}`);
      } catch (error) {
        console.error('Error creating user or sending welcome email:', error);
      }
    }
  }

  if (eventType === 'user.updated') {
    const { email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (email) {
      try {
        await db.user.update({
          where: { clerkId: id },
          data: {
            email: email,
            firstName: first_name || '',
            lastName: last_name || '',
            imageUrl: image_url || '',
          },
        });
        console.log(`User updated in database: ${id}`);
      } catch (error) {
        console.error('Error updating user in database:', error);
      }
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await db.user.delete({
        where: { clerkId: id },
      });
      console.log(`User deleted from database: ${id}`);
    } catch (error) {
      console.error('Error deleting user from database:', error);
    }
  }

  return NextResponse.json({ message: 'Webhook processed successfully' });
}

async function sendWelcomeEmail(email: string, name: string) {
  const emailContent = {
    to: email,
    subject: '🚀 Welcome to ToolkitForSEO - Your Free SEO Arsenal Awaits!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ToolkitForSEO</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .header p { color: #d1fae5; margin: 10px 0 0 0; font-size: 16px; }
          .content { padding: 40px 20px; }
          .welcome-text { font-size: 18px; color: #374151; margin-bottom: 30px; line-height: 1.6; }
          .features { background-color: #f0fdf4; border-radius: 12px; padding: 30px; margin: 30px 0; }
          .features h2 { color: #059669; margin: 0 0 20px 0; font-size: 22px; }
          .feature-list { list-style: none; padding: 0; margin: 0; }
          .feature-list li { padding: 8px 0; color: #374151; font-size: 16px; }
          .feature-list li:before { content: "✅ "; margin-right: 8px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
          .footer { background-color: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 14px; }
          .footer a { color: #10b981; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ ToolkitForSEO</h1>
            <p>Your Complete SEO Arsenal - 100% Free Forever</p>
          </div>
          
          <div class="content">
            <div class="welcome-text">
              <p>Hi ${name}! 👋</p>
              <p>Welcome to ToolkitForSEO! You've just joined thousands of marketers, agencies, and businesses who are supercharging their SEO with our professional-grade tools.</p>
              <p><strong>The best part?</strong> Everything is completely free, forever. No hidden costs, no premium tiers, no limitations.</p>
            </div>

            <div class="features">
              <h2>🎯 What You Get Access To:</h2>
              <ul class="feature-list">
                <li><strong>10 Content Tools</strong> - Plagiarism checker, grammar checker, AI content detector, and more</li>
                <li><strong>5 Keyword Tools</strong> - Research, competition analysis, and long-tail suggestions</li>
                <li><strong>5 Backlink Tools</strong> - Comprehensive backlink analysis and link building</li>
                <li><strong>5 SEO Utilities</strong> - Website scoring, speed testing, SSL checking, and more</li>
                <li><strong>AI-Powered Results</strong> - Latest technology for accurate and fast insights</li>
                <li><strong>Enterprise Quality</strong> - Professional-grade tools used by Fortune 500 companies</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://toolkitforseo.com'}/tools" class="cta-button">
                🚀 Start Using Your Tools Now
              </a>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">💡 Pro Tip:</p>
              <p style="margin: 10px 0 0 0; color: #92400e;">Bookmark our tools page and start with the Website SEO Score Checker to get a comprehensive analysis of your site!</p>
            </div>

            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              If you have any questions or need help getting started, just reply to this email. We're here to help you succeed!
            </p>

            <p style="color: #374151; font-size: 16px; margin-top: 30px;">
              Happy optimizing! 🎯<br>
              <strong>The ToolkitForSEO Team</strong>
            </p>
          </div>

          <div class="footer">
            <p>© 2024 ToolkitForSEO. All tools free forever.</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://toolkitforseo.com'}/tools">Access Tools</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://toolkitforseo.com'}">Visit Website</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  // Using a simple email service (you can replace this with your preferred email service)
  // For now, we'll use a console log to simulate sending
  console.log('Sending welcome email:', emailContent);
  
  // If you want to integrate with an actual email service like Resend, SendGrid, etc.:
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'welcome@toolkitforseo.com',
  //     ...emailContent,
  //   }),
  // });
}