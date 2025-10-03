import { Resend } from 'resend';

const resend = new Resend('re_MtBAu2oT_7Wq3HD5VKGJXM2viPGGUkob4');

// List of authorized test emails (add teammates here)
const AUTHORIZED_EMAILS = [
  'abdullatifgiwa2019@gmail.com',
  'rider1@example.com',
  'rider2@example.com',
  'rider3@example.com',
  'customer1@example.com',
  'customer2@example.com',
  'customer3@example.com',
];

// Check if email can receive emails
const canSendToEmail = (email) => {
  // For now, only allow your own email until domain is verified
  return email === 'abdullatifgiwa2019@gmail.com';
};

// Send welcome email
export const sendWelcomeEmail = async (email, name, role) => {
  try {
    if (!canSendToEmail(email)) {
      console.log(`📧 Mock: Welcome email would be sent to ${email}`);
      console.log(`💡 To send to ${email}, verify a domain in Resend or add them as a teammate`);
      return true; // Return true to continue registration flow
    }

    const subject = `Welcome to SwiftRider ${role.charAt(0).toUpperCase() + role.slice(1)}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to SwiftRider!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering as a ${role} on our platform. We're excited to have you on board!</p>
        <p>As a ${role}, you can now:</p>
        <ul>
          ${role === 'customer' 
            ? '<li>Request delivery services</li><li>Track your deliveries in real-time</li><li>Make secure payments</li>' 
            : '<li>Accept delivery requests</li><li>Earn money by completing deliveries</li><li>Manage your availability</li>'
          }
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br>
        <p>Best regards,<br>The SwiftRider Team</p>
      </div>
    `;
    
    const { data, error } = await resend.emails.send({
      from: 'SwiftRider <onboarding@resend.dev>',
      to: email,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }

    console.log(`✅ Welcome email sent to ${email}`, data);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send delivery notification
export const sendDeliveryNotification = async (email, type, data) => {
  try {
    if (!canSendToEmail(email)) {
      console.log(`📧 Mock: Delivery notification (${type}) would be sent to ${email}`);
      console.log(`💡 To send to ${email}, verify a domain in Resend or add them as a teammate`);
      return true;
    }

    let subject, html;
    
    switch (type) {
      case 'delivery_accepted':
        subject = 'Your Delivery Has Been Accepted';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Delivery Accepted</h2>
            <p>Hello ${data.customerName},</p>
            <p>Great news! Your delivery request #${data.deliveryId} has been accepted by ${data.riderName}.</p>
            <p>Rider details:</p>
            <ul>
              <li>Name: ${data.riderName}</li>
              <li>Phone: ${data.riderPhone}</li>
            </ul>
            <p>You can track your delivery in real-time from your dashboard.</p>
            <br>
            <p>Best regards,<br>The SwiftRider Team</p>
          </div>
        `;
        break;
        
      case 'delivery_picked_up':
        subject = 'Your Package Has Been Picked Up';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Package Picked Up</h2>
            <p>Hello ${data.customerName},</p>
            <p>Your package for delivery #${data.deliveryId} has been picked up by the rider and is on its way to the destination.</p>
            <p>You can track the delivery in real-time from your dashboard.</p>
            <br>
            <p>Best regards,<br>The SwiftRider Team</p>
          </div>
        `;
        break;
        
      case 'delivery_completed':
        subject = 'Your Delivery Has Been Completed';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Delivery Completed</h2>
            <p>Hello ${data.customerName},</p>
            <p>Your delivery #${data.deliveryId} has been successfully completed.</p>
            <p>Thank you for using SwiftRider for your delivery needs!</p>
            <br>
            <p>Best regards,<br>The SwiftRider Team</p>
          </div>
        `;
        break;
        
      case 'delivery_cancelled':
        subject = 'Your Delivery Has Been Cancelled';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Delivery Cancelled</h2>
            <p>Hello ${data.customerName},</p>
            <p>Your delivery #${data.deliveryId} has been cancelled.</p>
            <p>If this was unexpected or you need assistance, please contact our support team.</p>
            <br>
            <p>Best regards,<br>The SwiftRider Team</p>
          </div>
        `;
        break;
        
      default:
        return false;
    }
    
    const { data: result, error } = await resend.emails.send({
      from: 'SwiftRider <onboarding@resend.dev>',
      to: email,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending delivery notification:', error);
      return false;
    }

    console.log(`✅ Delivery notification (${type}) sent to ${email}`, result);
    return true;
  } catch (error) {
    console.error('Error sending delivery notification:', error);
    return false;
  }
};

// Send payment notification
export const sendPaymentNotification = async (email, type, data) => {
  try {
    if (!canSendToEmail(email)) {
      console.log(`📧 Mock: Payment notification (${type}) would be sent to ${email}`);
      console.log(`💡 To send to ${email}, verify a domain in Resend or add them as a teammate`);
      return true;
    }

    let subject, html;
    
    switch (type) {
      case 'payment_success':
        subject = 'Payment Successful';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Payment Confirmed</h2>
            <p>Hello ${data.customerName},</p>
            <p>Your payment of ₦${data.amount} for delivery #${data.deliveryId} was successful.</p>
            <p>Transaction reference: ${data.transactionReference}</p>
            <p>Thank you for your payment!</p>
            <br>
            <p>Best regards,<br>The SwiftRider Team</p>
          </div>
        `;
        break;
        
      case 'payment_failed':
        subject = 'Payment Failed';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #DC2626;">Payment Failed</h2>
            <p>Hello ${data.customerName},</p>
            <p>Your payment of ₦${data.amount} for delivery #${data.deliveryId} failed.</p>
            <p>Please try again or contact your bank if the issue persists.</p>
            <br>
            <p>Best regards,<br>The SwiftRider Team</p>
          </div>
        `;
        break;
        
      default:
        return false;
    }
    
    const { data: result, error } = await resend.emails.send({
      from: 'SwiftRider <onboarding@resend.dev>',
      to: email,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending payment notification:', error);
      return false;
    }

    console.log(`✅ Payment notification (${type}) sent to ${email}`, result);
    return true;
  } catch (error) {
    console.error('Error sending payment notification:', error);
    return false;
  }
};

// Test email to specific address
export const testEmailTo = async (testEmail) => {
  try {
    if (!canSendToEmail(testEmail)) {
      return { 
        success: false, 
        message: `Cannot send to ${testEmail}. Verify domain or add as teammate.`,
        instructions: 'Go to resend.com/domains to verify a domain'
      };
    }

    const { data, error } = await resend.emails.send({
      from: 'SwiftRider <onboarding@resend.dev>',
      to: testEmail,
      subject: 'SwiftRider Test Email',
      html: '<p>This is a test email from your SwiftRider API! If you receive this, your email service is working correctly.</p>',
    });

    if (error) {
      console.error('Test email failed:', error);
      return { success: false, error };
    }

    console.log('✅ Test email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Test email error:', error);
    return { success: false, error };
  }
};