const jwt = require("jsonwebtoken")

const getTokenFrom = (req, res) => {
  const authorization = req.get("authorization")
  if(authorization && authorization.startsWith("Bearer ")){
    return authorization.replace("Bearer ", "")
  }
  return null
}

const authenticateUser = async (req, res, next) => {
  try{
    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
    req.user = {...decodedToken, token:getTokenFrom(req)}
    next()
  }catch(error){
    res.status(401).send(error)
  }
}

module.exports = {authenticateUser}