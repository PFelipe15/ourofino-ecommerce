'use server'
import { clerkClient } from '@clerk/nextjs/server'

export async function SubmitAddress(userId: string  , address: any) {
  const user = await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
        address: address,

    },
  })
  if(user){
    return true
  }
  return false
 
}