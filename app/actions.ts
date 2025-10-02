'use server';

import { Resend } from 'resend';

const GOOGLE_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(GOOGLE_API_KEY);

export async function subscribeUser(email: string) {
	try {
		console.log(`Subscribing user: ${email}`);

		await sendConfirmationEmail(email);

		return { success: true };
	} catch (error) {
		console.error('Error subscribing user:', error);
		throw new Error('Failed to subscribe');
	}
}

async function sendConfirmationEmail(email: string) {
	try {
		await resend.emails.send({
			from: 'ToolkitForSEO <noreply@toolkitforseo.com>',
			to: email,
			subject: 'Welcome to ToolkitForSEO!',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #10b981; margin-bottom: 5px;">ToolkitForSEO</h1>
            <p style="color: #666; font-size: 16px;">Thank you for subscribing!</p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Your subscription is confirmed</h2>
            <p>Thank you for subscribing to ToolkitForSEO. We're building a powerful toolkit for SEO professionals to enhance their productivity and efficiency using AI.</p>
            
            <h3 style="margin-top: 20px;">What to expect:</h3>
            <ul style="padding-left: 20px;">
              <li>AI-powered keyword analysis</li>
              <li>Content optimization tools</li>
              <li>Performance tracking</li>
              <li>Competitor analysis</li>
              <li>And much more!</li>
            </ul>
            
            <p style="margin-top: 20px;">We'll notify you as soon as ToolkitForSEO launches so you can be among the first to try it out.</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ToolkitForSEO. All rights reserved.</p>
          </div>
        </div>
      `,
		});
	} catch (error) {
		console.error('Error sending confirmation email:', error);
		throw new Error('Failed to send confirmation email');
	}
}

export async function sendLaunchEmail(email: string) {
	try {
		await resend.emails.send({
			from: 'ToolkitForSEO <noreply@yourdomain.com>',
			to: email,
			subject: 'ToolkitForSEO is now LIVE!',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #10b981; margin-bottom: 5px;">ToolkitForSEO</h1>
            <p style="color: #666; font-size: 16px;">We've launched!</p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">ToolkitForSEO is now available!</h2>
            <p>We're excited to announce that ToolkitForSEO is now live and ready for you to use!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://toolkitforseo.com" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Start Using ToolkitForSEO</a>
            </div>
            
            <p>As one of our early subscribers, you'll get access to all our premium features for the first 14 days.</p>
            
            <h3 style="margin-top: 20px;">What you can do with ToolkitForSEO:</h3>
            <ul style="padding-left: 20px;">
              <li>Analyze keywords with our AI-powered tools</li>
              <li>Optimize your content for better rankings</li>
              <li>Track your SEO performance in real-time</li>
              <li>Analyze your competitors' strategies</li>
              <li>Generate SEO-optimized content</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ToolkitForSEO. All rights reserved.</p>
            <p>If you no longer wish to receive emails from us, you can <a href="#" style="color: #10b981;">unsubscribe</a>.</p>
          </div>
        </div>
      `,
		});
	} catch (error) {
		console.error('Error sending launch email:', error);
		throw new Error('Failed to send launch email');
	}
}
