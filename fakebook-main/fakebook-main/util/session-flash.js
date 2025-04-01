function sessionData(req){
    const sessiondata = req.session.falsheddata
    req.session.flasheddata = null

    return sessiondata
}  

function flasheddata(req,data,action){
    req.session.flasheddata = data
    req.session.save(action)

}
module.exports={
    sessionData:sessionData,
    flasheddata:flasheddata
}