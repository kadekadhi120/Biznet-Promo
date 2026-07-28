import { Client } from '@notionhq/client'
import type { FormSubmission } from './types'
import { decrypt } from '@/lib/crypto'

export const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID!

export async function createNotionSubmission(
  submission: Pick<
    FormSubmission,
    | 'full_name'
    | 'nik'
    | 'birth_date'
    | 'phone_number'
    | 'email'
    | 'selected_services'
    | 'ktp_photo_url'
  > & {
    installation_address: string
    sharelock_link: string
    front_house_photo_url: string
    installation_date: string
    promo: string
  }
): Promise<string> {
  const nikPlain = decrypt(submission.nik)

  const response = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      'Nama Lengkap': {
        title: [{ text: { content: submission.full_name } }],
      },
      NIK: {
        rich_text: [{ text: { content: nikPlain } }],
      },
      'Tanggal Lahir': {
        date: { start: submission.birth_date },
      },
      'No. HP': {
        phone_number: submission.phone_number,
      },
      Email: {
        email: submission.email,
      },
      'Layanan Home': {
        multi_select: submission.selected_services.map((s) => ({ name: s })),
      },
      'Alamat Instalasi': {
        rich_text: [{ text: { content: submission.installation_address } }],
      },
      'Link Sharelock': {
        url: submission.sharelock_link || null,
      },
      'Tanggal Instalasi': {
        date: { start: submission.installation_date },
      },
      Promo: {
        rich_text: [{ text: { content: submission.promo || '' } }],
      },
      'Foto KTP': {
        url: submission.ktp_photo_url,
      },
      'Foto Depan Rumah': {
        url: submission.front_house_photo_url || null,
      },
      'Tanggal Daftar': {
        date: { start: new Date().toISOString() },
      },
      Status: {
        select: { name: 'Baru' },
      },
    },
  })

  return response.id
}
