function authUser(req, res, next) {
       if(req.user == null) {
             res.sttus(403) 
              return res.send('Yo need to sign in')
       }
       next()
}

function authRole(role) {
             return (req, res, next) => {
                   if(req.user.role !== role) {
                         res.status(401)
                          return res.send('Not allowed')
                   }

                   next()
             }
}

module.exports = {
       authUser,
       authRole
}