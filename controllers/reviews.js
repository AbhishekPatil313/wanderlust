const Listing = require("../models/listing.js")
const Review = require("../models/review.js")
module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    console.log(listing);
    let newReview = new Review (req.body.review);
    console.log(newReview);
    newReview.author = req.user._id;

    await listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    
    console.log("new review sendd!!!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async(req,res)=>{
    let {id , reviewId} = req.params;
    console.log(req.params);
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}