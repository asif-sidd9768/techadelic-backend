const sortPost = (posts) => {
  return [...posts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

module.exports = {sortPost}