const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

/**
 * @desc        Get reviews
 * @route       GET /api/v1/reviews
 * @route       GET /api/v1/bootcamps/:bootcampId/reviews
 * @access      Public
 */
exports.getReviews = asyncHandler(async (req, res, next) =>{
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

/**
 * @desc        Get single review
 * @route       GET /api/v1/reviews/:id
 * @access      Public
 */
exports.getReview = asyncHandler(async (req, res, next) =>{
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review) {
        return next(
            new ErrorResponse(`Review with id ${req.params.id} not found`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: review
    })
});

/**
 * @desc        Add review
 * @route       POST /api/v1/bootcamps/:bootcampId/reviews
 * @access      Private/User
 */
exports.addReview = asyncHandler(async (req, res, next) =>{
    if (!req.params.bootcampId) {
        return next(
            new ErrorResponse(`Bad call of this endpoint, without bootcampId`, 400)
        );
    }

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp with id ${req.params.bootcampId} not found`, 404)
        );
    }

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    });
});

/**
 * @desc        Update review
 * @route       PUT /api/v1/reviews/:id
 * @access      Private/User
 */
exports.updateReview = asyncHandler(async (req, res, next) =>{
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(`Review with id ${req.params.id} not found`, 404)
        );
    }

    // Validate if the user is the owner of this review or an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`Not authorized to access this resource`, 401)
        );
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    });
});

/**
 * @desc        Delete review
 * @route       DELETE /api/v1/reviews/:id
 * @access      Private/User
 */
exports.deleteReview = asyncHandler(async (req, res, next) =>{
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(`Review with id ${req.params.id} not found`, 404)
        );
    }

    // Validate if the user is the owner of this review or an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`Not authorized to access this resource`, 401)
        );
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});