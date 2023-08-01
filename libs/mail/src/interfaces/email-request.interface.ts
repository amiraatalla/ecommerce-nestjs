/**
 * Payload object required to send email via sendgrid.
 */
export interface EmailRequest{
    to: string;
    from: string;
    subject: string;
    text: string;
    html: string;
}