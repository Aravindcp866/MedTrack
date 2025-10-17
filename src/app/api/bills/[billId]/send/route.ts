import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import sgMail from '@sendgrid/mail'
import twilio from 'twilio'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    const { billId } = await params

    // Get bill details with patient info
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not available' },
        { status: 500 }
      )
    }
    
    const { data: billData, error } = await supabaseAdmin
      .from('bills')
      .select(`
        *,
        visit:visits(
          *,
          patient:patients(*)
        )
      `)
      .eq('id', billId)
      .single()

    if (error || !billData) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const { bill, patient } = {
      bill: billData,
      patient: billData.visit.patient,
    }

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

    // Try WhatsApp first if phone number exists
    if (patient.phone && twilioClient) {
      try {
        const message = `🏥 Clinic Invoice\n\n` +
          `Invoice #: ${bill.bill_number}\n` +
          `Patient: ${patient.first_name} ${patient.last_name}\n` +
          `Amount: ${formatPrice(bill.total_cents)}\n` +
          `Status: ${bill.payment_status}\n\n` +
          `Please contact us for payment details.`

        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: patient.phone
        })

        // Record notification
        await supabaseAdmin
          .from('notifications')
          .insert({
            bill_id: billId,
            notification_type: 'whatsapp',
            recipient: patient.phone,
            status: 'sent',
            sent_at: new Date().toISOString()
          })

        return NextResponse.json({ 
          success: true, 
          method: 'whatsapp',
          message: 'WhatsApp notification sent successfully' 
        })

      } catch (whatsappError) {
        console.error('WhatsApp send failed:', whatsappError)
        
        // Record failed notification
        await supabaseAdmin
          .from('notifications')
          .insert({
            bill_id: billId,
            notification_type: 'whatsapp',
            recipient: patient.phone,
            status: 'failed',
            error_message: whatsappError instanceof Error ? whatsappError.message : 'Unknown error'
          })
      }
    }

    // Fallback to email if WhatsApp failed or no phone
    if (patient.email && process.env.SENDGRID_API_KEY) {
      try {
        const emailContent = {
          to: patient.email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@clinic.com',
          subject: `Invoice ${bill.bill_number} - ${patient.first_name} ${patient.last_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">Clinic Invoice</h2>
              <p>Dear ${patient.first_name} ${patient.last_name},</p>
              <p>Please find your invoice details below:</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Invoice Information</h3>
                <p><strong>Invoice Number:</strong> ${bill.bill_number}</p>
                <p><strong>Amount:</strong> ${formatPrice(bill.total_cents)}</p>
                <p><strong>Status:</strong> ${bill.payment_status}</p>
                <p><strong>Date:</strong> ${new Date(bill.created_at).toLocaleDateString()}</p>
              </div>

              ${bill.pdf_url ? `
                <p>You can download your invoice PDF <a href="${bill.pdf_url}" style="color: #4f46e5;">here</a>.</p>
              ` : ''}

              <p>Please contact us if you have any questions about this invoice.</p>
              
              <p>Best regards,<br>ClinicSync Team</p>
            </div>
          `
        }

        await sgMail.send(emailContent)

        // Record notification
        await supabaseAdmin
          .from('notifications')
          .insert({
            bill_id: billId,
            notification_type: 'email',
            recipient: patient.email,
            status: 'sent',
            sent_at: new Date().toISOString()
          })

        return NextResponse.json({ 
          success: true, 
          method: 'email',
          message: 'Email notification sent successfully' 
        })

      } catch (emailError) {
        console.error('Email send failed:', emailError)
        
        // Record failed notification
        await supabaseAdmin
          .from('notifications')
          .insert({
            bill_id: billId,
            notification_type: 'email',
            recipient: patient.email,
            status: 'failed',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
          })

        return NextResponse.json(
          { error: 'Failed to send email notification' },
          { status: 500 }
        )
      }
    }

    // No contact method available
    await supabaseAdmin
      .from('notifications')
      .insert({
        bill_id: billId,
        notification_type: 'none',
        recipient: 'no_contact',
        status: 'failed',
        error_message: 'No phone or email available'
      })

    return NextResponse.json(
      { error: 'No contact method available for patient' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Notification send error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
