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
    console.log(getTokenFrom(req))
    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
    req.user = {...decodedToken, token:getTokenFrom(req)}
    console.log('decoded == ', decodedToken)
    next()
  }catch(error){
    res.status(401).send(error)
  }
}

module.exports = {authenticateUser}