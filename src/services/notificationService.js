import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send welcome email
export const sendWelcomeEmail = async (email, name, role) => {
  try {
    const transporter = createTransporter();
    
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
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html
    });
    
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send delivery notification
export const sendDeliveryNotification = async (email, type, data) => {
  try {
    const transporter = createTransporter();
    
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
        return;
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html
    });
    
    console.log(`Delivery notification (${type}) sent to ${email}`);
  } catch (error) {
    console.error('Error sending delivery notification:', error);
  }
};

// Send payment notification
export const sendPaymentNotification = async (email, type, data) => {
  try {
    const transporter = createTransporter();
    
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
        return;
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html
    });
    
    console.log(`Payment notification (${type}) sent to ${email}`);
  } catch (error) {
    console.error('Error sending payment notification:', error);
  }
};