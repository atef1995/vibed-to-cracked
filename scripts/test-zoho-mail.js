/**
 * Test script for Zoho Mail SMTP configuration
 * Run this to verify your Zoho Mail setup before using the app
 */

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testZohoMailConnection() {
  console.log('🧪 Testing Zoho Mail SMTP Configuration...\n');

  // Display configuration (without passwords)
  console.log('📋 Configuration:');
  console.log(`   Host: ${process.env.SMTP_HOST || 'smtppro.zoho.com'}`);
  console.log(`   Port: ${process.env.SMTP_PORT || '587'}`);
  console.log(`   Secure: ${process.env.SMTP_SECURE || 'false'}`);
  console.log(`   User: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`   Password: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}`);
  console.log(`   From: ${process.env.SMTP_FROM || 'NOT SET'}\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Missing required environment variables:');
    if (!process.env.SMTP_USER) console.error('   - SMTP_USER');
    if (!process.env.SMTP_PASS) console.error('   - SMTP_PASS');
    console.error('\nPlease check your .env.local file and Zoho Mail setup.');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtppro.zoho.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Test connection
    console.log('🔗 Testing SMTP connection...');
    await transporter.verify();
    console.log(' SMTP connection successful!\n');

    // Ask if user wants to send test email
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('📧 Would you like to send a test email? (y/N): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.question('📫 Enter recipient email address: ', async (recipient) => {
          try {
            console.log(`\n📤 Sending test email to ${recipient}...`);
            
            const info = await transporter.sendMail({
              from: process.env.SMTP_FROM || `Test <${process.env.SMTP_USER}>`,
              to: recipient,
              subject: '🧪 Zoho Mail Test - Vibed to Cracked',
              html: `
                <h2>🎉 Zoho Mail Test Successful!</h2>
                <p>This is a test email from your "Vibed to Cracked" application.</p>
                <p><strong>Configuration Details:</strong></p>
                <ul>
                  <li>Service: Zoho Mail SMTP</li>
                  <li>Host: ${process.env.SMTP_HOST || 'smtppro.zoho.com'}</li>
                  <li>Port: ${process.env.SMTP_PORT || '587'}</li>
                  <li>Timestamp: ${new Date().toISOString()}</li>
                </ul>
                <p> Your email system is working correctly!</p>
                <hr>
                <small>Sent from Vibed to Cracked test script</small>
              `
            });

            console.log(' Test email sent successfully!');
            console.log(`   Message ID: ${info.messageId}`);
            console.log(`   Response: ${info.response || 'N/A'}\n`);
            console.log('🎉 Zoho Mail configuration is working perfectly!');
            
          } catch (error) {
            console.error('❌ Failed to send test email:');
            console.error(`   Error: ${error.message}\n`);
            
            if (error.code === 'EAUTH') {
              console.error('💡 Authentication failed. Please check:');
              console.error('   - Your Zoho Mail app password is correct');
              console.error('   - Two-factor authentication is enabled');
              console.error('   - Email address is correct');
            }
          }
          rl.close();
        });
      } else {
        console.log(' Connection test completed successfully!');
        console.log('🎉 Your Zoho Mail SMTP is configured correctly.');
        rl.close();
      }
    });

  } catch (error) {
    console.error('❌ SMTP connection failed:');
    console.error(`   Error: ${error.message}\n`);

    console.error('🔧 Troubleshooting suggestions:');
    
    if (error.code === 'EAUTH') {
      console.error('   ► Authentication issue:');
      console.error('     - Use app password, not account password');
      console.error('     - Enable two-factor authentication in Zoho');
      console.error('     - Generate new app password if needed');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   ► Connection issue:');
      console.error('     - Check internet connection');
      console.error('     - Verify firewall settings');
      console.error('     - Try different SMTP port (465 with secure: true)');
    } else {
      console.error('   ► General troubleshooting:');
      console.error('     - Verify SMTP settings in .env.local');
      console.error('     - Check Zoho Mail service status');
      console.error('     - Review Zoho Mail documentation');
    }

    console.error('\n📚 For detailed setup instructions, see: ZOHO_MAIL_SETUP.md');
    process.exit(1);
  }
}

// Check if script is run directly
if (require.main === module) {
  testZohoMailConnection().catch(console.error);
}

module.exports = { testZohoMailConnection };