import { stripe } from "$lib/server/stripe.server"
import { error, json } from "@sveltejs/kit"

export const GET = async ({ locals: { user, getProfile } }) => {
    if (!user) throw error(401, "Unauthorized")
    
    const profile = await getProfile()
    if (!profile?.stripe) throw error(403, "Stripe account required")

    try {
        // List coupons for the specific connected account
        const coupons = await stripe.coupons.list({
            stripeAccount: profile.stripe
        })
        return json(coupons.data)
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to fetch coupons")
    }
}

export const POST = async ({ request, locals: { user, getProfile } }) => {
    if (!user) throw error(401, "Unauthorized")
    
    const profile = await getProfile()
    if (!profile?.stripe) throw error(403, "Stripe account required")

    const data = await request.json()
    
    try {
        const coupon = await stripe.coupons.create({
            percent_off: data.percent_off,
            duration: data.duration,
            duration_in_months: data.duration === 'repeating' ? data.duration_in_months : undefined,
            name: data.name,
            max_redemptions: data.max_redemptions,
            metadata: data.metadata
        }, {
            stripeAccount: profile.stripe // Create coupon on the connected account
        })
        return json(coupon)
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to create coupon")
    }
}

export const DELETE = async ({ url, locals: { user, getProfile } }) => {
    if (!user) throw error(401, "Unauthorized")
    
    const profile = await getProfile()
    if (!profile?.stripe) throw error(403, "Stripe account required")

    const couponId = url.searchParams.get('id')
    if (!couponId) throw error(400, "Coupon ID is required")

    try {
        const deleted = await stripe.coupons.del(couponId, {
            stripeAccount: profile.stripe // Delete from connected account
        })
        return json(deleted)
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to delete coupon")
    }
} 