'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Créez une action serveur et appelez-la à partir du formulaire.
// Dans votre action serveur, extrayez les données de l’ formDataobjet.
// Validez et préparez les données à insérer dans votre base de données.
// Insérez les données et gérez les erreurs.
// Revalidez le cache et redirigez l'utilisateur vers la page des factures.
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    console.error('Failed to insert invoice:', error);
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
  // Test it out:
  console.log(customerId, amount, status);
}

// Extraction des données de formData.
// Validation des types avec Zod.
// Conversion du montant en cents.
// Passer les variables à votre requête SQL.
// Appel revalidatePathpour vider le cache client et effectuer une nouvelle demande serveur.
// Appel redirectpour rediriger l'utilisateur vers la page de la facture.
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    console.error('Failed to update invoice:', error);
  }


  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
