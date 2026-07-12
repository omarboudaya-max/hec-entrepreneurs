import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendOrderConfirmationEmail = async (
  clientEmail: string, 
  clientName: string, 
  orderData: any, 
  items: any[]
) => {
  const adminEmail = process.env.GMAIL_USER;
  
  const itemsListHtml = items.map(item => `
    <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 0; display: flex; justify-content: space-between; align-items: center;">
      <div style="flex-grow: 1;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 500; color: #ffffff;">${item.product.name}</h4>
        ${item.size ? `<span style="display: inline-block; margin-top: 5px; padding: 2px 8px; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px; color: #a1a1aa;">Taille: ${item.size}</span>` : ''}
        <div style="margin-top: 5px; font-size: 14px; color: #a1a1aa;">Quantité: ${item.quantity}</div>
      </div>
      <div style="font-weight: bold; color: #d4af37; font-size: 16px;">
        ${((item.product.discount_price || item.product.price) * item.quantity).toFixed(2)} TND
      </div>
    </div>
  `).join('');

  const commonStyles = `
    body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #111111; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .header { text-align: center; padding: 40px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .header h1 { margin: 0; color: #d4af37; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; font-family: 'Georgia', serif; }
    .content { padding: 40px 30px; }
    .title { color: #ffffff; font-size: 22px; margin-top: 0; font-weight: 400; }
    .text { color: #a1a1aa; line-height: 1.6; font-size: 15px; }
    .items-container { margin: 30px 0; border-top: 1px solid rgba(255,255,255,0.1); }
    .total-container { display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; }
    .total-label { color: #a1a1aa; font-size: 16px; }
    .total-price { color: #d4af37; font-size: 24px; font-weight: bold; }
    .info-box { background-color: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.2); padding: 20px; border-radius: 12px; margin-top: 30px; }
    .info-box h4 { margin: 0 0 10px 0; color: #d4af37; font-size: 16px; }
    .info-box p { margin: 0; color: #d4d4d8; font-size: 14px; line-height: 1.5; }
    .footer { text-align: center; padding: 30px; color: #52525b; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05); }
  `;

  // Email for the client
  const clientMailOptions = {
    from: `"IHEC Store" <${adminEmail}>`,
    to: clientEmail,
    subject: "Confirmation de votre commande - IHEC Store",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${commonStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IHEC Store</h1>
          </div>
          <div class="content">
            <h2 class="title">Merci pour votre commande, ${clientName} !</h2>
            <p class="text">Votre commande a été enregistrée avec succès. Voici le récapitulatif de vos achats :</p>
            
            <div class="items-container">
              ${itemsListHtml}
            </div>
            
            <div class="total-container">
              <div class="total-label">Total de la commande</div>
              <div class="total-price">${orderData.total_amount.toFixed(2)} TND</div>
            </div>

            <div class="info-box">
              <h4>📦 Informations de Livraison</h4>
              <p>La remise se fera en main propre à l'IHEC Carthage. Notre équipe vous contactera très prochainement au <strong>${orderData.customer_phone}</strong> pour fixer un rendez-vous.</p>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} HEC Entrepreneurs. Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  // Email for the admin
  const adminMailOptions = {
    from: `"IHEC Store" <${adminEmail}>`,
    to: adminEmail,
    subject: `Nouvelle commande de ${clientName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${commonStyles}</style>
      </head>
      <body>
        <div class="container" style="border: 1px solid rgba(212, 175, 55, 0.3);">
          <div class="header" style="background-color: rgba(212, 175, 55, 0.05);">
            <h1 style="color: #ffffff;">Nouvelle Commande !</h1>
          </div>
          <div class="content">
            <h2 class="title">Détails du client</h2>
            <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <p style="margin: 0 0 10px 0; color: #d4d4d8;"><strong>Nom :</strong> ${clientName}</p>
              <p style="margin: 0 0 10px 0; color: #d4d4d8;"><strong>Email :</strong> <a href="mailto:${clientEmail}" style="color: #d4af37; text-decoration: none;">${clientEmail}</a></p>
              <p style="margin: 0; color: #d4d4d8;"><strong>Téléphone :</strong> ${orderData.customer_phone}</p>
            </div>
            
            <h2 class="title">Articles commandés</h2>
            <div class="items-container" style="margin-top: 15px;">
              ${itemsListHtml}
            </div>
            
            <div class="total-container">
              <div class="total-label">Total à encaisser</div>
              <div class="total-price">${orderData.total_amount.toFixed(2)} TND</div>
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
              <p style="color: #a1a1aa; font-size: 14px;">Connectez-vous à votre espace administrateur pour gérer cette commande.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(clientMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error sending emails:", error);
    return { success: false, error };
  }
};
