import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import chromium from '@sparticuz/chromium'
import puppeteerCore from 'puppeteer-core'
import puppeteer from 'puppeteer'

export const runtime = 'nodejs'

export async function GET(
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
      patient: billData?.visit?.patient,
      visit: billData?.visit,
      items: billData?.bill_items,
    }

    // Generate HTML for PDF
    const html = generateInvoiceHTML(bill, patient, visit, items)

    // If download flag present, return as downloadable file
    const { searchParams } = new URL(request.url)
    const shouldDownload = searchParams.get('download') === '1'

    if (shouldDownload) {
      // Render HTML to real PDF using headless Chromium
      let browser
      try {
        const executablePath = await chromium.executablePath()
        browser = await puppeteerCore.launch({
          args: chromium.args,
          executablePath,
          headless: true,
        })
      } catch {
        // Fallback to bundled Chromium if platform doesn't support @sparticuz/chromium
        browser = await puppeteer.launch({ headless: true })
      }
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '12mm', bottom: '16mm', left: '12mm' },
      })
      await browser.close()

      const filename = `Invoice-${bill.bill_number}.pdf`
      return new NextResponse(Buffer.from(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      })
    }

    // Return HTML preview by default
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
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
  bill: { total_amount: number; bill_number: string; subtotal_cents: number; payment_status: string; created_at: string },
  patient: { first_name: string; last_name: string; email?: string; phone?: string; address?: string },
  visit: { visit_date: string },
  items: { description: string; quantity: number; unit_price: number }[]
): string {
  const formatPrice = (amount: number) => `Rs ${(amount?.toFixed(2))} /-`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()
  const itemsTotal = (items || []).reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)

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
        th.desc, td.desc { text-align: left; }
        th.qty, td.qty { text-align: center; width: 90px; }
        th.num, td.num { text-align: right; width: 140px; }
        .total-section {
          margin-top: 20px;
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 10px;
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
            ${patient?.first_name} ${patient?.last_name}
          </div>
          ${patient?.email ? `
          <div class="info-row">
            <span class="info-label">Email:</span>
            ${patient.email}
          </div>
          ` : ''}
          ${patient?.phone ? `
          <div class="info-row">
            <span class="info-label">Phone:</span>
            ${patient?.phone}
          </div>
          ` : ''}
          ${patient?.address ? `
          <div class="info-row">
            <span class="info-label">Address:</span>
            ${patient?.address}
          </div>
          ` : ''}
        </div>

        <div class="invoice-info">
          <div class="section-title">Invoice Details:</div>
          <div class="info-row">
            <span class="info-label">Invoice #:</span>
            ${bill?.bill_number}
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            ${formatDate(bill?.created_at)}
          </div>
          <div class="info-row">
            <span class="info-label">Visit Date:</span>
            ${formatDate(visit?.visit_date)}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="desc">Item</th>
            <th class="qty">Qty</th>
            <th class="num">Unit Price</th>
            <th class="num">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${(items || []).map(item => `
            <tr>
              <td class="desc">${item.description}</td>
              <td class="qty">${item.quantity}</td>
              <td class="num">${formatPrice(item.unit_price)}</td>
              <td class="num">${formatPrice(item.quantity * item.unit_price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-amount">${formatPrice(itemsTotal)}</span>
        </div>
        <div class="">
          <span class="total-label">Consultation & TreatmentFee:</span>
          <span class="total-amount">${formatPrice(Number(bill.total_amount))}</span>
        </div>
          <div class="total-row grand-total">
          <span class="total-label">Total Amount:</span>
          <span class="total-amount">${formatPrice(Number(bill.total_amount)+ Number(itemsTotal))}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}
