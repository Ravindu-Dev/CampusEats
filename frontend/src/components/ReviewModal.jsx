import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import reviewService from '../services/reviewService'
import { imgbbService } from '../services/imgbbService'

function ReviewModal({ isOpen, onClose, order, existingReview, onReviewSubmitted }) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [existingImageUrl, setExistingImageUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [show, setShow] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef(null)

    const isEditMode = !!existingReview

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShow(true), 50)
            if (isEditMode) {
                setRating(existingReview.rating || 0)
                setComment(existingReview.comment || '')
                setExistingImageUrl(existingReview.imageUrl || null)
                setImageFile(null)
                setImagePreview(null)
            }
        } else {
            setShow(false)
        }
    }, [isOpen, isEditMode, existingReview])

    if (!isOpen) return null

    const handleImageSelect = (file) => {
        if (!file) return
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB')
            return
        }
        setError('')
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setExistingImageUrl(null)
    }

    const handleFileChange = (e) => {
        handleImageSelect(e.target.files[0])
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleImageSelect(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setDragOver(false)
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setExistingImageUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (rating === 0) {
            setError('Please select a rating')
            return
        }

        setLoading(true)
        setError('')

        try {
            let imageUrl = existingImageUrl || null

            // Upload new image if selected
            if (imageFile) {
                setUploadingImage(true)
                try {
                    imageUrl = await imgbbService.uploadImage(imageFile)
                } catch (uploadErr) {
                    setError('Failed to upload image. Please try again.')
                    setLoading(false)
                    setUploadingImage(false)
                    return
                }
                setUploadingImage(false)
            }

            if (isEditMode) {
                await reviewService.updateReview(existingReview.id, {
                    rating: rating,
                    comment: comment.trim() || null,
                    imageUrl: imageUrl || ''
                })
            } else {
                const canteenId = order.orderItems[0]?.canteenId
                await reviewService.createReview({
                    orderId: order.id,
                    canteenId: canteenId,
                    rating: rating,
                    comment: comment.trim() || null,
                    imageUrl: imageUrl
                })
            }

            setSuccess(true)
            setLoading(false)
            setTimeout(() => {
                resetAndClose()
                onReviewSubmitted()
            }, 1500)
        } catch (err) {
            console.error('Error submitting review:', err)
            const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Failed to submit review. Please try again.'
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
            setLoading(false)
        }
    }

    const resetAndClose = () => {
        setShow(false)
        setTimeout(() => {
            setRating(0)
            setHoverRating(0)
            setComment('')
            setImageFile(null)
            setImagePreview(null)
            setExistingImageUrl(null)
            setError('')
            setSuccess(false)
            setUploadingImage(false)
            setDragOver(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
            onClose()
        }, 200)
    }

    const handleClose = () => {
        if (!loading) resetAndClose()
    }

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    const currentPreview = imagePreview || existingImageUrl

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Scrollable container */}
            <div className="absolute inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div
                        className={`relative w-full max-w-lg my-6 transform transition-all duration-300 ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
                    >
                        {/* Glass card */}
                        <div className="bg-[#111]/95 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">

                            {/* Top ambient glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent rounded-full" />

                            {/* Header */}
                            <div className="px-7 pt-7 pb-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                                        <span className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </span>
                                        {isEditMode ? 'Edit Review' : 'Write a Review'}
                                    </h2>
                                    <button
                                        onClick={handleClose}
                                        disabled={loading}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="px-7 pb-7 pt-5">
                                {/* Order Details — only show in create mode */}
                                {!isEditMode && order && (
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-6">
                                        <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Order Details
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/30 text-xs">Order ID</span>
                                                <span className="text-white/60 text-xs font-mono">{order.id.substring(0, 12)}...</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/30 text-xs">Canteen</span>
                                                <span className="text-white/60 text-xs font-medium">{order.orderItems[0]?.canteenName}</span>
                                            </div>
                                            <div className="border-t border-white/[0.04] pt-2 mt-2">
                                                <span className="text-white/30 text-xs">Items</span>
                                                <div className="mt-1 space-y-1">
                                                    {order.orderItems.map((item, index) => (
                                                        <p key={index} className="text-white/50 text-xs pl-3">
                                                            • {item.name} ×{item.quantity}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Edit mode info */}
                                {isEditMode && (
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span className="text-white/50 text-xs font-medium">Editing review for <span className="text-orange-400 font-bold">{existingReview.canteenName}</span></span>
                                        </div>
                                    </div>
                                )}

                                {/* Success Message */}
                                {success && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm font-medium">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {isEditMode ? 'Review updated successfully!' : 'Review submitted successfully!'}
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                {/* Review Form */}
                                <form onSubmit={handleSubmit}>
                                    {/* Star Rating */}
                                    <div className="mb-6">
                                        <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                            Your Rating <span className="text-red-400">*</span>
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="focus:outline-none transform transition-all hover:scale-110 active:scale-95"
                                                >
                                                    <svg
                                                        className={`w-10 h-10 transition-all duration-200 ${star <= (hoverRating || rating)
                                                            ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                                                            : 'text-white/10'
                                                            }`}
                                                        fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                        />
                                                    </svg>
                                                </button>
                                            ))}
                                            {rating > 0 && (
                                                <span className="ml-3 text-sm font-bold text-amber-400">
                                                    {ratingLabels[rating]}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div className="mb-6">
                                        <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Your Review <span className="text-white/20 font-normal normal-case">(Optional)</span>
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your experience with this order..."
                                            rows={3}
                                            maxLength={500}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none disabled:opacity-50"
                                            disabled={loading}
                                        />
                                        <p className="text-white/20 text-xs mt-1.5 text-right">
                                            {comment.length}/500
                                        </p>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="mb-6">
                                        <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Food Photo <span className="text-white/20 font-normal normal-case">(Optional)</span>
                                        </label>

                                        {currentPreview ? (
                                            <div className="relative group">
                                                <div className="relative rounded-xl overflow-hidden border border-white/[0.08]">
                                                    <img
                                                        src={currentPreview}
                                                        alt="Food preview"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={removeImage}
                                                            disabled={loading}
                                                            className="px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Remove Photo
                                                        </button>
                                                    </div>
                                                </div>
                                                {uploadingImage && (
                                                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-orange-400" />
                                                            Uploading...
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-6 text-center ${
                                                    dragOver
                                                        ? 'border-orange-500/50 bg-orange-500/5'
                                                        : 'border-white/[0.08] hover:border-orange-500/30 hover:bg-white/[0.02]'
                                                }`}
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                                        dragOver ? 'bg-orange-500/15' : 'bg-white/[0.04]'
                                                    }`}>
                                                        <svg className={`w-6 h-6 transition-colors ${dragOver ? 'text-orange-400' : 'text-white/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-white/30 text-xs font-medium">
                                                        <span className="text-orange-400 font-bold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-white/15 text-[11px]">JPG, PNG, GIF, WebP • Max 5MB</p>
                                                </div>
                                            </div>
                                        )}

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3 bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || rating === 0}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                                                    {uploadingImage ? 'Uploading...' : 'Submitting...'}
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {isEditMode ? 'Update Review' : 'Submit Review'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

ReviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    order: PropTypes.object,
    existingReview: PropTypes.object,
    onReviewSubmitted: PropTypes.func.isRequired
}

export default ReviewModal
