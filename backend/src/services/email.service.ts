import nodemailer from 'nodemailer';
import { config } from '../config/app.config';
import { format } from 'date-fns';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: true,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export const sendMeetingCancellationEmail = async (
  hostEmail: string,
  guestEmail: string,
  meetingDetails: {
    title: string;
    startTime: Date;
    endTime: Date;
    guestName: string;
    hostName: string;
  }
) => {
  const { title, startTime, endTime, guestName, hostName } = meetingDetails;
  
  const formattedDate = format(startTime, 'EEEE, MMMM d, yyyy');
  const formattedTime = `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0a2540;">Meeting Cancelled</h2>
      <p>The following meeting has been cancelled:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Event:</strong> ${title}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Host:</strong> ${hostName}</p>
        <p><strong>Guest:</strong> ${guestName}</p>
      </div>
      <p>This time slot is now available for booking.</p>
    </div>
  `;

  // Send email to host
  await transporter.sendMail({
    from: config.email.from,
    to: hostEmail,
    subject: `Meeting Cancelled: ${title}`,
    html: emailContent,
  });

  // Send email to guest
  await transporter.sendMail({
    from: config.email.from,
    to: guestEmail,
    subject: `Meeting Cancelled: ${title}`,
    html: emailContent,
  });
}; 