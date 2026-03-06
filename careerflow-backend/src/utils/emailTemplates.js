const generateEmailHtml = (name, title, company, targetDate, type) => {
  let mainMessage = '';
  
  if (type === 'apply') {
    mainMessage = `Don't forget to submit your application for the <strong>${title}</strong> position at <strong>${company}</strong> by <strong>${targetDate}</strong>.`;
  } else if (type === 'interview') {
    mainMessage = `This is a reminder for your upcoming interview for the <strong>${title}</strong> position at <strong>${company}</strong> on <strong>${targetDate}</strong>. Good luck!`;
  } else if (type === 'follow-up') {
    mainMessage = `It is time to follow up on your application for the <strong>${title}</strong> role at <strong>${company}</strong>.`;
  }

  // Email clients require inline CSS for styling
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        
        <div style="background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">CareerFlow</h1>
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Hi ${name},</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            ${mainMessage}
          </p>
          
          <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
            <a href="https://career-flow-six.vercel.app" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              View My Agenda
            </a>
          </div>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">Keep the momentum going!</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} CareerFlow</p>
        </div>

      </div>
    </div>
  `;
};

module.exports = {
  generateEmailHtml
};