import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    if (adminSession?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*, products(name))")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_info, items, total_amount } = body;

    // 1. Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([{ customer_info, total_amount, status: 'pending' }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create the order items
    const orderItemsToInsert = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time: item.product.discount_price || item.product.price,
      size: item.size || null
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    // 3. Send emails
    if (customer_info?.email) {
      // We don't await this so it doesn't block the response
      sendOrderConfirmationEmail(
        customer_info.email,
        customer_info.name || "Client",
        {
          total_amount,
          customer_phone: customer_info.phone || "Non renseigné",
        },
        items
      ).catch(err => console.error("Failed to send order email asynchronously:", err));
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
