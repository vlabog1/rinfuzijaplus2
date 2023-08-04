module.exports = function setProject(req, res, next) {
      const projectId = parseInt(req.params.projectId)
      req.project = project.find(project => project.id === projectId)

      if(req.project == null) {
           res.status(404)
           return res.send('Project not found')
      }
}