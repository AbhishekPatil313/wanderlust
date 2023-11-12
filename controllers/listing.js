const Listing = require ("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings}); 
};


module.exports.renderNewForm = (req,res)=>{
    
    res.render("listings/new.ejs");
};


module.exports.showListing = async(req,res)=>{
    let {id}=req.params;
    const listing =  await Listing.findById(id)
    .populate({
        path : "reviews",
        populate:{
            path : "author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing doesn't exit");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async(req,res,next)=>{
    
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send();
        
      
  

    let url = req.file.path;
    let filename = req.file.filename ;
   
   
    const newlisting = new Listing(req.body.listing);
    
    newlisting.owner = req.user._id; 
    newlisting.image = {url , filename};
    newlisting.geometry = response.body.features[0].geometry;
    await newlisting.save();
   
    req.flash("success","New listing created !!!");
    res.redirect("/listings");
} 

module.exports.editListing = async(req,res)=>{
    let {id}=req.params;
    const listing =  await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing doesn't exit");
        res.redirect("/listings");
    }
    let orignalImageUrl = listing.image.url;
    orignalImageUrl= orignalImageUrl.replace("/upload","/upload/w_256");
    res.render("listings/edit.ejs",{listing,orignalImageUrl})
}

module.exports.updateListing = async(req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
       return res.redirect(`/listings/${id}`);
    }
    let newlisting =  await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename ;
    newlisting.image = {url , filename}; 
    await newlisting.save();
    }
    req.flash("success","Listing Updated successfully !!!");
    res.redirect(`/listings/${id}`)
}


module.exports.destroyListing = async(req,res)=>{
    let {id}=req.params;
    const dellisting =  await Listing.findByIdAndDelete(id);
    console.log(dellisting);
    req.flash("success","Listing deleted successfully !!!");
    res.redirect(`/listings`);
}