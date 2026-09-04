"use client"

import { useState } from "react"
import { StarRating } from "@/components/StarRating"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSession } from "@/lib/auth-client"
import useStoreReviews from "@/hooks/stores/store-reviews"

function ReviewSection({ slug, deliveredOrderId }: {
    slug: string
    deliveredOrderId?: number  // pass if user has a delivered order from this store
}) {
    const { reviews, reviewsLoading, submitReview, submitting } = useStoreReviews(slug)
    const { data: session } = useSession()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [showForm, setShowForm] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!rating) { return }

        await submitReview(rating, comment)
        setShowForm(false)
        setRating(0)
        setComment("")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    Reviews <span className="text-[#999] font-normal text-sm">({reviews.length})</span>
                </h2>
                {/* {session && deliveredOrderId && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Cancel" : "Write a review"}
                    </Button>
                )} */}
                {session && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Cancel" : "Write a review"}
                    </Button>
                )}
            </div>

            {/* review form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-cardline p-5 space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Your rating</p>
                        <StarRating
                            rating={rating}
                            interactive
                            onChange={setRating}
                            size="lg"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Comment <span className="text-[#999]">(optional)</span></p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            placeholder="How was your experience?"
                            className="w-full rounded-xl border border-[#E5E4DF] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#F86624] bg-white"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!rating || submitting}
                        className="w-full bg-[#F15025] hover:bg-[#F86624]"
                    >
                        {submitting ? "Submitting..." : "Submit review"}
                    </Button>
                </form>
            )}

            {/* reviews list */}
            {reviewsLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="gap-0 p-4 shadow-none border-cardline animate-pulse">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-slate-100 rounded-full" />
                                <div className="h-4 bg-slate-100 rounded w-24" />
                            </div>
                            <div className="h-3 bg-slate-100 rounded w-full mt-2" />
                        </Card>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <Card className="gap-0 p-10 shadow-none border-cardline text-center">
                    <p className="text-2xl mb-2">⭐</p>
                    <p className="text-sm font-medium">No reviews yet</p>
                    <p className="text-xs text-[#999] mt-1">Be the first to review this store</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {reviews.map(review => (
                        <Card key={review.id} className="gap-0 p-4 shadow-none border-cardline">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#F5F4F0] flex items-center justify-center shrink-0">
                                        {review.reviewer_image ? (
                                            <img src={review.reviewer_image} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-medium text-[#666]">
                                                {review.reviewer_name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#191919]">{review.reviewer_name}</p>
                                        <p className="text-xs text-[#999]">
                                            {new Date(review.created_at).toLocaleDateString("en-ZA", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <StarRating rating={review.rating} size="sm" />
                            </div>
                            {review.comment && (
                                <p className="text-sm text-[#666] mt-3 leading-relaxed">
                                    {review.comment}
                                </p>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ReviewSection