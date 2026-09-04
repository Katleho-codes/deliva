import api, { getApiErrorMessage } from "@/lib/api";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import socket from "../socket";

export type TReview = {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    reviewer_name: string;
    reviewer_image: string | null;
};

const useStoreReviews = (slug: string) => {
    const [reviews, setReviews] = useState<TReview[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        if (!slug) return;
        setReviewsLoading(true);
        try {
            const { data } = await api.get(`/api/stores/${slug}/reviews`);
            setReviews(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const submitReview = async (rating: number, comment: string) => {
        setSubmitting(true);
        try {
            await api.post(`/api/stores/${slug}/reviews`, { rating, comment });
            toast.success("Review submitted!");
            fetchReviews();
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not submit review"));
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        socket.on(
            "store_review:created",
            (data: { store_slug: string; review: TReview }) => {
                // only update if the review is for this store
                if (data.store_slug === slug) {
                    setReviews((prev) => [data.review, ...prev]);
                }
            },
        );

        return () => {
            socket.off("store_review:created");
        };
    }, [slug]);

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    return { reviews, reviewsLoading, submitReview, submitting };
};

export default useStoreReviews;
