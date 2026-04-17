import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, country, service, studentType } = body;

    // Validate
    if (!name || !email || !whatsapp || !service) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Send email notification
    // TODO: Create calendar event
    // TODO: Send WhatsApp confirmation

    console.log("Booking submission:", {
      name,
      email,
      whatsapp,
      country,
      service,
      studentType,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking request received! We will contact you shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Booking form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}