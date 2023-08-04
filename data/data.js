const ROLE = {
     ADMIN: 'admin',
     BASIC: 'basic'
}

module.exports = {
     ROLE: ROLE,
     users: [
               {id: 1, name: 'Kyle', role: ROLE.ADMIN},
               {id: 2, name: 'Sally', role: ROLE.BASIC},
               {id: 3, name: 'Joe', role: ROLE.BASIC},
     ],
     projects: [
        {id: 1, name: "Kyle's project", role: ROLE.ADMIN},
        {id: 2, name: "Sally's project", role: ROLE.BASIC},
        {id: 3, name: "Joe's project", role: ROLE.BASIC}
     ]

}