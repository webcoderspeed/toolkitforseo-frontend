'use server';

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

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

interface CreditPurchaseEmailData {
	email: string;
	userName: string;
	credits: number;
	amount: number;
	currency: string;
	transactionId: string;
	packageType: string;
	purchaseDate: Date;
}

export async function sendCreditPurchaseConfirmationEmail(data: CreditPurchaseEmailData) {
	try {
		const {
			email,
			userName,
			credits,
			amount,
			currency,
			transactionId,
			packageType,
			purchaseDate
		} = data;

		const formattedDate = purchaseDate.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		const formattedAmount = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency.toUpperCase()
		}).format(amount);

		await resend.emails.send({
			from: 'ToolkitForSEO <billing@toolkitforseo.com>',
			to: email,
			subject: `Credit Purchase Confirmation - ${credits} Credits Added`,
			html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">ToolkitForSEO</h1>
            <p style="color: #d1fae5; margin: 5px 0 0 0; font-size: 16px;">Professional SEO Tools</p>
          </div>

          <!-- Invoice Header -->
          <div style="background-color: white; padding: 30px; border-bottom: 3px solid #10b981;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div>
                <h2 style="color: #1f2937; margin: 0; font-size: 24px;">Payment Confirmation</h2>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Thank you for your purchase!</p>
              </div>
              <div style="text-align: right;">
                <div style="background-color: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block;">
                  ✓ PAID
                </div>
              </div>
            </div>
            
            <!-- Customer & Invoice Details -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px;">
              <div>
                <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Bill To:</h3>
                <p style="color: #1f2937; margin: 0; font-weight: 500;">${userName}</p>
                <p style="color: #6b7280; margin: 5px 0 0 0;">${email}</p>
              </div>
              <div style="text-align: right;">
                <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Invoice Details:</h3>
                <p style="color: #6b7280; margin: 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
                <p style="color: #6b7280; margin: 5px 0 0 0;"><strong>Date:</strong> ${formattedDate}</p>
              </div>
            </div>
          </div>

          <!-- Invoice Items -->
          <div style="background-color: white; padding: 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 15px 30px; text-align: left; color: #374151; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Description</th>
                  <th style="padding: 15px 30px; text-align: center; color: #374151; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Quantity</th>
                  <th style="padding: 15px 30px; text-align: right; color: #374151; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 20px 30px; border-bottom: 1px solid #e5e7eb;">
                    <div>
                      <p style="margin: 0; font-weight: 600; color: #1f2937; font-size: 16px;">${packageType} Credit Package</p>
                      <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">AI-powered SEO tool credits</p>
                    </div>
                  </td>
                  <td style="padding: 20px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-weight: 600;">${credits} Credits</span>
                  </td>
                  <td style="padding: 20px 30px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #1f2937; font-size: 16px;">
                    ${formattedAmount}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Total -->
            <div style="padding: 20px 30px; background-color: #f9fafb;">
              <div style="text-align: right;">
                <div style="margin-bottom: 10px;">
                  <span style="color: #6b7280;">Subtotal: </span>
                  <span style="color: #1f2937; font-weight: 600;">${formattedAmount}</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="color: #6b7280;">Tax: </span>
                  <span style="color: #1f2937; font-weight: 600;">$0.00</span>
                </div>
                <div style="border-top: 2px solid #10b981; padding-top: 10px; margin-top: 10px;">
                  <span style="color: #1f2937; font-size: 18px; font-weight: bold;">Total: ${formattedAmount}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Credits Added Notification -->
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); margin: 20px; padding: 25px; border-radius: 12px; text-align: center;">
            <div style="background-color: #3b82f6; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; font-size: 24px;">
              ⚡
            </div>
            <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 20px;">Credits Added Successfully!</h3>
            <p style="color: #1e40af; margin: 0; font-size: 16px; font-weight: 600;">${credits} credits have been added to your account</p>
            <p style="color: #3730a3; margin: 10px 0 0 0; font-size: 14px;">Start using your credits now to power your SEO tools!</p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; padding: 30px 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
              Access Your Dashboard
            </a>
          </div>

          <!-- Support & Footer -->
          <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #374151; margin: 0 0 15px 0;">Need Help?</h4>
            <p style="color: #6b7280; margin: 0 0 15px 0;">Our support team is here to help you get the most out of your credits.</p>
            <a href="mailto:support@toolkitforseo.com" style="color: #10b981; text-decoration: none; font-weight: 600;">support@toolkitforseo.com</a>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} ToolkitForSEO. All rights reserved.
              </p>
              <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `,
		});

		console.log(`Credit purchase confirmation email sent to: ${email}`);
	} catch (error) {
		console.error('Error sending credit purchase confirmation email:', error);
		throw new Error('Failed to send credit purchase confirmation email');
	}
}
