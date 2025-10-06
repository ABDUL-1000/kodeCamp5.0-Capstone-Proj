import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send welcome email
export const sendWelcomeEmail = async (email, name, role) => {
  try {
    const subject = `Welcome to SwiftRider ${role.charAt(0).toUpperCase() + role.slice(1)}!`;
    
    const features = role === 'customer' 
      ? '<li><strong>Request delivery services</strong> - Get your packages delivered quickly</li><li><strong>Track your deliveries</strong> in real-time</li><li><strong>Make secure payments</strong> with multiple options</li>' 
      : '<li><strong>Accept delivery requests</strong> and earn money</li><li><strong>Complete deliveries</strong> around your schedule</li><li><strong>Manage your availability</strong> easily</li>';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SwiftRider</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  max-width: 600px; 
                  margin: 0 auto; 
                  padding: 20px;
                  background-color: #f9f9f9;
              }
              .container {
                  background: white;
                  padding: 0;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  overflow: hidden;
              }
              .header { 
                  background: linear-gradient(135deg, #4F46E5, #7E69AB);
                  padding: 30px;
                  text-align: center; 
                  color: white;
              }
              .content {
                  padding: 30px;
              }
              .features {
                  background: #f8fafc;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 25px 0;
                  border-left: 4px solid #4F46E5;
              }
              .button {
                  background: #4F46E5;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  display: inline-block;
              }
              @media only screen and (max-width: 600px) {
                  .content {
                      padding: 20px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1 style="margin: 0; font-size: 28px;">🚀 Welcome to SwiftRider!</h1>
              </div>
              
              <div class="content">
                  <p style="font-size: 16px; color: #374151;">Hello <strong>${name}</strong>,</p>
                  
                  <p style="font-size: 16px; color: #374151;">Thank you for registering as a <strong style="color: #4F46E5;">${role}</strong> on our platform. We're excited to have you on board!</p>
                  
                  <div class="features">
                      <p style="margin-top: 0; color: #4F46E5; font-weight: bold;">As a ${role}, you can now:</p>
                      <ul style="color: #374151; line-height: 1.8;">
                          ${features}
                      </ul>
                  </div>
                  
                  <p style="font-size: 16px; color: #374151;">Get started now and experience seamless delivery services!</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="#" class="button">Get Started</a>
                  </div>
                  
                  <p style="font-size: 14px; color: #6B7280; text-align: center;">
                      If you have any questions, contact our support team at support@swiftrider.com
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;

    const msg = {
      to: email,
      from: 'abdullatifgiwa2019@gmail.com', // Use your verified email
      subject: subject,
      html: html,
    };

    await sgMail.send(msg);
    
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
    return false;
  }
};

// Send delivery notification
export const sendDeliveryNotification = async (email, type, data) => {
  try {
    let subject, html;

    switch (type) {
      case 'delivery_accepted':
        subject = '🎉 Your Delivery Has Been Accepted!';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                  .container { background: white; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                  .header { background: linear-gradient(135deg, #10B981, #059669); padding: 25px; text-align: center; color: white; }
                  .content { padding: 30px; }
                  .details { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }
                  .button { background: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2 style="margin: 0;">📦 Delivery Accepted</h2>
                  </div>
                  <div class="content">
                      <p style="font-size: 16px; color: #374151;">Hello <strong>${data.customerName}</strong>,</p>
                      <p style="font-size: 16px; color: #374151;">Great news! Your delivery request <strong style="color: #059669;">#${data.deliveryId}</strong> has been accepted and is on its way!</p>
                      <div class="details">
                          <h3 style="color: #059669; margin-top: 0;">🚴 Rider Details</h3>
                          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                              <div><strong>Name:</strong><br><span style="color: #374151;">${data.riderName}</span></div>
                              <div><strong>Phone:</strong><br><span style="color: #374151;">${data.riderPhone}</span></div>
                          </div>
                      </div>
                      <p style="font-size: 16px; color: #374151;">You can track your delivery in real-time from your dashboard.</p>
                      <div style="text-align: center; margin: 25px 0;">
                          <a href="#" class="button">Track Delivery</a>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `;
        break;
        
      case 'delivery_picked_up':
        subject = '📦 Your Package Has Been Picked Up!';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                  .container { background: white; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                  .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 25px; text-align: center; color: white; }
                  .content { padding: 30px; text-align: center; }
                  .icon { background: #3B82F6; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin: 20px 0; }
                  .button { background: #3B82F6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2 style="margin: 0;">🚚 Package Picked Up</h2>
                  </div>
                  <div class="content">
                      <div class="icon">✓</div>
                      <p style="font-size: 16px; color: #374151;">
                          Your package for delivery <strong style="color: #1D4ED8;">#${data.deliveryId}</strong> has been picked up and is on its way!
                      </p>
                      <p style="font-size: 16px; color: #374151;">
                          Estimated delivery time: <strong>30-45 minutes</strong>
                      </p>
                      <div style="margin: 25px 0;">
                          <a href="#" class="button">View Live Tracking</a>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `;
        break;
        
      case 'delivery_completed':
        subject = '✅ Delivery Completed Successfully!';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                  .container { background: white; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                  .header { background: linear-gradient(135deg, #10B981, #047857); padding: 25px; text-align: center; color: white; }
                  .content { padding: 30px; text-align: center; }
                  .icon { background: #10B981; color: white; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 36px; margin: 20px 0; }
                  .button { background: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 10px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2 style="margin: 0;">🎊 Delivery Completed</h2>
                  </div>
                  <div class="content">
                      <div class="icon">✓</div>
                      <p style="font-size: 18px; color: #374151;">Hello <strong>${data.customerName}</strong>,</p>
                      <p style="font-size: 16px; color: #374151;">
                          Your delivery <strong style="color: #047857;">#${data.deliveryId}</strong> has been successfully completed!
                      </p>
                      <p style="font-size: 16px; color: #374151;">
                          Thank you for choosing SwiftRider!
                      </p>
                      <div style="margin: 30px 0;">
                          <a href="#" class="button">Rate Delivery</a>
                          <a href="#" style="background: #4F46E5;" class="button">New Delivery</a>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `;
        break;
        
      case 'delivery_cancelled':
        subject = '❌ Delivery Cancelled';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                  .container { background: white; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                  .header { background: linear-gradient(135deg, #EF4444, #DC2626); padding: 25px; text-align: center; color: white; }
                  .content { padding: 30px; }
                  .alert { background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #EF4444; margin: 20px 0; }
                  .button { background: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2 style="margin: 0;">⚠️ Delivery Cancelled</h2>
                  </div>
                  <div class="content">
                      <p style="font-size: 16px; color: #374151;">Hello <strong>${data.customerName}</strong>,</p>
                      <p style="font-size: 16px; color: #374151;">
                          Your delivery <strong style="color: #DC2626;">#${data.deliveryId}</strong> has been cancelled.
                      </p>
                      <div class="alert">
                          <p style="margin: 0; color: #DC2626;">
                              If this was unexpected or you need assistance, please contact our support team immediately.
                          </p>
                      </div>
                      <div style="text-align: center; margin: 25px 0;">
                          <a href="#" class="button">Contact Support</a>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `;
        break;
        
      default:
        return false;
    }

    const msg = {
      to: email,
      from: 'abdullatifgiwa2019@gmail.com', // Use your verified email
      subject: subject,
      html: html,
    };

    await sgMail.send(msg);
    
    console.log(`✅ Delivery notification (${type}) sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending delivery notification:', error.message);
    return false;
  }
};

// Send payment notification
export const sendPaymentNotification = async (email, type, data) => {
  try {
    let subject, html;

    switch (type) {
      case 'payment_success':
        subject = '✅ Payment Successful!';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                  .container { background: white; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                  .header { background: linear-gradient(135deg, #10B981, #059669); padding: 25px; text-align: center; color: white; }
                  .content { padding: 30px; text-align: center; }
                  .icon { background: #10B981; color: white; width: 70px; height: 70px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin: 20px 0; }
                  .reference { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2 style="margin: 0;">💰 Payment Confirmed</h2>
                  </div>
                  <div class="content">
                      <div class="icon">✓</div>
                      <p style="font-size: 16px; color: #374151;">Hello <strong>${data.customerName}</strong>,</p>
                      <p style="font-size: 16px; color: #374151;">
                          Your payment of <strong style="color: #059669; font-size: 18px;">₦${data.amount}</strong> for delivery <strong>#${data.deliveryId}</strong> was successful!
                      </p>
                      <div class="reference">
                          <p style="margin: 0; color: #374151;">
                              <strong>Transaction Reference:</strong><br>
                              <code style="background: #d1fae5; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${data.transactionReference}</code>
                          </p>
                      </div>
                      <p style="font-size: 16px; color: #374151;">
                          Thank you for your payment! Your delivery is being processed.
                      </p>
                  </div>
              </div>
          </body>
          </html>
        `;
        break;
        
      case 'payment_failed':
        subject = '❌ Payment Failed';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                  .container { background: white; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                  .header { background: linear-gradient(135deg, #EF4444, #DC2626); padding: 25px; text-align: center; color: white; }
                  .content { padding: 30px; }
                  .alert { background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0; }
                  .button { background: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2 style="margin: 0;">💳 Payment Failed</h2>
                  </div>
                  <div class="content">
                      <p style="font-size: 16px; color: #374151;">Hello <strong>${data.customerName}</strong>,</p>
                      <p style="font-size: 16px; color: #374151;">
                          Your payment of <strong style="color: #DC2626;">₦${data.amount}</strong> for delivery <strong>#${data.deliveryId}</strong> failed.
                      </p>
                      <div class="alert">
                          <p style="margin: 0; color: #DC2626;">
                              Please try again or contact your bank if the issue persists.
                          </p>
                      </div>
                      <div style="text-align: center; margin: 25px 0;">
                          <a href="#" class="button">Retry Payment</a>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `;
        break;
        
      default:
        return false;
    }

    const msg = {
      to: email,
      from: 'abdullatifgiwa2019@gmail.com', // Use your verified email
      subject: subject,
      html: html,
    };

    await sgMail.send(msg);
    
    console.log(`✅ Payment notification (${type}) sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending payment notification:', error.message);
    return false;
  }
};

// Test SendGrid connection
export const testSendGrid = async (testEmail) => {
  try {
    const msg = {
      to: testEmail,
      from: 'abdullatifgiwa2019@gmail.com', // Use your verified email
      subject: 'SwiftRider Test Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
                .success { color: #10B981; font-size: 48px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success">✅</div>
                <h2>SwiftRider Email Test Successful!</h2>
                <p>This is a test email from SwiftRider API to verify SendGrid is working correctly!</p>
                <p>If you receive this, your email service is properly configured. 🎉</p>
            </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    
    console.log(`✅ Test email sent to ${testEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error.message);
    return false;
  }
};