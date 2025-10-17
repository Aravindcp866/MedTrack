import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import puppeteer from 'puppeteer'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    const { billId } = await params

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not available' }, { status: 500 })
    }

    // Get bill details
    const { data: billData, error } = await supabaseAdmin
      .from('bills')
      .select(`
        *,
        visit:visits(
          *,
          patient:patients(*)
        ),
        bill_items(*)
      `)
      .eq('id', billId)
      .single()

    if (error || !billData) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const { bill, patient, visit, items } = {
      bill: billData,
      patient: billData.visit.patient,
      visit: billData.visit,
      items: billData.bill_items,
    }

    // Generate HTML for PDF
    const html = generateInvoiceHTML(bill, patient, visit, items)

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
    
    await browser.close()

    // Upload PDF to Supabase Storage
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available. Please check your environment variables.')
    }
    
    const fileName = `invoice-${bill.bill_number}.pdf`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('invoices')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('invoices')
      .getPublicUrl(fileName)

    // Update bill with PDF URL
    await supabaseAdmin
      .from('bills')
      .update({ pdf_url: urlData.publicUrl })
      .eq('id', billId)

    return NextResponse.json({ 
      success: true, 
      pdfUrl: urlData.publicUrl,
      fileName 
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(
  bill: { bill_number: string; subtotal_cents: number; tax_cents: number; total_cents: number; payment_status: string; created_at: string },
  patient: { first_name: string; last_name: string; email?: string; phone?: string; address?: string },
  visit: { visit_date: string },
  items: { treatment_name: string; quantity: number; unit_price_cents: number; total_cents: number }[]
): string {
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString()

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${bill.bill_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 20px;
        }
        .clinic-name {
          font-size: 28px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 10px;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .patient-info, .invoice-info {
          flex: 1;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          color: #4f46e5;
        }
        .info-row {
          margin-bottom: 5px;
        }
        .info-label {
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f8fafc;
          font-weight: bold;
          color: #4f46e5;
        }
        .total-section {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 5px;
        }
        .total-label {
          width: 150px;
          text-align: right;
          padding-right: 10px;
        }
        .total-amount {
          width: 100px;
          text-align: right;
          font-weight: bold;
        }
        .grand-total {
          font-size: 18px;
          font-weight: bold;
          color: #4f46e5;
          border-top: 2px solid #4f46e5;
          padding-top: 10px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="clinic-name">ClinicSync System</div>
        <div>Professional Healthcare Services</div>
      </div>

      <div class="invoice-title">INVOICE</div>

      <div class="invoice-details">
        <div class="patient-info">
          <div class="section-title">Bill To:</div>
          <div class="info-row">
            <span class="info-label">Name:</span>
            ${patient.first_name} ${patient.last_name}
          </div>
          ${patient.email ? `
          <div class="info-row">
            <span class="info-label">Email:</span>
            ${patient.email}
          </div>
          ` : ''}
          ${patient.phone ? `
          <div class="info-row">
            <span class="info-label">Phone:</span>
            ${patient.phone}
          </div>
          ` : ''}
          ${patient.address ? `
          <div class="info-row">
            <span class="info-label">Address:</span>
            ${patient.address}
          </div>
          ` : ''}
        </div>

        <div class="invoice-info">
          <div class="section-title">Invoice Details:</div>
          <div class="info-row">
            <span class="info-label">Invoice #:</span>
            ${bill.bill_number}
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            ${formatDate(bill.created_at)}
          </div>
          <div class="info-row">
            <span class="info-label">Visit Date:</span>
            ${formatDate(visit.visit_date)}
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span style="text-transform: capitalize; color: ${bill.payment_status === 'paid' ? 'green' : 'orange'};">
              ${bill.payment_status}
            </span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Treatment</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.treatment_name}</td>
              <td>${item.quantity}</td>
              <td>${formatPrice(item.unit_price_cents)}</td>
              <td>${formatPrice(item.total_cents)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-amount">${formatPrice(bill.subtotal_cents)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Tax (10%):</span>
          <span class="total-amount">${formatPrice(bill.tax_cents)}</span>
        </div>
        <div class="total-row grand-total">
          <span class="total-label">Total:</span>
          <span class="total-amount">${formatPrice(bill.total_cents)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for choosing our clinic. Please contact us if you have any questions.</p>
        <p>This invoice was generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `
}
