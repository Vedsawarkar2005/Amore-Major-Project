import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { InvoiceEmail } from '@/components/emails/InvoiceEmail';

export async function POST(req: NextRequest) {
  try {
    // Verify internal security secret header
    const incomingSecret = req.headers.get('x-email-secret');
    const expectedSecret =
      process.env.EMAIL_SECRET ||
      process.env.BETTER_AUTH_SECRET ||
      'amore-secret-key-2026';

    if (!incomingSecret || incomingSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: invalid or missing x-email-secret header.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      orderId,
      customerName = 'Valued Client',
      customerEmail,
      totalAmount,
      items = [],
      purchaseDate,
    } = body;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Missing customerEmail in request body.' },
        { status: 400 }
      );
    }

    // Render luxury invoice React Email template to HTML string
    const emailHtml = await render(
      React.createElement(InvoiceEmail, {
        orderId: orderId || 'AM-PENDING',
        customerName,
        customerEmail,
        totalAmount: Number(totalAmount) || 0,
        items,
        purchaseDate:
          purchaseDate ||
          new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
      })
    );

    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn(
        '[Amore Email] RESEND_API_KEY not configured. Invoice HTML successfully generated in simulated dev mode.'
      );
      return NextResponse.json({
        success: true,
        simulated: true,
        message:
          'Invoice generated. Set RESEND_API_KEY in environment to dispatch real emails.',
        orderId,
      });
    }

    const resend = new Resend(resendApiKey);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || 'Amore <orders@yourdomain.com>';

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: 'Your Amore Atelier Receipt',
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error('[Amore Email] Resend delivery error:', emailResponse.error);
      return NextResponse.json(
        {
          success: false,
          error: emailResponse.error.message,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Luxury invoice dispatched successfully via Resend.',
      data: emailResponse.data,
      orderId,
    });
  } catch (err: any) {
    console.error('[Amore Email] Error generating or sending invoice:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing invoice email.' },
      { status: 500 }
    );
  }
}
