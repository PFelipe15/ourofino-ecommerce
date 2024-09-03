import { IncomingHttpHeaders } from "http";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";

const webhookSecret = process.env.CLERCK_WEBHOOK_SECRET || ''
const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN || ''
type EventType = 'user.created' | 'user.updated' | '*';
type Event = {
  data: EventDataType;
  object: "event";
  type: EventType;
};

type EventDataType = {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: EmailAddressType[];
  primary_email_address_id: string;
  attributes: Record<string, string | number>;
  phone_numbers: string[];
};

type EmailAddressType = {
  id: string;
  email_address: string
};
async function handler(request:Request ){
  const payload = await request.json();
  const headerList = headers()
  const heads = {
    "svix-id":headerList.get('svix-id'),
    'svix-timestamp':headerList.get('svix-timestamp'),
    'svix-signature':headerList.get('svix-signature'),
  }
  const wh = new Webhook(webhookSecret)
  let evt:Event|null = null


  try {
    evt = wh.verify(
        JSON.stringify(payload),
        heads as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event
  } catch (err) {
    console.error((err as Error).message)
    return NextResponse.json({}, {status:400})
  }

const eventType:EventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated'){
    const {
        id,
        first_name,
        last_name,
        email_addresses,
        primary_email_address_id,
        phone_numbers
        ...attributes

      } = evt.data


 fetch('https:/6bc81c-70.myshopify.com/admin/api/2024-04/customers.json',{
    method:'POST',
    headers:{
        'Content-Type':'application/json',
        'X-Shopify-Access-Token':shopifyAccessToken
    },
    body:JSON.stringify({
        customer:{
            first_name,
            last_name,
            email:email_addresses[0].email_address,
            verified_email:true,
            tags:['clerk-webhook'],
        }
    })
 })

     
    }

    return NextResponse.json({}, {status:200})

  }



export const GET = handler
export const POST =handler
export const PUT =handler